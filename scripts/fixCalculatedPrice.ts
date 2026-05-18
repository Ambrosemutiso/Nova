import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SellerDoc {
  _id: mongoose.Types.ObjectId;
  bio?: string;
  location?: string;
  website?: string;
  phoneNumber?: string | null;
  businessPreferences?: {
    delivery?: any;
    returns?: any;
    workingHours?: any;
    paymentMethods?: any[];
  };
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PAYMENT_METHODS = [
  { id: "mpesa",  label: "M-Pesa",             enabled: false, details: "" },
  { id: "card",   label: "Credit / Debit Card", enabled: false, details: "" },
  { id: "bank",   label: "Bank Transfer",       enabled: false, details: "" },
  { id: "cash",   label: "Cash on Delivery",    enabled: false, details: "" },
  { id: "paypal", label: "PayPal",              enabled: false, details: "" },
];

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
    monday:    { open: "08:00", close: "18:00", enabled: true  },
    tuesday:   { open: "08:00", close: "18:00", enabled: true  },
    wednesday: { open: "08:00", close: "18:00", enabled: true  },
    thursday:  { open: "08:00", close: "18:00", enabled: true  },
    friday:    { open: "08:00", close: "18:00", enabled: true  },
    saturday:  { open: "08:00", close: "18:00", enabled: false },
    sunday:    { open: "08:00", close: "18:00", enabled: false },
  },
  paymentMethods: DEFAULT_PAYMENT_METHODS,
};

// ─── Script ───────────────────────────────────────────────────────────────────

async function injectSellerFields() {
  let totalUpdated   = 0;
  let totalSkipped   = 0;
  let totalNewPrefs  = 0;
  let totalAddedPay  = 0;

  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established.");

    const collection = db.collection<SellerDoc>("sellers");

    // ── Find every seller that is missing ANY of the fields we care about ──
    const sellers = await collection
      .find({
        $or: [
          { bio:                                      { $exists: false } },
          { location:                                 { $exists: false } },
          { website:                                  { $exists: false } },
          { phoneNumber:                              { $exists: false } },
          { businessPreferences:                      { $exists: false } },
          // Has businessPreferences but paymentMethods key is absent
          { "businessPreferences.paymentMethods":     { $exists: false } },
          // Has the key but the array is empty
          { "businessPreferences.paymentMethods":     { $size: 0      } },
        ],
      })
      .toArray();

    console.log(`\n🔍 Found ${sellers.length} seller(s) that need updating\n`);

    for (const seller of sellers) {
      const $set: Record<string, any> = {};

      // ── Basic profile fields ──────────────────────────────────────────────
      if (seller.bio       === undefined) $set["bio"]         = "";
      if (seller.location  === undefined) $set["location"]    = "";
      if (seller.website   === undefined) $set["website"]     = "";
      if (seller.phoneNumber === undefined) $set["phoneNumber"] = null;

      // ── businessPreferences completely absent → inject full default ───────
      if (!seller.businessPreferences) {
        $set["businessPreferences"] = DEFAULT_BUSINESS_PREFERENCES;
        totalNewPrefs++;
      } else {
        // businessPreferences exists — only patch the missing paymentMethods
        const pm = seller.businessPreferences.paymentMethods;
        const needsPaymentMethods = !pm || pm.length === 0;

        if (needsPaymentMethods) {
          // Use dot-notation so we don't clobber delivery/returns/workingHours
          $set["businessPreferences.paymentMethods"] = DEFAULT_PAYMENT_METHODS;
          totalAddedPay++;
        }
      }

      if (Object.keys($set).length === 0) {
        totalSkipped++;
        continue;
      }

      await collection.updateOne({ _id: seller._id }, { $set });

      console.log(`  ✅ Updated seller ${seller._id}  →  fields: ${Object.keys($set).join(", ")}`);
      totalUpdated++;
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log("\n─────────────────────────────────────────");
    console.log(`🎯  Migration complete`);
    console.log(`    Updated : ${totalUpdated}`);
    console.log(`    Skipped : ${totalSkipped}  (already had all fields)`);
    console.log(`    New businessPreferences injected : ${totalNewPrefs}`);
    console.log(`    paymentMethods added to existing prefs : ${totalAddedPay}`);
    console.log("─────────────────────────────────────────\n");

  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 DB connection closed.");
  }
}

injectSellerFields();