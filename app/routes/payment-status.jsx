import { data } from "react-router";
import { getLatestPaymentByPhone } from "../model/database";

export async function loader({ request }) {
  let url = new URL(request.url);
  let phone = url.searchParams.get("phone");

  if (!phone) {
    return;
    data(
      { error: "Phone required" },
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let payment = await getLatestPaymentByPhone(phone);
  return data(payment || { status: "pending" }, {
    headers: { "Content-Type": "application/json" },
  });
}
