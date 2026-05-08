import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  lowercase: true,
},
  image: { type: String , default: null},
  logo: { type: String , default: "" },
  banner: { type: String , default: ""},
  bio: { type: String },
  location: { type: String },
  website:{ type: String },
businessPreferences: {
  delivery: {
    sameDay: {
      type: Boolean,
      default: false,
    },

    pickupAvailable: {
      type: Boolean,
      default: false,
    },

    estimatedDelivery: {
      type: String,
      default: '',
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    freeDeliveryThreshold: {
      type: Number,
      default: 0,
    },
  },

  returns: {
    acceptsReturns: {
      type: Boolean,
      default: false,
    },

    returnWindow: {
      type: Number,
      default: 0,
    },

    conditions: {
      type: String,
      default: '',
    },
  },

  workingHours: {
    monday: {
      open: {
        type: String,
        default: '08:00',
      },
      close: {
        type: String,
        default: '18:00',
      },
      enabled: {
        type: Boolean,
        default: true,
      },
    },

    tuesday: {
      open: String,
      close: String,
      enabled: Boolean,
    },

    wednesday: {
      open: String,
      close: String,
      enabled: Boolean,
    },

    thursday: {
      open: String,
      close: String,
      enabled: Boolean,
    },

    friday: {
      open: String,
      close: String,
      enabled: Boolean,
    },

    saturday: {
      open: String,
      close: String,
      enabled: Boolean,
    },

    sunday: {
      open: String,
      close: String,
      enabled: Boolean,
    },
  },
},
  phoneNumber: {
  type: String,
  default: null,   
},

password: {
  type: String,
  required: function () {
    return this.provider === 'email';
  },
},
  country: { type: String },
  currency: { type: String },
  role: {
    type: String,
    enum: ['seller'],
    default: 'seller',
  },
  shopName: { type: String },
  isVerified: {
    type: Boolean,
    default: false,
  },
  followers: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      followedAt: {
        type: Date,
      },
    },
  ],
  shop: {
    isActive: { type: Boolean, default: false },
    activatedAt: { type: Date },
    expiresAt: { type: Date },
    amountPaid: { type: Number },
    transactionId: { type: String },

    // Auto-flagged plan by amount paid
    plan: {
      type: String,
      enum: ['basic', 'premium', 'free'],
      default: 'free',
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const Seller =
  mongoose.models.Seller || mongoose.model('Seller', sellerSchema);

export default Seller;
