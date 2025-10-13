import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import OrderModel from '@/app/models/orders.js';

// Fix type issues for direct script usage
const Order = OrderModel as any;

// Simple tracking number generator
function generateTrackingNumber() {
  const randomPart = Math.floor(100000000 + Math.random() * 900000000);
  return `TRK-${randomPart}`;
}

async function injectTrackingNumbers() {
  try {
    await dbConnect();

    console.log('🔍 Fetching orders without tracking numbers...');
    const ordersWithoutTracking = await Order.find({
      $or: [{ trackingNumber: { $exists: false } }, { trackingNumber: null }],
    });

    if (ordersWithoutTracking.length === 0) {
      console.log('✅ All orders already have tracking numbers.');
      mongoose.connection.close();
      return;
    }

    console.log(`🧾 Found ${ordersWithoutTracking.length} orders to update.`);

    for (const order of ordersWithoutTracking) {
      const trackingNumber = generateTrackingNumber();
      await Order.updateOne(
        { _id: order._id },
        { $set: { trackingNumber } }
      );
      console.log(`✅ Order ${order._id} updated with ${trackingNumber}`);
    }

    console.log('🎉 All missing tracking numbers injected successfully!');
  } catch (err) {
    console.error('❌ Failed to inject tracking numbers:', err);
  } finally {
    mongoose.connection.close();
  }
}

injectTrackingNumbers();
