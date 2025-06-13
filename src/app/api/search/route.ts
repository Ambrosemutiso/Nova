// app/api/search/route.js
import { NextRequest, NextResponse } from 'next/server';
import {dbConnect} from '@/lib/dbConnect';
import Product from '@/app/models/product';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
  }

  try {
    await dbConnect();

    const regex = new RegExp(query, 'i'); // case-insensitive
    const products = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { category: { $regex: regex } },
      ],
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

