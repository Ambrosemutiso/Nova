import * as dotenv from 'dotenv';
dotenv.config();

import mongoose, { Model } from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import SellerType from '@/app/models/seller';

const Seller = SellerType as Model<any>;

async function injectTestShopData() {
  await dbConnect();

  const today = new Date();
  const oneYearLater = new Date(today);
  oneYearLater.setFullYear(today.getFullYear() + 1);

  const sellers = await Seller.find({});

  const updates = [];

  for (const seller of sellers) {
    seller.shop = {
      isActive: true,
      activatedAt: today,
      expiresAt: oneYearLater,
      amountPaid: 1300,
      transactionId: `TEST-${Math.floor(Math.random() * 1000000)}`,
    };

    updates.push(seller.save());
    console.log(`✅ Updated seller shop for: ${seller.name}`);
  }

  await Promise.all(updates);
  console.log('✅ All seller shops updated.');
  mongoose.connection.close();
}

injectTestShopData().catch((err) => {
  console.error('❌ Failed:', err);
  mongoose.connection.close();
});
