import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema(
  {
    upiId: { type: String, default: "yourbusiness@upi" },
    payeeName: { type: String, default: "Your Tutoring Business" },
    accountName: { type: String, default: "Your Name" },
    accountNumber: { type: String, default: "000000000000" },
    ifsc: { type: String, default: "ABCD0123456" },
    bankName: { type: String, default: "Your Bank" },
    adminWhatsApp: { type: String, default: "+91 90000 00000" },
    groupClassLinks: {
      type: Map,
      of: String,
      default: () =>
        new Map([
          ["hindi", "https://meet.google.com/yol-hindi-cohort"],
          ["english", "https://meet.google.com/yol-english-cohort"],
          ["default", "https://meet.google.com/yol-live-group"],
        ]),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        if (ret.groupClassLinks instanceof Map) {
          ret.groupClassLinks = Object.fromEntries(ret.groupClassLinks);
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const PaymentSettings = mongoose.model(
  "PaymentSettings",
  paymentSettingsSchema
);
