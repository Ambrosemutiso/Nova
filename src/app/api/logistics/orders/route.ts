import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import LogisticsOrder from '@/app/models/orders';
import { PipelineStage } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status') || undefined;
    const sellerId = searchParams.get('sellerId') || undefined;
    const search = searchParams.get('search')?.toLowerCase() || undefined;
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (sellerId) query.sellerId = sellerId;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // 🛠 Wrap $or inside $match
    const matchSearch: PipelineStage.Match | null = search
      ? {
          $match: {
            $or: [
              { 'user.name': { $regex: search, $options: 'i' } },
              { 'items.name': { $regex: search, $options: 'i' } }
            ]
          }
        }
      : null;

    const pipeline: PipelineStage[] = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'sellers',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' }
    ];

    if (matchSearch) {
      pipeline.push(matchSearch);
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    const orders = await LogisticsOrder.aggregate(pipeline);

    // Count pipeline
    const countPipeline: PipelineStage[] = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'sellers',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' }
    ];

    if (matchSearch) {
      countPipeline.push(matchSearch);
    }

    countPipeline.push({ $count: 'total' });

    const countResult = await LogisticsOrder.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching logistics orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
