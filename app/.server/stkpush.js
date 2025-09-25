import { addPayments } from "../model/database";

export async function stkPush({ phone, amount }) {
  let shortcode = process.env.Mpesa_Paybill;
  let passkey = process.env.pass_key;
  let timestamp = generateTimestamp();
  let password = Buffer.from(shortcode + passkey + timestamp).toString(
    "base64"
  );

  // Save as pending before Safaricom callback
  await addPayments({
    phone: phone.toString(),
    amount: amount.toString(),
    resultCode: null,
    resultDesc: "Pending",
    createdAt: new Date(),
  });

  let payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: parseFloat(amount),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: "https://online-payments-plum.vercel.app/api/mpesa",
    AccountReference: `Order${timestamp}`,
    TransactionDesc: "Payment Test",
  };

  let token = await getMpesaToken();
  let res = await fetch(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  return res.json();
}
function generateTimestamp() {
  let date = new Date();
  let YYYY = date.getFullYear();
  let MM = String(date.getMonth() + 1).padStart(2, "0");
  let DD = String(date.getDate()).padStart(2, "0");
  let HH = String(date.getHours()).padStart(2, "0");
  let mm = String(date.getMinutes()).padStart(2, "0");
  let ss = String(date.getSeconds()).padStart(2, "0");
  return `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
}
export function normalizePhone(phone) {
  if (!phone) return "";
  phone = phone.toString().trim();
  if (phone.startsWith("0")) {
    return "254" + phone.substring(1);
  }
  if (phone.startsWith("+")) {
    return phone.substring(1);
  }
  return phone;
}
