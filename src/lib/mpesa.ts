// /lib/mpesa.ts
import axios from 'axios';
import moment from 'moment';

const consumerKey = process.env.MPESA_CONSUMER_KEY
const consumerSecret = process.env.MPESA_CONSUMER_SECRET
const shortCode = process.env.MPESA_SHORTCODE
const passkey = process.env.MPESA_PASSKEY
const callbackURL = 'https://yourdomain.com/api/checkout/mpesa/callback';

export async function initiateSTKPush({
  phone,
  amount,
  orderId,
}: {
  phone: string;
  amount: number;
  orderId: string;
}) {
  try {
    // 1. Get access token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenRes = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const accessToken = tokenRes.data.access_token;

    // 2. Generate timestamp & password
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // 3. Format phone (ensure it starts with 254)
    const formattedPhone = phone.startsWith('254') ? phone : phone.replace(/^0/, '254');

    // 4. Initiate STK Push
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
        AccountReference: `Order${orderId}`,
        TransactionDesc: 'Order Payment',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { CheckoutRequestID, MerchantRequestID } = stkRes.data;

    // Optionally: save these IDs to the order for future tracking
    return { success: true, CheckoutRequestID, MerchantRequestID };
  } catch (error: any) {
    console.error('STK Push error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}
