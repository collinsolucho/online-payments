// app/.server/database.js
import { client } from "../.server/mongo";

const db = client.db("mpesa");
const payments = db.collection("payments");

export async function addPayments(payment) {
  return payments.insertOne(payment);
}

export async function getLatestPaymentByPhone(phone) {
  return payments.find({ phone }).sort({ createdAt: -1 }).limit(1).next();
}
export async function getPaymentByCheckoutId(CheckoutRequestID) {
  return payments
    .find({ CheckoutRequestID })
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
}
export async function updateLatestPayment(CheckoutID, updateData) {
  return payments.findOneAndUpdate(
    { checkoutId: String(checkoutId) },
    { $set: { ...updateData, updatedAt: new Date() } },
    { sort: { createdAt: -1 }, returnDocument: "after", upsert: false }
  );
}

// export async function getPaymentByReceipt(receipt) {
//   return payments.findOne({ receipt });
// }
