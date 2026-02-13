import axios from "axios";

const BASE_URL = process.env.NCBA_BASE_URL!;
const USERNAME = process.env.NCBA_USERNAME!;
const SECRET = process.env.NCBA_SECRET_KEY!;
const PAYBILL = process.env.NCBA_PAYBILL!;

// 🔐 1. Generate Access Token
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${USERNAME}:${SECRET}`).toString("base64");

  const response = await axios.get(
    `${BASE_URL}/payments/api/v1/auth/token`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 5000,
    }
  );

  return response.data.access_token;
}

// 🚀 2. Initiate STK Push
export async function initiateSTKPush({
  phone,
  amount,
  accountReference,
}: {
  phone: string;
  amount: number;
  accountReference: string;
}) {
  try {
    const accessToken = await getAccessToken();

    const formattedPhone = phone.startsWith("254")
      ? phone
      : phone.replace(/^0/, "254");

    const response = await axios.post(
      `${BASE_URL}/payments/api/v1/stk-push/initiate`,
      {
        TelephoneNo: formattedPhone,
        Amount: amount.toString(),
        PayBillNo: PAYBILL,
        AccountNo: accountReference,
        Network: "Safaricom",
        TransactionType: "CustomerPayBillOnline",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    console.log("✅ NCBA STK INITIATE:", response.data);

    return {
      ok: true,
      transactionId: response.data.TransactionID,
      referenceId: response.data.ReferenceID,
      raw: response.data,
    };
  } catch (error: any) {
    console.error("❌ NCBA STK ERROR:", error.response?.data || error.message);
    return {
      ok: false,
      error: error.response?.data || error.message,
    };
  }
}

// 🔎 3. Query STK Status
export async function querySTK(transactionId: string) {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${BASE_URL}/payments/api/v1/stk-push/query`,
      {
        TransactionID: transactionId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    console.log("🔎 STK QUERY RESPONSE:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("❌ STK QUERY ERROR:", error.response?.data || error.message);
    return {
      ok: false,
      error: error.response?.data || error.message,
    };
  }
}
