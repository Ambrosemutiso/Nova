import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';
import WalletTransaction from '@/app/models/walletTransaction';

export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();

  /*
    Expect:
    - CheckoutRequestID
    - ResultCode
    - Amount
    - AccountReference (transactionId)
  */

  const {
    ResultCode,
    Amount,
    AccountReference,
  } = data;

  const tx = await WalletTransaction.findById(AccountReference);
  if (!tx || tx.status !== 'PENDING') {
    return Response.json({ ok: false });
  }

  if (ResultCode !== 0) {
    tx.status = 'FAILED';
    await tx.save();
    return Response.json({ ok: true });
  }

  const user = await User.findById(tx.userId);
  if (!user) return Response.json({ ok: false });

  // 💰 Credit wallet
  user.novaCoins += Amount;
  await user.save();

  tx.status = 'COMPLETED';
  await tx.save();

  return Response.json({ ok: true });
}
