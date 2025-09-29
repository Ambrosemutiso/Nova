import * as dotenv from 'dotenv';
dotenv.config();

import mongoose, { Model } from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import SellerType from '../src/app/models/seller';

const Seller = SellerType as Model<any>;

async function backfillShopPlans() {
  await dbConnect();

  const sellers = await Seller.find({});

  const updates = [];

  for (const seller of sellers) {
    if (!seller.shop) continue;

    // Default plan
    let plan = 'unknown';

    if (seller.shop.amountPaid === 1300) {
      plan = 'basic';
    } else if (seller.shop.amountPaid === 3000) {
      plan = 'premium';
    }

    // Only update if plan is missing or incorrect
    if (!seller.shop.plan || seller.shop.plan === 'unknown') {
      seller.shop.plan = plan;
      updates.push(seller.save());
      console.log(`✅ Updated seller ${seller.name} → plan: ${plan}`);
    }
  }

  await Promise.all(updates);
  console.log('✅ All seller shop plans updated.');
  mongoose.connection.close();
}

backfillShopPlans().catch((err) => {
  console.error('❌ Failed:', err);
  mongoose.connection.close();
});
