import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      sellerId,
      delivery,
      returns,
      workingHours,
    } = body;

    if (!sellerId) {
      return NextResponse.json(
        { message: 'Seller ID is required' },
        { status: 400 }
      );
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      {
        $set: {
          businessPreferences: {
            delivery,
            returns,
            workingHours,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!updatedSeller) {
      return NextResponse.json(
        { message: 'Seller not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Business preferences updated',
      seller: updatedSeller,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        message: error.message || 'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}