// lib/payments.ts
import axios from "axios";
import moment from 'moment';

const baseUrl = "https://sandbox.safaricom.co.ke"; // change to live when you go live

// Get OAuth token from Safaricom
async function getMpesaToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return response.data.access_token;
}

export async function initiateMpesaPush(phone: string, amount: number) {
  try {
    const token = await getMpesaToken();

    const shortcode = process.env.MPESA_SHORTCODE!; // till or paybill
    const passkey = process.env.MPESA_PASSKEY!;
   const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone, // customer phone number (2547XXXXXXXX)
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: "https://yourdomain.com/api/seller/payment/mpesa/callback",
      AccountReference: "ShopUpgrade",
      TransactionDesc: "Shop Plan Upgrade",
    };

    const response = await axios.post(`${baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.ResponseCode === "0") {
      return {
        success: true,
        transactionId: response.data.CheckoutRequestID,
      };
    } else {
      return {
        success: false,
        error: response.data.errorMessage || "STK Push failed",
      };
    }
  } catch (err: any) {
    console.error("M-Pesa STK error:", err.response?.data || err.message);
    return { success: false, error: err.message };
  }
}

export async function initiateAirtelPush(phone: string, amount: number) {
  try {
    // Airtel Money integration goes here
    return { success: true, transactionId: "AIRTEL123456" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
