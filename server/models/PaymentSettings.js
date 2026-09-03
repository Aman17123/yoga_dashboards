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
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
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
