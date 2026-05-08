import axios from 'axios';
import moment from 'moment';

const consumerKey = process.env.MPESA_CONSUMER_KEY!;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
const shortCode = process.env.MPESA_SHORTCODE!;
const passkey = process.env.MPESA_PASSKEY!;
const tillNumber = process.env.MPESA_TILL_NUMBER!;
const callbackURL = process.env.MPESA_CALLBACK_URL!;

if (!callbackURL) {
  throw new Error('MPESA_CALLBACK_URL is not set');
}

export async function initiateSTKPush({
  phone,
  amount,
  accountReference,
  description = 'Payment',
}: {
  phone: string;
  amount: number;
  accountReference: string;
  description?: string;
}) {
  try {
    //Auth
    const auth = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString('base64');

const tokenRes = await axios.get(
  'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
  {
    headers: { Authorization: `Basic ${auth}` },
    timeout: 10000,
  }
);

    const accessToken = tokenRes.data.access_token;

    // Password
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(
      `${shortCode}${passkey}${timestamp}`
    ).toString('base64');

const formattedPhone = phone
  .replace('+', '')
  .replace(/^0/, '254');
  
    const stkRes = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: tillNumber,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackURL,
        AccountReference: accountReference,
        TransactionDesc: description,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 30000,
      }
    );

    console.log('STK PUSH ACCEPTED:', stkRes.data);

    return {
      ok: true,
      CheckoutRequestID: stkRes.data.CheckoutRequestID,
      MerchantRequestID: stkRes.data.MerchantRequestID,
      raw: stkRes.data,
    };
  } catch (err: any) {
    console.error('STK PUSH ERROR:', err.response?.data || err.message);
    return {
      ok: false,
      error: err.response?.data || err.message,
    };
  }
}
