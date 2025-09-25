// app/routes/home.jsx
import { Form, redirect } from "react-router";
import { stkPush, normalizePhone } from "../.server/stkpush.js";

export async function action({ request }) {
  const formData = await request.formData();
  const phone = normalizePhone(formData.get("phone"));
  const amount = formData.get("amount");

  const safResponse = await stkPush({ phone, amount });
  if (safResponse.errorCode) return redirect("/home");

  return redirect(`/success?phone=${phone}`);
}

export default function Payments() {
  return (
    <main className="px-6 max-w-3xl mx-auto mt-40 text-gray-950">
      <h1 className="text-3xl font-bold">Welcome To Mobile Payments</h1>
      <Form method="post">
        <input
          required
          type="tel"
          name="phone"
          placeholder="+2547XXXXXXXX"
          className="border-2 mb-2 rounded-sm my-4 p-3 w-full"
        />
        <input
          required
          type="number"
          name="amount"
          placeholder="Enter amount"
          className="border-2 mb-2 rounded-sm my-4 p-3 w-full"
        />
        <button type="submit" className="bg-green-400 rounded-sm p-2 w-full">
          Pay with M-PESA
        </button>
      </Form>
    </main>
  );
}
