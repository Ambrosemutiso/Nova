// injectMissingProductFields.ts
import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";

// Define a minimal product interface for typing
interface ProductDoc {
  _id: mongoose.Types.ObjectId;
  views?: number;
  visits?: number;
  bounce?: number;
}

async function injectMissingProductFields() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established.");

    const collection = db.collection<ProductDoc>("products");
    console.log("🔍 Checking 'products' collection for missing fields...");

    // Step 1: find products missing views, visits, or bounce
    const missingDocs = await collection
      .find({
        $or: [
          { views: { $exists: false } },
          { visits: { $exists: false } },
          { bounce: { $exists: false } },
        ],
      })
      .toArray();

    console.log(`🧩 Found ${missingDocs.length} products missing metrics.`);

    // Step 2: patch each missing product
    for (const doc of missingDocs) {
      const update: Partial<ProductDoc> = {};

      if (doc.views === undefined)
        update.views = Math.floor(Math.random() * 500 + 50);
      if (doc.visits === undefined)
        update.visits = Math.floor(Math.random() * 300 + 30);
      if (doc.bounce === undefined)
        update.bounce = Math.floor(Math.random() * 60 + 20);

      await collection.updateOne({ _id: doc._id }, { $set: update });

      console.log(`✅ Updated product ${doc._id} with fields:`, update);
    }

    console.log("🎯 All missing product metrics have been successfully patched!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Failed to inject missing product fields:", err);
    mongoose.connection.close();
  }
}

injectMissingProductFields();
