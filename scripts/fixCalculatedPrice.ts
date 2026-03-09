import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import { categoryTree } from "@/lib/productCategories";

interface ProductDoc {
  _id: mongoose.Types.ObjectId;
  name?: string;
  category?: string;
  subcategory?: string;
  productType?: string;
}

async function autoClassifyProducts() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established.");

    const collection = db.collection<ProductDoc>("products");

    console.log("🔍 Searching products needing classification...");

    const products = await collection
      .find({
        $or: [
          { subcategory: "" },
          { productType: "" }
        ]
      })
      .toArray();

    console.log(`🧩 Found ${products.length} products to classify`);

    for (const product of products) {

      if (!product.category) {
        console.log(`⚠️ Skipping ${product._id} (no category)`);
        continue;
      }

      const category = product.category as keyof typeof categoryTree;

      const categoryData = categoryTree[category];

      if (!categoryData) {
        console.log(`⚠️ Unknown category for ${product._id}`);
        continue;
      }

      const subcategories = Object.keys(categoryData);

      // pick first subcategory
      const subcategory = subcategories[0];

      const productTypes =
        categoryData[subcategory as keyof typeof categoryData];

      const productType = productTypes?.[0] || "";

      await collection.updateOne(
        { _id: product._id },
        {
          $set: {
            subcategory,
            productType
          }
        }
      );

      console.log(
        `✅ ${product._id} → ${category} / ${subcategory} / ${productType}`
      );
    }

    console.log("🎯 Auto classification completed!");

    await mongoose.connection.close();

  } catch (err) {
    console.error("❌ Auto classification failed:", err);
    await mongoose.connection.close();
  }
}

autoClassifyProducts();