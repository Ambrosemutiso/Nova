// injectMissingAdFields.ts
import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";

interface AdDoc {
  _id: mongoose.Types.ObjectId;
  likes?: string[];
  comments?: any[];
  shares?: number;
  views?: number;
}

async function injectMissingAdFields() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established.");

    const collection = db.collection<AdDoc>("ads");
    console.log("🔍 Checking 'ads' collection for missing fields...");

    // Step 1: find ads missing ANY of the new fields
    const missingDocs = await collection
      .find({
        $or: [
          { likes: { $exists: false } },
          { comments: { $exists: false } },
          { shares: { $exists: false } },
        ],
      })
      .toArray();

    console.log(`🧩 Found ${missingDocs.length} ads missing new fields.`);

    // Step 2: Update each doc with missing fields ONLY
    for (const doc of missingDocs) {
      const update: Partial<AdDoc> = {};

      if (doc.likes === undefined) update.likes = [];
      if (doc.comments === undefined) update.comments = [];
      if (doc.shares === undefined) update.shares = 0;
      if (doc.views === undefined) update.views = 0; // optional safe default

      await collection.updateOne({ _id: doc._id }, { $set: update });

      console.log(`✅ Updated ad ${doc._id} with:`, update);
    }

    console.log("🎯 All missing ad fields have been successfully patched!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Failed to inject missing ad fields:", err);
    mongoose.connection.close();
  }
}

injectMissingAdFields();
