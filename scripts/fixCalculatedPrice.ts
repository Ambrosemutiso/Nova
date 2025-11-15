// injectMissingProductCurrency.ts
import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";

interface ProductDoc {
  _id: mongoose.Types.ObjectId;
  currency?: string;
}

async function injectMissingProductCurrency() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established.");

    const collection = db.collection<ProductDoc>("products");
    console.log("🔍 Checking 'products' collection for missing 'currency' field...");

    // Step 1: find products missing the currency field
    const missingCurrencyDocs = await collection
      .find({ currency: { $exists: false } })
      .toArray();

    console.log(`🧩 Found ${missingCurrencyDocs.length} products missing 'currency'.`);

    // Step 2: Update each doc with default currency = "KES"
    for (const doc of missingCurrencyDocs) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { currency: "KES" } }
      );
      console.log(`✅ Updated product ${doc._id} with currency: KES`);
    }

    console.log("🎯 All missing product currency fields have been successfully patched!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Failed to inject missing product currency:", err);
    mongoose.connection.close();
  }
}

injectMissingProductCurrency();
