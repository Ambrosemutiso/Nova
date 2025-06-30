// app/api/sellers/follow/route.ts
import Seller from '@/app/models/seller';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: Request) {
  await dbConnect();
  const { sellerId, userId } = await req.json();

  try {
    await Seller.findByIdAndUpdate(
      sellerId,
      {
        $addToSet: { followers: { userId, followedAt: new Date() } },
      },
      { new: true }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, error: 'Could not follow seller' }, { status: 500 });
  }
}
