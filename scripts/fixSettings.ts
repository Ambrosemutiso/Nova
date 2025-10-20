import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import OrderModel from '@/app/models/orders';

const Order = OrderModel as mongoose.Model<any>; // ✅ cast to proper Model type

async function fixOrdersFulfillmentMode() {
  try {
    await dbConnect();
    console.log('🔍 Fetching orders with missing fulfillmentMode in items...');

    const ordersToFix = await Order.find({
      'items.fulfillmentMode': { $in: [null, '', undefined] },
    });

    if (ordersToFix.length === 0) {
      console.log('✅ All orders already have fulfillmentMode set.');
      mongoose.connection.close();
      return;
    }

    console.log(`🧾 Found ${ordersToFix.length} orders to update.`);

    for (const order of ordersToFix) {
      let needsUpdate = false;

      for (const item of order.items) {
        if (!item.fulfillmentMode) {
          item.fulfillmentMode = 'seller';
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await order.save();
        console.log(`✅ Order ${order._id} updated successfully.`);
      }
    }

    console.log('🎉 All missing fulfillmentMode fields fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing fulfillmentMode in orders:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixOrdersFulfillmentMode();
