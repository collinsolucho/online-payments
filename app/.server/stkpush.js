import { addPayments } from "../model/database";
import { getSession } from "../.server/session.js";

// Function to request STK Push
export async function stkPush({ phone, amount, request }) {
  let session = await getSession(request.headers.get("Cookie"));
  if (!phone) phone = session.get("phone");
  if (!amount) amount = session.get("amount");
  // let checkoutId = session.get("checkoutId");
  let shortcode = process.env.Mpesa_Paybill;
  let passkey = process.env.pass_key;
  let timestamp = generateTimestamp();
  let password = Buffer.from(shortcode + passkey + timestamp).toString(
    "base64"
  );

  let payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: parseFloat(amount),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: "https://online-payments-pctp.vercel.app/mpesa", // update with your real callback URL
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

  if (!res.ok) {
    let errorText = await res.text();
    throw new Error(`STK Push request failed: ${errorText}`);
  }

  let response = res.json();
  console.log("response", response);
  // ✅ Only save after Safaricom gives CheckoutRequestID
  if (response.CheckoutRequestID) {
    await addPayments({
      phone: phone.toString(),
      amount: amount.toString(),
      resultCode: null,
      resultDesc: "Pending",
      checkoutId: response.CheckoutRequestID,
      createdAt: new Date(),
    });

    // Save to session
    session.set("checkoutId", response.CheckoutRequestID);
  }

  return response;
}

// Generate timestamp in Safaricom’s format YYYYMMDDHHMMSS
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

// Normalize phone to 254 format
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

// Function to get OAuth token from Safaricom
async function getMpesaToken() {
  let key = process.env.Consumer_Key;
  let secret = process.env.Consumer_Secret;
  let auth = Buffer.from(`${key}:${secret}`).toString("base64");

  let res = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  let data = await res.json();
  return data.access_token;
}
