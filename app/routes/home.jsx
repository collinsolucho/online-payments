// app/routes/home.jsx
import { Form, redirect } from "react-router";
import { normalizePhone, stkPush } from "../.server/stkpush.js";
import { commitSession, getSession } from "../.server/session.js";

export async function action({ request }) {
  let session = await getSession(request.headers.get("Cookie"));
  let formData = await request.formData();
  let phone = normalizePhone(formData.get("phone"));
  let amount = formData.get("amount");

  let safResponse = await stkPush({ phone, amount });

  if (safResponse.errorCode) return redirect("/home");
  session.set("phone", phone);
  session.set("amount", amount);
  session.set("checkoutId", safResponse.CheckoutRequestID);

  return redirect(`/success`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
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
