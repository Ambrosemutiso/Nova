import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';

export async function GET() {
  try {
    await dbConnect();

    // Fetch only installment-enabled products
    const products = await Product.find(
      { installmentEnabled: true },
      {
        name: 1,
        images: 1,
        oldPrice: 1,
        calculatedPrice: 1,
        installmentDepositPercent: 1,
        installmentMonths: 1,
        installmentPolicy: 1,
      }
    ).lean();

    // Add monthly payment calculation
    const result = products.map(p => {
      const depositAmount = (p.calculatedPrice * p.installmentDepositPercent) / 100;
      const remaining = p.calculatedPrice - depositAmount;

      return {
        ...p,
        installmentMonthlyAmount:
          p.installmentMonths > 0
            ? Math.ceil(remaining / p.installmentMonths)
            : 0,
      };
    });

    return NextResponse.json({
      success: true,
      products: result,
    });
  } catch (error) {
    console.error('Error loading installment products:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
