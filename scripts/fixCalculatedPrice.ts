// fixMissingPasswordsHashed.js
import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";

async function injectMissingPasswords() {
  await dbConnect();

  const db = mongoose.connection.db;
  if (!db) throw new Error("Database connection not established.");

  const collections = ["users", "sellers"];
  const plainPassword = "Abro3042";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  for (const name of collections) {
    const collection = db.collection(name);
    console.log(`🔍 Checking ${name} collection for missing passwords...`);

    const missing = await collection
      .find({ $or: [{ password: { $exists: false } }, { password: null }] })
      .toArray();

    console.log(`🧩 Found ${missing.length} ${name} without passwords.`);

    for (const doc of missing) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { password: hashedPassword } }
      );
      console.log(`✅ Updated ${name} ${doc._id} with hashed password.`);
    }
  }

  console.log("🎯 All missing passwords have been securely patched!");
  mongoose.connection.close();
}

injectMissingPasswords().catch((err) => {
  console.error("❌ Failed:", err);
  mongoose.connection.close();
});
