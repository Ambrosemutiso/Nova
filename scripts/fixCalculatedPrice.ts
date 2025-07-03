import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';

async function fixCalculatedPrices() {
  await dbConnect();

  const products = await Product.find({});

  const updates = [];

  for (const product of products) {
    if (typeof product.calculatedPrice === 'string') {
      const parsed = parseFloat(product.calculatedPrice);

      if (!isNaN(parsed)) {
        product.calculatedPrice = parsed;
        updates.push(product.save());
        console.log(`✅ Updated product: ${product.name} (${product._id})`);
      } else {
        console.warn(`⚠️ Skipping invalid price: ${product.name} (${product.calculatedPrice})`);
      }
    }
  }

  await Promise.all(updates);
  console.log(`✅ Done. Updated ${updates.length} product(s).`);

  mongoose.connection.close();
}

fixCalculatedPrices().catch((err) => {
  console.error('❌ Script failed:', err);
  mongoose.connection.close();
});
