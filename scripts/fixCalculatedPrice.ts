import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";

interface ProductDoc {
  _id: mongoose.Types.ObjectId;
  category?: string;
  condition?: string;
}

async function injectProductCondition() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established.");

    const collection = db.collection<ProductDoc>("products");

    console.log("🔍 Updating ALL products with condition field...");

    const products = await collection.find({}).toArray();

    console.log(`🧩 Found ${products.length} products.`);

    for (const product of products) {
      const category = product.category?.toLowerCase() || "";

      const condition =
        category === "motors"
          ? "used"
          : "brand-new";

      await collection.updateOne(
        { _id: product._id },
        { $set: { condition } }
      );

      console.log(`✅ ${product._id} (${category}) → ${condition}`);
    }

    console.log("🎯 Condition field successfully injected!");
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Failed to inject condition field:", err);
    await mongoose.connection.close();
  }
}

injectProductCondition();
