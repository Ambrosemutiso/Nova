import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ MongoDB URI not defined in environment variables');
}

let isConnected = false;

export async function dbConnect() {
  if (isConnected) {
    console.log('✅ MongoDB: Already connected');
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI!);
    isConnected = true;
    console.log('✅ MongoDB: Connected successfully');
    return db;
  } catch (err) {
    console.error('❌ MongoDB: Connection error', err);
    throw new Error('Failed to connect to MongoDB');
  }
}
