import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 6;
    const status = searchParams.get('status') || 'All';
    const search = searchParams.get('search')?.trim() || '';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const query: any = { userId };

    // 🔍 Filter by status
    if (status !== 'All') {
      query.status = status;
    }

    // 🔎 Search in item name, county, or town
    if (search) {
      query.$or = [
        { 'items.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.county': { $regex: search, $options: 'i' } },
        { 'customerInfo.town': { $regex: search, $options: 'i' } },
      ];
    }

    // 📅 Date filter (createdAt)
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // include the full day
        query.createdAt.$lte = toDate;
      }
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

    // 🧾 Ensure structure for customerInfo
    orders.forEach((order: any) => {
      order.customerInfo = order.customerInfo || {
        name: '',
        phoneNumber: '',
        county: '',
        town: '',
      };
    });

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
