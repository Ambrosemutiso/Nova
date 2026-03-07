import { getMpesaToken } from "@/lib/mpesaAccessToken";

export async function sendB2CPayment({
  amount,
  phone,
  remarks,
  transactionId,
}: {
  amount: number;
  phone: string;
  remarks: string;
  transactionId: string;
}) {
  const token = await getMpesaToken();

  const response = await fetch(
    "https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        InitiatorName: process.env.MPESA_INITIATOR_NAME,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: "BusinessPayment",
        Amount: amount,
        PartyA: process.env.MPESA_SHORTCODE,
        PartyB: phone,
        Remarks: remarks,
        QueueTimeOutURL: `${process.env.BASE_URL}/api/mpesa/b2c/timeout`,
        ResultURL: `${process.env.BASE_URL}/api/mpesa/b2c/result`,
        Occasion: transactionId,
      }),
    }
  );

  const data = await response.json();
  return data;
}