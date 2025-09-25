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

export async function updateLatestPayment(phone, updateData) {
  return payments.findOneAndUpdate(
    { phone: String(phone) },
    { $set: { ...updateData, updatedAt: new Date() } },
    { sort: { createdAt: -1 }, returnDocument: "after", upsert: true }
  );
}

// export async function getPaymentByReceipt(receipt) {
//   return payments.findOne({ receipt });
// }
