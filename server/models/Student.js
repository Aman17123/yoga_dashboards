import mongoose from "mongoose";

const paymentRecordSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: "" },
    paymentMethod: { type: String, default: "UPI / Bank Transfer" },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    classType: { type: String, enum: ["private", "group"], default: "private" },
    groupName: { type: String, default: null },
    instructor: { type: String, default: "Rohan Mehta" },
    country: { type: String, default: "India" },
    timezone: { type: String, default: "Asia/Kolkata" },
    duration: { type: String, default: "1 Hour" },
    fee: { type: Number, default: 3000 },
    classTimeIST: { type: String, default: "19:00" },
    scheduleDays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
    joiningDate: { type: String, default: "" },
    lastPaymentDate: { type: String, default: "" },
    classLink: { type: String, default: "" },
    goals: { type: String, default: "" },
    language: { type: String, default: "English" },
    instructorStatus: {
      type: String,
      enum: ["assigned", "matching_in_progress"],
      default: "assigned",
    },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    attendance: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
    welcomeEmailStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    welcomeEmailSentAt: { type: Date, default: null },
    welcomeEmailError: { type: String, default: null },
    enrolledFromBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    enrolledFromEnquiryId: { type: Number, default: null },
    paymentHistory: {
      type: [paymentRecordSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        // Convert Map to plain object for clean JSON serialization
        if (ret.attendance instanceof Map) {
          ret.attendance = Object.fromEntries(ret.attendance);
        }
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Student = mongoose.model("Student", studentSchema);
