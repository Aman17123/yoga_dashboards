import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    gender: { type: String, default: "" },
    age: { type: Number, default: null },
    heightWeight: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    country: { type: String, default: "India" },
    classTypeInterest: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
    preferredTimings: { type: String, default: "" },
    demoDate: { type: String, default: "" },
    instructorPreference: { type: String, default: "Any" },
    reason: { type: String, default: "" },
    otherInfo: { type: String, default: "" },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "accepted", "declined"],
      default: "pending",
      index: true,
    },
    submittedDate: { type: String, default: "" },
    convertedStudentId: { type: Number, default: null },
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

export const Enquiry = mongoose.model("Enquiry", enquirySchema);
