import { getMpesaAccessToken } from "./mpesaAccessToken";

export async function initiateB2CPayment(
  phone: string,
  amount: number
): Promise<any> {
  const { access_token } = await getMpesaAccessToken();

  const url =
    process.env.MPESA_ENV === "sandbox"
      ? "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest"
      : "https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";

  const body = {
    InitiatorName: process.env.MPESA_INITIATOR_NAME!,
    SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL!,
    CommandID: process.env.MPESA_B2C_COMMAND_ID!,
    Amount: Number(amount),
    PartyA: process.env.MPESA_SHORTCODE!,
    PartyB: phone.replace("+", ""), // clean phone number
    Remarks: "Withdrawal Payment",
    QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL!,
    ResultURL: process.env.MPESA_RESULT_URL!,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data;
}
