import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import slugify from "slugify";
import { dbConnect } from "@/lib/dbConnect";

interface ProductDoc {
  _id: mongoose.Types.ObjectId;
  name?: string;
  slug?: string;
}

async function injectMissingProductSlugs() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established.");

    const collection = db.collection<ProductDoc>("products");

    console.log("🔍 Checking products missing slug field...");

    // Find products without slug
    const products = await collection
      .find({
        $or: [
          { slug: { $exists: false } },
          { slug: "" },
        ],
      })
      .toArray();

    console.log(`🧩 Found ${products.length} products without slug.`);

    for (const product of products) {
      if (!product.name) {
        console.warn(`⚠️ Skipping product ${product._id} (missing name)`);
        continue;
      }

      // Base slug
      const baseSlug = slugify(product.name, {
        lower: true,
        strict: true,
        trim: true,
      });

      let slug = baseSlug;
      let counter = 1;

      // Ensure uniqueness
      while (
        await collection.findOne({
          slug,
          _id: { $ne: product._id },
        })
      ) {
        counter += 1;
        slug = `${baseSlug}-${counter}`;
      }

      await collection.updateOne(
        { _id: product._id },
        { $set: { slug } }
      );

      console.log(`✅ ${product._id} → ${slug}`);
    }

    console.log("🎯 All missing slugs successfully generated!");
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Failed to inject product slugs:", err);
    await mongoose.connection.close();
  }
}

injectMissingProductSlugs();
