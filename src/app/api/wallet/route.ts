import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';
import WalletTransaction from '@/app/models/walletTransaction';

export async function GET(req: Request) {
  await dbConnect();

  const userId = req.headers.get('x-user-id'); // or session
  if (!userId) return Response.json({});

  const user = await User.findById(userId);
  const transactions = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);

  return Response.json({
    balance: user?.novaCoins || 0,
    transactions: transactions.map(tx => ({
      id: tx._id,
      type: tx.type,
      amount: tx.amount,
      label: tx.description,
      date: tx.createdAt.toDateString(),
    })),
  });
}
