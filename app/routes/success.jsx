import { getLatestPaymentByPhone } from "../model/database";

export async function loader({ request }) {
  let url = new URL(request.url);
  let phone = url.searchParams.get("phone");
  let payment = await getLatestPaymentByPhone(phone);

  if (!payment) return { message: " Still pending..." };
  if (payment.resultCode === 0) {
    return {
      message: ` Success. Amount: ${payment.amount}, Receipt: ${payment.receipt}`,
    };
  }
  return { message: `Failed: ${payment.resultDesc}` };
}

export default function Success({ loaderData }) {
  let data = loaderData;
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Payment Confirmation</h2>
      <p>{data.message}</p>
    </div>
  );
}
