import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";

async function fixPhoneNumberIndex() {
  await dbConnect();

  // Assert that db is not undefined after connection
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established.");
  }

  const collection = db.collection("sellers");

  console.log("🔍 Checking indexes on sellers collection...");
  const indexes = await collection.indexes();
  console.log("Current indexes:", indexes);

  // Drop old index if exists
  const hasPhoneIndex = indexes.find((idx) => idx.name === "phoneNumber_1");
  if (hasPhoneIndex) {
    console.log("⚠️ Dropping old phoneNumber_1 index...");
    await collection.dropIndex("phoneNumber_1");
    console.log("✅ Dropped old index");
  } else {
    console.log("ℹ️ No old phoneNumber_1 index found, skipping drop");
  }

  // Recreate sparse + unique index
  console.log("🔧 Creating sparse unique index for phoneNumber...");
  await collection.createIndex(
    { phoneNumber: 1 },
    { unique: true, sparse: true }
  );
  console.log("✅ New sparse+unique phoneNumber index created.");

  mongoose.connection.close();
}

fixPhoneNumberIndex().catch((err) => {
  console.error("❌ Failed:", err);
  mongoose.connection.close();
});
