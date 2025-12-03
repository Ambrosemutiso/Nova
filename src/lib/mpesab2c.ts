// lib/mpesaB2C.ts
import axios from "axios";

export async function initiateB2CPayment(
  phoneNumber: string,
  amount: number
): Promise<any> {
  try {
    if (!phoneNumber) throw new Error("Phone number is required.");
    if (!amount) throw new Error("Amount is required.");

    // Validate required environment variables
    const {
      MPESA_CONSUMER_KEY,
      MPESA_CONSUMER_SECRET,
      MPESA_INITIATOR_NAME,
      MPESA_SECURITY_CREDENTIAL,
      MPESA_SHORTCODE,
      MPESA_TIMEOUT_URL,
      MPESA_RESULT_URL
    } = process.env;

    if (
      !MPESA_CONSUMER_KEY ||
      !MPESA_CONSUMER_SECRET ||
      !MPESA_INITIATOR_NAME ||
      !MPESA_SECURITY_CREDENTIAL ||
      !MPESA_SHORTCODE ||
      !MPESA_TIMEOUT_URL ||
      !MPESA_RESULT_URL
    ) {
      throw new Error("Missing required M-Pesa environment variables.");
    }

    // Generate OAuth token
    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        auth: {
          username: MPESA_CONSUMER_KEY,
          password: MPESA_CONSUMER_SECRET,
        },
      }
    );

    const token: string = tokenResponse.data.access_token;

    // B2C payment request
    const res = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
      {
        InitiatorName: MPESA_INITIATOR_NAME,
        SecurityCredential: MPESA_SECURITY_CREDENTIAL,
        CommandID: "BusinessPayment",
        Amount: amount,
        PartyA: Number(MPESA_SHORTCODE),
        PartyB: phoneNumber,
        Remarks: "Earnings Withdrawal",
        QueueTimeOutURL: MPESA_TIMEOUT_URL,
        ResultURL: MPESA_RESULT_URL,
        Occasion: "Withdrawal",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("B2C Axios Error:", err.response?.data || err.message);
    } else if (err instanceof Error) {
      console.error("B2C Error:", err.message);
    } else {
      console.error("Unknown B2C Error:", err);
    }

    throw new Error("Failed to process B2C payment");
  }
}
