import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Personal Info
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    age: { type: String, default: "", trim: true },
    gender: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    timezone: { type: String, default: "Asia/Kolkata" },

    // Class Preferences
    language: { type: String, default: "English", trim: true },
    classType: {
      type: String,
      enum: ["private", "group", "not_sure"],
      default: "group",
    },
    // For Private
    preferredTime: { type: String, default: "", trim: true },
    preferredTime2: { type: String, default: "", trim: true },
    instructorPreference: { type: String, default: "Any", trim: true },

    // For Group
    groupCohort: { type: String, default: "", trim: true },
    fee: { type: Number, default: 0 },

    // Schedule & Notes
    goals: { type: String, default: "", trim: true },
    joiningDate: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },

    // Metadata
    source: { type: String, default: "direct", trim: true }, // e.g. "yogasite1", "yogasite2"
    referralUrl: { type: String, default: "" },
    bookingRef: { type: String, unique: true, sparse: true },

    // Workflow status
    status: {
      type: String,
      enum: ["pending", "contacted", "confirmed", "converted", "declined"],
      default: "pending",
    },
    adminNotes: { type: String, default: "" },

    // Email tracking
    confirmationEmailSent: { type: Boolean, default: false },
    adminEmailSent: { type: Boolean, default: false },

    // Enrollment tracking
    enrolledStudentId: { type: Number, default: null },
    enrollmentEmailStatus: {
      type: String,
      enum: ["pending", "sent", "failed", "none"],
      default: "none",
    },
    enrollmentEmailError: { type: String, default: null },
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

// Auto-generate a short booking reference before saving
bookingSchema.pre("save", function () {
  if (!this.bookingRef) {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.bookingRef = `YOL-${stamp}-${rand}`;
  }
});

export const Booking = mongoose.model("Booking", bookingSchema);
