import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import PaymentIntent from '@/app/models/paymentIntent';
import Installment from '@/app/models/InstallmentOrder';
import InstallmentPayment from '@/app/models/InstallmentPayment';

export async function POST(req: Request) {
  await dbConnect();

  const data = await req.json();
  const intentId = data.AccountReference;

  const intent = await PaymentIntent.findById(intentId);
  if (!intent) return NextResponse.json({ ok: false });

  intent.status = 'paid';
  await intent.save();

  // 🔥 Resolve by purpose
  if (intent.purpose === 'installment-deposit') {
    await Installment.findByIdAndUpdate(intent.refId, {
      depositPaid: true,
      status: 'active',
    });
  }

  if (intent.purpose === 'installment-monthly') {
    await InstallmentPayment.create({
      planId: intent.refId,
      amount: intent.amount,
      method: intent.method,
    });
  }

  // order payment logic stays intact

  return NextResponse.json({ ok: true });
}
