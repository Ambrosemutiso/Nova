import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import UserModel from '../src/app/models/user';
import SellerModel from '../src/app/models/seller';

// Fix type issue by asserting as any
const User = UserModel as any;
const Seller = SellerModel as any;

async function injectFields() {
  await dbConnect();

  console.log('⏳ Updating all users...');
  const userResult = await User.updateMany(
    {},
    {
      $set: {
        country: 'Kenya',
        currency: 'KES',
      },
    }
  );
  console.log(`✅ Users updated: ${userResult.modifiedCount}`);

  console.log('⏳ Updating all sellers...');
  const sellerResult = await Seller.updateMany(
    {},
    {
      $set: {
        country: 'Kenya',
        currency: 'KES',
      },
    }
  );
  console.log(`✅ Sellers updated: ${sellerResult.modifiedCount}`);

  console.log('⏳ Updating specific user and seller by email...');
  const targetEmail = 'ambrosemutiso4@gmail.com';

  const user = await User.findOneAndUpdate(
    { email: targetEmail },
    { $set: { phoneNumber: '+254798437508' } },
    { new: true }
  );
  if (user) console.log(`✅ Updated user: ${user.name}`);
  else console.log('⚠️ No user found with that email');

  const seller = await Seller.findOneAndUpdate(
    { email: targetEmail },
    { $set: { phoneNumber: '+254798437508' } },
    { new: true }
  );
  if (seller) console.log(`✅ Updated seller: ${seller.name}`);
  else console.log('⚠️ No seller found with that email');

  mongoose.connection.close();
}

injectFields().catch((err) => {
  console.error('❌ Failed:', err);
  mongoose.connection.close();
});
