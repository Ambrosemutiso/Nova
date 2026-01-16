// /lib/mpesa.ts
import axios from 'axios';
import moment from 'moment';

const consumerKey = process.env.MPESA_CONSUMER_KEY!;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
const shortCode = process.env.MPESA_SHORTCODE!;
const passkey = process.env.MPESA_PASSKEY!;
const callbackURL =
  process.env.MPESA_CALLBACK_URL ||
  'https://yourdomain.com/api/payments/callback/mpesa';

export type STKPayload = {
  phone: string;
  amount: number;
  accountReference: string; // e.g. PAY-<paymentIntentId>
  description?: string;
};

export async function initiateSTKPush({
  phone,
  amount,
  accountReference,
  description = 'Payment',
}: STKPayload) {
  try {
    // 🔐 Get access token
    const auth = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString('base64');

    const tokenRes = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // ⏱️ Generate password
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(
      `${shortCode}${passkey}${timestamp}`
    ).toString('base64');

    const formattedPhone = phone.startsWith('254')
      ? phone
      : phone.replace(/^0/, '254');

    // 🚀 STK Push
    const stkRes = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackURL,
        AccountReference: accountReference,
        TransactionDesc: description,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      success: true,
      CheckoutRequestID: stkRes.data.CheckoutRequestID,
      MerchantRequestID: stkRes.data.MerchantRequestID,
    };
  } catch (error: any) {
    console.error(
      'STK Push error:',
      error.response?.data || error.message
    );
    return { success: false, error: error.message };
  }
}
