// app/.server/database.js
import { client } from "../.server/mongo";

let db = client.db("mpesa");
let payments = db.collection("payments");

export async function addPayments(payment) {
  return payments.insertOne(payment);
}

// export async function getLatestPaymentByPhone(phone) {
//   return payments.find({ phone }).sort({ createdAt: -1 }).limit(1).next();
// }
export async function getPaymentByCheckoutId(checkoutId) {
  return payments
    .find({ checkoutId: String(checkoutId) })
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
}
export async function updateLatestPayment(checkoutId, updateData) {
  return payments.findOneAndUpdate(
    { checkoutId: String(checkoutId) },
    { $set: { ...updateData, updatedAt: new Date() } },
    { sort: { createdAt: -1 }, returnDocument: "after", upsert: true }
  );
}

// export async function getPaymentByReceipt(receipt) {
//   return payments.findOne({ receipt });
// }
