import { data } from "react-router";
import { updateLatestPayment } from "../model/database";

export async function action({ request }) {
  console.log(" M-PESA Callback Hit");

  let body = await request.json();
  console.log("Body received:", JSON.stringify(body, null, 2));

  let stk = body?.Body?.stkCallback;
  if (!stk) return data({ status: "ignored" });

  let { ResultCode, ResultDesc, CallbackMetadata } = stk;

  // Defaults
  let phone = null;
  let amount = null;
  let receipt = null;
  let txDate = null;

  if (CallbackMetadata?.Item) {
    // Extract metadata
    CallbackMetadata.Item.forEach((item) => {
      if (item.Name === "PhoneNumber") phone = item.Value?.toString();
      if (item.Name === "Amount") amount = item.Value?.toString();
      if (item.Name === "MpesaReceiptNumber") receipt = item.Value;
      if (item.Name === "TransactionDate") txDate = item.Value;
    });
  }

  // ToDo: the logs and updates arent running
  console.log("Updating payment with:", {
    phone,
    amount,
    receipt,
    txDate,
    resultCode: ResultCode,
    resultDesc: ResultDesc,
  });

  // Update pending payment
  let updateData = {
    amount,
    receipt,
    txDate,
    resultCode: ResultCode,
    resultDesc: ResultDesc,
  };
  let result = await updateLatestPayment(phone, updateData);
  console.log(" Mongo Update Result:", result);
  console.log(` Payment updated for ${phone}`);
  return data({ status: "ok" });
}
