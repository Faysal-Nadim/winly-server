const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    dialCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      default: null,
    },
    dob: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      required: true,
    },
    nationality: {
      type: String,
      required: true,
    },
    wallet: {
      available: {
        type: Number,
        default: 0,
      },
      onHold: {
        type: Number,
        default: 0,
      },
    },
    img: {
      url: {
        type: String,
        default: null,
      },
      key: {
        type: String,
        default: null,
      },
    },
    hash_password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verification: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      code: {
        type: Number,
        default: null,
      },
    },
    stripe_id: {
      type: String,
      default: null,
    },
    notification: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      wp: {
        type: Boolean,
        default: true,
      },
      pn: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

userSchema.virtual("fullName").get(function (fullName) {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods = {
  authenticate: async function (password) {
    return await bcrypt.compare(password, this.hash_password);
  },
};

module.exports = mongoose.model("User", userSchema);
