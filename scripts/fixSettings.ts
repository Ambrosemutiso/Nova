import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import ProductModel from '@/app/models/product';

const Product: any = ProductModel;

async function fixFulfillmentModes() {
  try {
    await dbConnect();

    console.log('🔍 Fetching products with wrong or missing fulfillmentMode...');
    const productsToFix = await Product.find({
      $or: [
        { fulfillmentMode: 'Fulfilled by Seller' }, // 👈 previously wrong value
        { fulfillmentMode: { $exists: false } },
        { fulfillmentMode: null },
        { fulfillmentMode: '' },
      ],
    });

    if (productsToFix.length === 0) {
      console.log('✅ All products already have correct fulfillmentMode.');
      mongoose.connection.close();
      return;
    }

    console.log(`🧾 Found ${productsToFix.length} products to update.`);

    for (const product of productsToFix as any[]) {
      const updates: any = {};

      // fix wrong or missing fulfillmentMode
      updates.fulfillmentMode = 'seller'; // ✅ correct key

      // add default weight if missing
      if (!product.weight) updates.weight = '1';

      await Product.updateOne({ _id: product._id }, { $set: updates });
      console.log(`✅ Product ${product._id} updated →`, updates);
    }

    console.log('🎉 All fulfillmentMode values fixed successfully!');
  } catch (err) {
    console.error('❌ Failed to fix product fields:', err);
  } finally {
    mongoose.connection.close();
  }
}

fixFulfillmentModes();
