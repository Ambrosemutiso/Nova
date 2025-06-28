import { NextResponse } from 'next/server';
import { getSellerInfo } from '@/lib/getSellerDetails';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const seller = await getSellerInfo(params.id);
    return NextResponse.json(seller);
  } catch (error) {
    console.error('Error fetching seller info:', error);
    return NextResponse.json({ error: 'Failed to fetch seller info' }, { status: 500 });
  }
}
