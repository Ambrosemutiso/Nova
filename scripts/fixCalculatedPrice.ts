import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";

interface SellerDoc {
  _id: mongoose.Types.ObjectId;

  bio?: string;
  location?: string;
  website?: string;
  phoneNumber?: string | null;

  businessPreferences?: any;
}

const DEFAULT_BUSINESS_PREFERENCES = {
  delivery: {
    sameDay: false,
    pickupAvailable: false,
    estimatedDelivery: "",
    deliveryFee: 0,
    freeDeliveryThreshold: 0,
  },

  returns: {
    acceptsReturns: false,
    returnWindow: 0,
    conditions: "",
  },

  workingHours: {
    monday: {
      open: "08:00",
      close: "18:00",
      enabled: true,
    },

    tuesday: {
      open: "08:00",
      close: "18:00",
      enabled: true,
    },

    wednesday: {
      open: "08:00",
      close: "18:00",
      enabled: true,
    },

    thursday: {
      open: "08:00",
      close: "18:00",
      enabled: true,
    },

    friday: {
      open: "08:00",
      close: "18:00",
      enabled: true,
    },

    saturday: {
      open: "08:00",
      close: "18:00",
      enabled: false,
    },

    sunday: {
      open: "08:00",
      close: "18:00",
      enabled: false,
    },
  },
};

async function injectSellerFields() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection not established.");
    }

    const collection = db.collection<SellerDoc>("sellers");

    console.log("🔍 Searching sellers with missing fields...");

    const sellers = await collection
      .find({
        $or: [
          { bio: { $exists: false } },
          { location: { $exists: false } },
          { website: { $exists: false } },
          { phoneNumber: { $exists: false } },
          { businessPreferences: { $exists: false } },
        ],
      })
      .toArray();

    console.log(`🧩 Found ${sellers.length} sellers to update`);

    for (const seller of sellers) {
      const updates: Record<string, any> = {};

      // ── Basic profile fields ──
      if (seller.bio === undefined) {
        updates.bio = "";
      }

      if (seller.location === undefined) {
        updates.location = "";
      }

      if (seller.website === undefined) {
        updates.website = "";
      }

      if (seller.phoneNumber === undefined) {
        updates.phoneNumber = null;
      }

      // ── Business Preferences ──
      if (!seller.businessPreferences) {
        updates.businessPreferences = DEFAULT_BUSINESS_PREFERENCES;
      }

      // Skip if nothing to update
      if (Object.keys(updates).length === 0) {
        continue;
      }

      await collection.updateOne(
        { _id: seller._id },
        {
          $set: updates,
        }
      );

      console.log(`✅ Updated seller ${seller._id}`);
    }

    console.log("🎯 Seller field injection completed!");

    await mongoose.connection.close();

  } catch (err) {
    console.error("❌ Injection failed:", err);

    await mongoose.connection.close();
  }
}

injectSellerFields();