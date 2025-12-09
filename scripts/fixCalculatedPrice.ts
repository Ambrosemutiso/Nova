// injectMissingProductInstallments.ts
import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";

interface ProductDoc {
  _id: mongoose.Types.ObjectId;
  installmentEnabled?: boolean;
  installmentDepositPercent?: number;
  installmentMonths?: number;
  installmentPolicy?: string;
}

async function injectMissingProductInstallments() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established.");

    const collection = db.collection<ProductDoc>("products");
    console.log("🔍 Checking 'products' collection for missing installment fields...");

    // Step 1: find products missing any of the installment fields
    const missingInstallmentDocs = await collection
      .find({
        $or: [
          { installmentEnabled: { $exists: false } },
          { installmentDepositPercent: { $exists: false } },
          { installmentMonths: { $exists: false } },
          { installmentPolicy: { $exists: false } },
        ],
      })
      .toArray();

    console.log(`🧩 Found ${missingInstallmentDocs.length} products missing installment fields.`);

    // Step 2: Update each doc with default values
    for (const doc of missingInstallmentDocs) {
      await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            installmentEnabled: false,
            installmentDepositPercent: 0,
            installmentMonths: 0,
            installmentPolicy: "",
          },
        }
      );
      console.log(`✅ Updated product ${doc._id} with default installment fields`);
    }

    console.log("🎯 All missing installment fields have been successfully patched!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Failed to inject missing installment fields:", err);
    mongoose.connection.close();
  }
}

injectMissingProductInstallments();
