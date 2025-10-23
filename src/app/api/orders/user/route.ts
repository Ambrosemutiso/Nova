import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 6; // Adjust per your pagination size
    const status = searchParams.get('status') || 'All';
    const search = searchParams.get('search')?.trim() || '';

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const query: any = { userId };

    // 🔍 Filter by status (if not "All")
    if (status !== 'All') {
      query.status = status;
    }

    // 🔎 Search in product names or city
    if (search) {
      query.$or = [
        { 'items.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.city': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (err) {
    console.error('❌ Error fetching user orders:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
