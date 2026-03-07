import { NextRequest, NextResponse } from 'next/server';
import Wallet from '@/app/models/wallet';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const wallet = await Wallet.findOne({ userId });

    return NextResponse.json({
      hasPin: !!wallet?.pinHash,
    });

  } catch (error) {
    console.error('[CHECK PIN ERROR]', error);

    return NextResponse.json(
      { message: 'Failed to check PIN' },
      { status: 500 }
    );
  }
}