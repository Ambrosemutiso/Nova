import { NextResponse } from "next/server";
import axios from "axios";
import Installment from "@/app/models/InstallmentOrder";
import InstallmentPayment from "@/app/models/InstallmentPayment";
import { dbConnect } from "@/lib/dbConnect";
import moment from 'moment';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { phone, amount, planId } = await req.json();

    if (!phone || !amount || !planId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate plan
    const plan = await Installment.findById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: "Installment plan not found" },
        { status: 404 }
      );
    }

    // Safaricom Credentials
    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    const callbackUrl = `${process.env.API_URL}/api/installments/stk/callback`;

    // Generate access token
    const tokenRes = await axios.get(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        auth: { username: consumerKey, password: consumerSecret },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Timestamp
    const timestamp = moment().format('YYYYMMDDHHmmss');
    // Password
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
      "base64"
    );

    // Format phone
    let formattedPhone = phone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    }

    // STK push request
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `PLAN-${planId}`,
      TransactionDesc: "Installment Payment",
    };

    const stkResponse = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPayload,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // Record payment attempt
    const payment = await InstallmentPayment.create({
      planId: plan._id,
      amount,
      phone: formattedPhone,
      status: "pending",
      merchantRequestId: stkResponse.data.MerchantRequestID,
      checkoutRequestId: stkResponse.data.CheckoutRequestID,
    });

    return NextResponse.json({
      success: true,
      message: "STK push initiated",
      checkoutRequestId: stkResponse.data.CheckoutRequestID,
      merchantRequestId: stkResponse.data.MerchantRequestID,
      paymentId: payment._id,
    });
  } catch (error: any) {
    console.error("STK ERROR:", error?.response?.data || error.message);
    return NextResponse.json(
      { error: error?.response?.data || "STK push failed" },
      { status: 500 }
    );
  }
}
