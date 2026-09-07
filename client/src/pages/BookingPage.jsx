import React, { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CountrySelect from "../components/CountrySelect";
import PhoneInputWithFlag from "../components/PhoneInputWithFlag";
import CountryFlag from "../components/CountryFlag";
import { findCountry } from "../constants/countries";

// ─── Constants ────────────────────────────────────────────────────────────────
const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST — UTC+5:30)", flag: "🇮🇳" },
  { value: "America/New_York", label: "USA East (EST/EDT)", flag: "🇺🇸" },
  { value: "America/Chicago", label: "USA Central (CST/CDT)", flag: "🇺🇸" },
  { value: "America/Denver", label: "USA Mountain (MST/MDT)", flag: "🇺🇸" },
  { value: "America/Los_Angeles", label: "USA West (PST/PDT)", flag: "🇺🇸" },
  { value: "Europe/London", label: "UK (GMT/BST)", flag: "🇬🇧" },
  { value: "Europe/Berlin", label: "Germany / France (CET)", flag: "🇩🇪" },
  { value: "Europe/Amsterdam", label: "Netherlands (CET)", flag: "🇳🇱" },
  { value: "Europe/Stockholm", label: "Sweden (CET)", flag: "🇸🇪" },
  { value: "Europe/Zurich", label: "Switzerland (CET)", flag: "🇨🇭" },
  { value: "Asia/Dubai", label: "UAE (GST — UTC+4)", flag: "🇦🇪" },
  { value: "Asia/Singapore", label: "Singapore (SGT — UTC+8)", flag: "🇸🇬" },
  { value: "Asia/Tokyo", label: "Japan (JST — UTC+9)", flag: "🇯🇵" },
  { value: "Australia/Sydney", label: "Australia East (AEST)", flag: "🇦🇺" },
  { value: "Australia/Perth", label: "Australia West (AWST)", flag: "🇦🇺" },
  { value: "Pacific/Auckland", label: "New Zealand (NZST)", flag: "🇳🇿" },
  { value: "America/Toronto", label: "Canada East (EST/EDT)", flag: "🇨🇦" },
  { value: "America/Vancouver", label: "Canada West (PST/PDT)", flag: "🇨🇦" },
  { value: "Africa/Lagos", label: "Nigeria (WAT — UTC+1)", flag: "🇳🇬" },
  { value: "Africa/Johannesburg", label: "South Africa (SAST — UTC+2)", flag: "🇿🇦" },
  { value: "Asia/Riyadh", label: "Saudi Arabia (AST — UTC+3)", flag: "🇸🇦" },
];

// Group Class Cohorts & Slots specified by user
const GROUP_COHORTS = {
  hindi: {
    id: "hindi",
    name: "Hindi & Large Group Size Class",
    price: 999,
    priceLabel: "₹999 / month",
    language: "Hindi",
    slots: [
      "5:00 am - 6:00 am IST",
      "6:00 am - 7:00 am IST",
      "8:00 am - 9:00 am IST",
      "9:00 am - 10:00 am IST",
      "10:30 am - 11:30 am IST",
      "4:00 pm - 5:00 pm IST",
      "5:00 pm - 6:00 pm IST",
      "7:00 pm - 8:00 pm IST",
    ],
  },
  english: {
    id: "english",
    name: "English & Small Group Size Class",
    price: 1699,
    priceLabel: "₹1,699 / month",
    language: "English",
    slots: [
      "7:00 am - 8:00 am IST",
      "6:30 pm - 7:30 pm IST",
      "7:30 pm - 8:30 pm IST",
    ],
  },
};

// Private 1:1 IST Time Slots (Student can select 2 time slots)
const PRIVATE_TIME_SLOTS = [
  "5:00 am - 6:00 am IST",
  "6:00 am - 7:00 am IST",
  "7:00 am - 8:00 am IST",
  "8:00 am - 9:00 am IST",
  "9:00 am - 10:00 am IST",
  "10:30 am - 11:30 am IST",
  "4:00 pm - 5:00 pm IST",
  "5:00 pm - 6:00 pm IST",
  "6:00 pm - 7:00 pm IST",
  "6:30 pm - 7:30 pm IST",
  "7:00 pm - 8:00 pm IST",
  "7:30 pm - 8:30 pm IST",
  "8:30 pm - 9:30 pm IST",
];

// Helper components
function SunLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="5.5" fill="#F2994A" />
      <circle cx="17" cy="17" r="11" stroke="#F2994A" strokeWidth="1.5" strokeDasharray="3.5 2.8" fill="none" />
      <path d="M17 3.5v3M17 27.5v3M3.5 17h3M27.5 17h3M7.2 7.2l2 2M24.8 24.8l2 2M24.8 7.2l-2 2M7.2 24.8l2-2" stroke="#F2994A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Field({ label, required, error, children, id }) {
  return (
    <div className={`booking-field ${error ? "has-error" : ""}`}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && <span className="field-required">*</span>}
        </label>
      )}
      {children}
      {error && <div className="field-error-text">{error}</div>}
    </div>
  );
}

function Input({ style, ...props }) {
  return <input className="booking-input" style={style} {...props} />;
}

function Select({ children, ...props }) {
  return (
    <div className="booking-select-wrapper">
      <select className="booking-select" {...props}>
        {children}
      </select>
      <div className="select-chevron">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, children }) {
  if (!value && !children) return null;
  return (
    <div className="review-row">
      <span className="review-row-label">{label}</span>
      <div className="review-row-value">{children || value}</div>
    </div>
  );
}

function ReviewCard({ title, children }) {
  return (
    <div className="review-card">
      <div className="review-card-header">{title}</div>
      <div className="review-card-body">{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "direct";
  const referralUrl = typeof document !== "undefined" ? document.referrer : "";

  // View mode: "form" (1 form to fill) or "review" (1 review look)
  const [viewMode, setViewMode] = useState("form");
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  // Today's date in YYYY-MM-DD for min joining date
  const todayStr = new Date().toISOString().split("T")[0];

  // Exact fields specified by user
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "Female", // Female / Male / Other
    phone: "",
    country: "India",
    timezone: "Asia/Kolkata",
    language: "English", // Hindi / English
    classType: "group", // "private" / "group"
    // If Private
    preferredTime1: "7:00 am - 8:00 am IST",
    preferredTime2: "6:00 pm - 7:00 pm IST",
    instructorPreference: "Any", // Male / Female / Any
    // If Group
    groupCohortId: "english", // "hindi" or "english"
    groupTimeSlot: "7:00 am - 8:00 am IST",
    // Schedule & Note
    joiningDate: todayStr,
    message: "",
  });

  const rightPanelRef = useRef(null);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  // When language changes, sync default group cohort if in group mode
  const handleLanguageChange = (lang) => {
    set("language", lang);
    if (lang === "Hindi" && form.groupCohortId === "english") {
      setForm((prev) => ({
        ...prev,
        language: "Hindi",
        groupCohortId: "hindi",
        groupTimeSlot: GROUP_COHORTS.hindi.slots[1], // 6-7 am
      }));
    } else if (lang === "English" && form.groupCohortId === "hindi") {
      setForm((prev) => ({
        ...prev,
        language: "English",
        groupCohortId: "english",
        groupTimeSlot: GROUP_COHORTS.english.slots[0], // 7-8 am
      }));
    }
  };

  // When group cohort changes
  const handleGroupCohortChange = (cohortId) => {
    setForm((prev) => ({
      ...prev,
      groupCohortId: cohortId,
      groupTimeSlot: GROUP_COHORTS[cohortId].slots[0],
      language: GROUP_COHORTS[cohortId].language,
    }));
  };

  // Country change
  const handleCountryChange = (countryName, countryObj) => {
    set("country", countryName);
    if (countryObj?.defaultTz) {
      set("timezone", countryObj.defaultTz);
    }
  };

  // Age input validation handler
  const handleAgeChange = (val) => {
    // Only allow whole numeric digits
    const cleaned = val.replace(/\D/g, "");
    if (cleaned === "") {
      setForm((f) => ({ ...f, age: "" }));
      setErrors((prev) => ({ ...prev, age: "Age is required (5–100)." }));
      return;
    }
    const num = parseInt(cleaned, 10);
    // Prevent typing or pasting unrealistic ages like 234
    if (num > 100) {
      setForm((f) => ({ ...f, age: "100" }));
      setErrors((prev) => ({ ...prev, age: "Maximum age allowed is 100 years." }));
      return;
    }
    setForm((f) => ({ ...f, age: cleaned }));
    if (num < 5) {
      setErrors((prev) => ({ ...prev, age: "Minimum age allowed is 5 years." }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.age;
        return next;
      });
    }
  };

  const handleAgeBlur = () => {
    if (!form.age || !form.age.toString().trim()) {
      setErrors((prev) => ({ ...prev, age: "Age is required (5–100)." }));
      return;
    }
    const num = parseInt(form.age, 10);
    if (isNaN(num) || num < 5 || num > 100) {
      setErrors((prev) => ({ ...prev, age: "Please enter a valid age between 5 and 100." }));
    }
  };

  // Validate the single form
  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address.";
    }
    const ageNum = parseInt(form.age, 10);
    if (!form.age || !form.age.toString().trim() || isNaN(ageNum)) {
      errs.age = "Please enter your age.";
    } else if (ageNum < 5 || ageNum > 100) {
      errs.age = "Age must be between 5 and 100 years.";
    }
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required.";
    }
    if (!form.country) {
      errs.country = "Please select your country.";
    }
    if (form.classType === "private") {
      if (!form.preferredTime1) errs.preferredTime1 = "Please select your primary time slot.";
      if (!form.preferredTime2) errs.preferredTime2 = "Please select your secondary time slot.";
    } else {
      if (!form.groupTimeSlot) errs.groupTimeSlot = "Please select your group batch time slot.";
    }
    if (!form.joiningDate) {
      errs.joiningDate = "Please choose your preferred trial / joining date.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Move to review look
  const handleProceedToReview = () => {
    setGlobalError("");
    if (!validateForm()) {
      setGlobalError("Please review and fill in all required fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      rightPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setViewMode("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final submission to API
  const handleSubmitBooking = async () => {
    setGlobalError("");
    setLoading(true);

    const selectedCohort = form.classType === "group" ? GROUP_COHORTS[form.groupCohortId] : null;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      age: form.age.trim(),
      gender: form.gender,
      phone: form.phone.trim(),
      country: form.country,
      timezone: form.timezone,
      language: form.language,
      classType: form.classType,
      // Private times
      preferredTime: form.classType === "private" ? form.preferredTime1 : form.groupTimeSlot,
      preferredTime2: form.classType === "private" ? form.preferredTime2 : "",
      instructorPreference: form.classType === "private" ? form.instructorPreference : "Any",
      // Group info
      groupCohort: selectedCohort ? `${selectedCohort.name} (${selectedCohort.priceLabel})` : "",
      fee: selectedCohort ? selectedCohort.price : 0,
      joiningDate: form.joiningDate,
      message: form.message.trim(),
      source,
      referralUrl,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      navigate(`/book/success?ref=${data.bookingRef}&name=${encodeURIComponent(form.name.split(" ")[0])}`);
    } catch (err) {
      setGlobalError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const currentCountryObj = findCountry(form.country);
  const activeCohort = GROUP_COHORTS[form.groupCohortId];

  return (
    <div className="booking-page-container">
      {/* ═══ LEFT HERO PANEL — NO SCROLLBAR ═══ */}
      <div className="booking-left-panel">
        <div className="left-glow-orb-1" />
        <div className="left-glow-orb-2" />

        <div className="booking-left-panel-content">
          {/* Brand header */}
          <div className="brand-header">
            <div className="brand-logo-wrap">
              <SunLogo size={32} />
              <span className="brand-title">yogaonlive</span>
            </div>
            <span className="trial-badge">Free Trial Session</span>
          </div>

          {/* Hero details */}
          <div className="hero-content">
            <div className="hero-eyebrow">Interactive Live Online Yoga</div>
            <h1 className="hero-heading">
              Start your yoga<br className="desktop-break" /> practice today
            </h1>
            <p className="hero-subtitle">
              Enroll now for live 1-on-1 private sessions or join small group cohorts with certified yoga masters.
            </p>

            {/* Quick badges */}
            <div className="perks-pills">
              <span className="perk-pill">🧘 Private 1:1 or Group</span>
              <span className="perk-pill">🌍 Worldwide Timezones</span>
              <span className="perk-pill">🎁 Free First Trial Class</span>
              <span className="perk-pill">⏱️ Flexible Rescheduling</span>
            </div>

            {/* Studio highlights */}
            <ul className="bullet-list">
              {[
                "Experienced certified yoga masters (Male & Female instructors)",
                "Hindi & English live interactive cohorts with instant corrections",
                "Convenient IST early morning, afternoon & evening batches",
                "Full attendance tracking and cycle management",
                "No upfront payment required for trial enrollment",
              ].map((b) => (
                <li key={b} className="bullet-item">
                  <span className="bullet-dot" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* Student quote card */}
            <div className="testimonial-card">
              <p className="testimonial-text">
                "The flexibility of morning and evening IST batches made it so easy to maintain my daily practice even while traveling."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">A</div>
                <div>
                  <div className="author-name">Ananya R.</div>
                  <div className="author-meta">
                    Student · Group &amp; Private Sessions <CountryFlag country="India" size="xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT FORM PANEL ═══ */}
      <div ref={rightPanelRef} className="booking-right-panel">
        <div className="booking-form-wrapper">

          {/* View Mode Indicator */}
          <div className="flow-steps-pill">
            <div className={`flow-step-item ${viewMode === "form" ? "active" : "done"}`}>
              <span className="flow-num">{viewMode === "review" ? "✓" : "1"}</span>
              <span>Enrollment Details</span>
            </div>
            <div className="flow-divider" />
            <div className={`flow-step-item ${viewMode === "review" ? "active" : ""}`}>
              <span className="flow-num">2</span>
              <span>Review &amp; Confirmation</span>
            </div>
          </div>

          {/* Global Error Banner */}
          {globalError && (
            <div className="global-error-banner">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{globalError}</span>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              VIEW 1: SINGLE ENROLLMENT FORM TO FILL (ONLY REQUESTED FIELDS)
             ═════════════════════════════════════════════════════════════ */}
          {viewMode === "form" && (
            <div className="form-step-container">
              <div className="step-header">
                <h2 className="step-title">Student Enrollment Form</h2>
                <p className="step-subtitle">
                  Fill in your details below to schedule your trial class and reserve your batch.
                </p>
              </div>

              {/* SECTION 1: Personal Details */}
              <div className="form-section-card">
                <div className="section-card-title">1. Personal Information</div>

                {/* Name & Email */}
                <div className="form-grid-2">
                  <Field label="Name" required error={errors.name} id="name">
                    <Input
                      id="name"
                      value={form.name}
                      placeholder="e.g. Aarav Sharma"
                      style={errors.name ? { borderColor: "var(--danger)" } : {}}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </Field>

                  <Field label="Email" required error={errors.email} id="email">
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      placeholder="you@example.com"
                      style={errors.email ? { borderColor: "var(--danger)" } : {}}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </Field>
                </div>

                {/* Age & Gender */}
                <div className="form-grid-2">
                  <Field label="Age" required error={errors.age} id="age">
                    <Input
                      id="age"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={3}
                      value={form.age}
                      placeholder="e.g. 28 (5–100)"
                      style={errors.age ? { borderColor: "var(--danger)" } : {}}
                      onChange={(e) => handleAgeChange(e.target.value)}
                      onBlur={handleAgeBlur}
                    />
                  </Field>

                  <Field label="Gender" required>
                    <div className="pill-options-row">
                      {["Female", "Male", "Other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => set("gender", g)}
                          className={`pill-option-btn ${form.gender === g ? "selected" : ""}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                {/* Phone & Country of Origin */}
                <div className="form-grid-2">
                  <Field label="Phone Number (With flag and code)" required error={errors.phone}>
                    <PhoneInputWithFlag
                      id="phone"
                      value={form.phone}
                      country={form.country}
                      onChange={(val) => set("phone", val)}
                      error={!!errors.phone}
                    />
                  </Field>

                  <Field label="Country of Origin" required error={errors.country}>
                    <CountrySelect
                      value={form.country}
                      onChange={handleCountryChange}
                      error={!!errors.country}
                      placeholder="Select country of origin…"
                    />
                  </Field>
                </div>

                {/* Student Timezone & Language */}
                <div className="form-grid-2">
                  <Field label="Student Timezone" required>
                    <Select value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.flag} {tz.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Select Language (Hindi, English)" required>
                    <div className="pill-options-row">
                      <button
                        type="button"
                        onClick={() => handleLanguageChange("Hindi")}
                        className={`pill-option-btn ${form.language === "Hindi" ? "selected" : ""}`}
                      >
                        🇮🇳 Hindi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLanguageChange("English")}
                        className={`pill-option-btn ${form.language === "English" ? "selected" : ""}`}
                      >
                        🇬🇧 English
                      </button>
                    </div>
                  </Field>
                </div>
              </div>

              {/* SECTION 2: Class Type & Cohort Schedule */}
              <div className="form-section-card">
                <div className="section-card-title">2. Class Type &amp; Schedule</div>

                {/* Select Class Type: Private 1:1 or Group Class */}
                <Field label="Select Class Type" required>
                  <div className="class-type-select-grid">
                    <button
                      type="button"
                      onClick={() => set("classType", "group")}
                      className={`class-select-card ${form.classType === "group" ? "selected" : ""}`}
                    >
                      <div className="class-card-header">
                        <span className="card-icon">👥</span>
                        <div>
                          <div className="card-title">Group Class</div>
                          <div className="card-sub">Interactive cohorts with fixed daily IST batches</div>
                        </div>
                      </div>
                      <div className="card-tag">Starts @ ₹999 / mo</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => set("classType", "private")}
                      className={`class-select-card ${form.classType === "private" ? "selected" : ""}`}
                    >
                      <div className="class-card-header">
                        <span className="card-icon">🧘</span>
                        <div>
                          <div className="card-title">Private 1:1 Class</div>
                          <div className="card-sub">Dedicated 1-on-1 coaching adapted to your pace</div>
                        </div>
                      </div>
                      <div className="card-tag">Personalized Plan</div>
                    </button>
                  </div>
                </Field>

                {/* ── CASE A: IF PRIVATE 1:1 IS CHOSEN ── */}
                {form.classType === "private" && (
                  <div className="sub-section-box">
                    <div className="sub-section-title">
                      Private 1:1 Session Preferences
                    </div>
                    <p className="sub-section-desc">
                      Choose 2 preferred IST time slots for maximum scheduling flexibility, and your instructor gender preference.
                    </p>

                    <div className="form-grid-2">
                      <Field label="1st Preferred Time (IST)" required error={errors.preferredTime1}>
                        <Select
                          value={form.preferredTime1}
                          onChange={(e) => set("preferredTime1", e.target.value)}
                        >
                          {PRIVATE_TIME_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </Select>
                      </Field>

                      <Field label="2nd Preferred Time (IST)" required error={errors.preferredTime2}>
                        <Select
                          value={form.preferredTime2}
                          onChange={(e) => set("preferredTime2", e.target.value)}
                        >
                          {PRIVATE_TIME_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </Select>
                      </Field>
                    </div>

                    <Field label="Select Instructor" required>
                      <div className="pill-options-row">
                        {["Male", "Female", "Any"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => set("instructorPreference", opt)}
                            className={`pill-option-btn ${form.instructorPreference === opt ? "selected" : ""}`}
                          >
                            {opt === "Any" ? "🌟 Any (First Available)" : opt === "Female" ? "👩 Female Instructor" : "👨 Male Instructor"}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── CASE B: IF GROUP CLASS IS CHOSEN ── */}
                {form.classType === "group" && (
                  <div className="sub-section-box">
                    <div className="sub-section-title">
                      Select Group Cohort &amp; Time Slot
                    </div>
                    <p className="sub-section-desc">
                      Choose your preferred group tier and time slot:
                    </p>

                    {/* 2 Group Cohort Cards */}
                    <div className="cohort-cards-grid">
                      {/* Hindi & Large Group Size Class */}
                      <button
                        type="button"
                        onClick={() => handleGroupCohortChange("hindi")}
                        className={`cohort-card ${form.groupCohortId === "hindi" ? "active" : ""}`}
                      >
                        <div className="cohort-badge">🇮🇳 Hindi Cohort</div>
                        <div className="cohort-name">Hindi &amp; Large Group Size Class</div>
                        <div className="cohort-price">₹999 <span>/ month</span></div>
                        <div className="cohort-meta">8 Available IST Batches</div>
                      </button>

                      {/* English & Small Group Size Class */}
                      <button
                        type="button"
                        onClick={() => handleGroupCohortChange("english")}
                        className={`cohort-card ${form.groupCohortId === "english" ? "active" : ""}`}
                      >
                        <div className="cohort-badge">🇬🇧 English Cohort</div>
                        <div className="cohort-name">English &amp; Small Group Size Class</div>
                        <div className="cohort-price">₹1,699 <span>/ month</span></div>
                        <div className="cohort-meta">3 Available IST Batches</div>
                      </button>
                    </div>

                    {/* Time Slot Picker for chosen cohort */}
                    <Field
                      label={`Available Time Slots for ${activeCohort.name}`}
                      required
                      error={errors.groupTimeSlot}
                    >
                      <div className="time-slots-pills-grid">
                        {activeCohort.slots.map((slot) => {
                          const isSelected = form.groupTimeSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => set("groupTimeSlot", slot)}
                              className={`slot-pill-btn ${isSelected ? "selected" : ""}`}
                            >
                              <span className="slot-clock">⏰</span>
                              <span>{slot}</span>
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                  </div>
                )}

                {/* Joining Date / Trial Date */}
                <div style={{ marginTop: 16 }}>
                  <Field label="Joining Date / Trial Date" required error={errors.joiningDate} id="joiningDate">
                    <Input
                      id="joiningDate"
                      type="date"
                      min={todayStr}
                      value={form.joiningDate}
                      onChange={(e) => set("joiningDate", e.target.value)}
                    />
                  </Field>
                </div>

                {/* Message Section (Placed below Joining Date, 800-character max, production-ready) */}
                <div style={{ marginTop: 18 }}>
                  <Field label="Message &amp; Health Notes (Optional)">
                    <div className="message-textarea-container">
                      <textarea
                        id="message"
                        value={form.message}
                        maxLength={800}
                        onChange={(e) => set("message", e.target.value)}
                        placeholder="Tell us about any specific health goals, physical conditions, back stiffness, past injuries, or personal preferences you'd like your instructor to know (up to 800 characters)..."
                        className="booking-textarea"
                        rows={4}
                      />
                      <div className="message-meta-bar">
                        <span className="message-guidance-text">
                          Share any injuries, flexibility goals, or medical conditions with your coach.
                        </span>
                        <span className={`char-counter-pill ${form.message.length >= 750 ? "near-max" : ""}`}>
                          {form.message.length} / 800
                        </span>
                      </div>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="step-actions">
                <button
                  type="button"
                  className="btn-action-primary"
                  onClick={handleProceedToReview}
                >
                  <span>Review Booking &amp; Confirmation</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              VIEW 2: SINGLE REVIEW LOOK BEFORE SUBMISSION
             ═════════════════════════════════════════════════════════════ */}
          {viewMode === "review" && (
            <div className="form-step-container">
              <div className="step-header">
                <h2 className="step-title">Review your enrollment</h2>
                <p className="step-subtitle">
                  Please verify your information below. Click "Confirm &amp; Book Trial Class" to reserve your spot.
                </p>
              </div>

              {/* Review Card 1: Student Information */}
              <ReviewCard title="Student Information">
                <ReviewRow label="Full Name" value={form.name} />
                <ReviewRow label="Email Address" value={form.email} />
                <ReviewRow label="Age" value={`${form.age} years`} />
                <ReviewRow label="Gender" value={form.gender} />
                <ReviewRow label="Phone Number">
                  <div className="flex items-center gap-2 justify-end">
                    <CountryFlag country={currentCountryObj} size="xs" />
                    <span>{form.phone}</span>
                  </div>
                </ReviewRow>
                <ReviewRow label="Country of Origin">
                  <div className="flex items-center gap-2 justify-end">
                    <CountryFlag country={currentCountryObj} size="sm" />
                    <span>{form.country}</span>
                  </div>
                </ReviewRow>
                <ReviewRow
                  label="Student Timezone"
                  value={TIMEZONES.find((t) => t.value === form.timezone)?.label || form.timezone}
                />
                <ReviewRow label="Language" value={form.language} />
              </ReviewCard>

              {/* Review Card 2: Class & Cohort Details */}
              <ReviewCard title="Class &amp; Schedule Details">
                <ReviewRow
                  label="Class Type"
                  value={form.classType === "private" ? "Private 1:1 Class" : "Group Class"}
                />

                {form.classType === "private" ? (
                  <>
                    <ReviewRow label="1st Preferred Time (IST)" value={form.preferredTime1} />
                    <ReviewRow label="2nd Preferred Time (IST)" value={form.preferredTime2} />
                    <ReviewRow
                      label="Instructor Preference"
                      value={form.instructorPreference === "Any" ? "Any (Male or Female)" : `${form.instructorPreference} Instructor`}
                    />
                    <ReviewRow label="Tuition / Pricing" value="Personalized Plan (Trial is 100% Free)" />
                  </>
                ) : (
                  <>
                    <ReviewRow label="Cohort Tier" value={activeCohort.name} />
                    <ReviewRow label="Monthly Tuition" value={activeCohort.priceLabel} />
                    <ReviewRow label="Selected Batch Time" value={form.groupTimeSlot} />
                    <ReviewRow label="Trial Class" value="Free First Session Included" />
                  </>
                )}

                <ReviewRow label="Joining Date / Trial Date" value={form.joiningDate} />
              </ReviewCard>

              {form.message && (
                <ReviewCard title="Your Message / Health Notes">
                  <div className="review-message-text">"{form.message}"</div>
                </ReviewCard>
              )}

              {/* Review Actions */}
              <div className="step-actions dual-actions">
                <button
                  type="button"
                  className="btn-action-secondary"
                  onClick={() => setViewMode("form")}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  className="btn-action-submit"
                  onClick={handleSubmitBooking}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="btn-spinner" />
                      <span>Submitting enrollment…</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 2.5l-8 8M13.5 2.5H8.5M13.5 2.5V7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 5H3a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Confirm &amp; Book Trial Class</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="privacy-footer">
            🔒 Your personal information is encrypted, securely stored, and never shared with external third parties.
          </div>
        </div>
      </div>

      {/* ═══ RESPONSIVE CSS STYLES (WITH LEFT SCROLLBAR COMPLETELY REMOVED) ═══ */}
      <style>{`
        /* Page layout */
        .booking-page-container {
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(360px, 40%) 1fr;
          background: var(--bg);
        }

        /* Left Hero Panel - STRICTLY NO SCROLLBAR */
        .booking-left-panel {
          background: linear-gradient(160deg, #1C2770 0%, #3546B0 45%, #592D94 100%);
          padding: clamp(24px, 3.5vh, 40px) clamp(24px, 2.5vw, 36px);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden !important; /* Prevents scrollbar on left side */
          color: #fff;
          position: relative;
        }

        .booking-left-panel-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .left-glow-orb-1 {
          position: absolute;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(242,153,74,0.18) 0%, transparent 70%);
          top: -100px;
          right: -80px;
          pointer-events: none;
        }

        .left-glow-orb-2 {
          position: absolute;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%);
          bottom: -60px;
          left: -60px;
          pointer-events: none;
        }

        .brand-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: clamp(14px, 2vh, 24px);
          position: relative;
          z-index: 2;
          flex-shrink: 0;
        }

        .brand-logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-title {
          font-family: var(--font-display);
          font-size: 21px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .trial-badge {
          background: rgba(242, 153, 74, 0.18);
          border: 1px solid rgba(242, 153, 74, 0.45);
          color: #F2994A;
          font-size: 10.5px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .hero-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(242, 153, 74, 0.95);
          margin-bottom: 6px;
        }

        .hero-heading {
          font-family: var(--font-display);
          font-size: clamp(22px, 2.2vw, 28px);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          letter-spacing: -0.03em;
          margin-bottom: 10px;
        }

        .hero-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.5;
          margin-bottom: 14px;
        }

        .perks-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .perk-pill {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          padding: 3.5px 9px;
          border-radius: 12px;
        }

        .bullet-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding: 0;
        }

        .bullet-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.4;
        }

        .bullet-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #F2994A;
          flex-shrink: 0;
          margin-top: 6px;
        }

        .testimonial-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          margin-top: auto;
        }

        .testimonial-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.5;
          font-style: italic;
          margin-bottom: 8px;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .testimonial-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(242, 153, 74, 0.25);
          border: 1.5px solid rgba(242, 153, 74, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #F2994A;
        }

        .author-name {
          font-weight: 700;
          color: #ffffff;
          font-size: 12px;
        }

        .author-meta {
          color: rgba(255, 255, 255, 0.6);
          font-size: 10.5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Right Form Panel */
        .booking-right-panel {
          padding: 36px 44px;
          overflow-y: auto;
          max-height: 100vh;
          background: var(--bg);
        }

        .booking-form-wrapper {
          max-width: 660px;
          margin: 0 auto;
        }

        /* Flow steps pill */
        .flow-steps-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 30px;
          padding: 6px 14px;
          width: fit-content;
          margin-bottom: 24px;
        }

        .flow-step-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-faint);
        }

        .flow-step-item.active {
          color: var(--dusk);
          font-weight: 700;
        }

        .flow-step-item.done {
          color: var(--success);
        }

        .flow-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          background: var(--bg);
          color: var(--ink-soft);
        }

        .flow-step-item.active .flow-num {
          background: var(--dusk);
          color: #fff;
        }

        .flow-step-item.done .flow-num {
          background: var(--success);
          color: #fff;
        }

        .flow-divider {
          width: 24px;
          height: 1.5px;
          background: var(--border);
        }

        /* Cards in Form */
        .form-section-card {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          padding: 22px 24px;
          margin-bottom: 22px;
          box-shadow: 0 1px 3px rgba(23, 26, 50, 0.04);
        }

        .section-card-title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.01em;
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Sub section box */
        .sub-section-box {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
          margin-top: 14px;
          animation: stepFadeIn 0.2s ease-out;
        }

        .sub-section-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .sub-section-desc {
          font-size: 12.5px;
          color: var(--ink-soft);
          margin-bottom: 14px;
        }

        /* Form grids & inputs */
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .booking-field {
          margin-bottom: 16px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-soft);
          margin-bottom: 6px;
        }

        .field-required {
          color: var(--dawn);
          margin-left: 3px;
        }

        .field-error-text {
          font-size: 11.5px;
          color: var(--danger);
          margin-top: 4px;
          font-weight: 600;
        }

        .booking-input {
          width: 100%;
          padding: 10px 13px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 13.5px;
          color: var(--ink);
          background: var(--surface);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .booking-input:focus {
          border-color: var(--dusk);
          box-shadow: 0 0 0 3px rgba(76, 95, 213, 0.1);
        }

        .booking-select-wrapper {
          position: relative;
          width: 100%;
        }

        .booking-select {
          width: 100%;
          padding: 10px 32px 10px 13px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 13.5px;
          color: var(--ink);
          background: var(--surface);
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .booking-select:focus {
          border-color: var(--dusk);
          box-shadow: 0 0 0 3px rgba(76, 95, 213, 0.1);
        }

        .select-chevron {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--ink-soft);
        }

        /* Message Textarea (800 chars, production-ready) */
        .message-textarea-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .booking-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 13.5px;
          color: var(--ink);
          background: var(--surface);
          outline: none;
          resize: vertical;
          min-height: 100px;
          line-height: 1.55;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .booking-textarea:focus {
          border-color: var(--dusk);
          box-shadow: 0 0 0 3px rgba(76, 95, 213, 0.1);
        }

        .message-meta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2px 4px;
          gap: 10px;
        }

        .message-guidance-text {
          font-size: 11.5px;
          color: var(--ink-faint);
          line-height: 1.4;
        }

        .char-counter-pill {
          font-family: var(--font-mono);
          font-size: 11.5px;
          font-weight: 600;
          color: var(--ink-soft);
          background: var(--bg);
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid var(--border);
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .char-counter-pill.near-max {
          color: var(--warning);
          border-color: var(--warning);
          background: var(--warning-soft);
        }

        /* Pill option buttons (e.g. Gender, Language) */
        .pill-options-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pill-option-btn {
          flex: 1;
          min-width: 70px;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--ink);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .pill-option-btn:hover {
          border-color: var(--border-strong);
        }

        .pill-option-btn.selected {
          border-color: var(--dusk);
          background: var(--dusk-soft);
          color: var(--dusk);
          box-shadow: 0 1px 4px rgba(76, 95, 213, 0.12);
        }

        /* Class type cards (Private / Group) */
        .class-type-select-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .class-select-card {
          padding: 14px 16px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          text-align: left;
          transition: all 0.18s;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 10px;
        }

        .class-select-card:hover {
          border-color: var(--border-strong);
        }

        .class-select-card.selected {
          border-color: var(--dusk);
          background: var(--dusk-soft);
          box-shadow: 0 2px 8px rgba(76, 95, 213, 0.12);
        }

        .class-card-header {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .card-icon {
          font-size: 22px;
          line-height: 1;
        }

        .card-title {
          font-weight: 700;
          font-size: 14px;
          color: var(--ink);
        }

        .card-sub {
          font-size: 11.5px;
          color: var(--ink-soft);
          margin-top: 2px;
          line-height: 1.35;
        }

        .card-tag {
          font-size: 11px;
          font-weight: 700;
          color: var(--dusk);
          background: rgba(76, 95, 213, 0.1);
          padding: 3px 8px;
          border-radius: 6px;
          width: fit-content;
        }

        /* Group Cohorts Grid */
        .cohort-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }

        .cohort-card {
          padding: 14px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          text-align: left;
          transition: all 0.18s;
        }

        .cohort-card:hover {
          border-color: var(--border-strong);
        }

        .cohort-card.active {
          border-color: var(--dusk);
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(76, 95, 213, 0.15);
          outline: 2px solid var(--dusk);
        }

        .cohort-badge {
          font-size: 11px;
          font-weight: 700;
          color: var(--ink-soft);
          margin-bottom: 4px;
        }

        .cohort-name {
          font-weight: 700;
          font-size: 13.5px;
          color: var(--ink);
          line-height: 1.3;
          margin-bottom: 6px;
        }

        .cohort-price {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: var(--dusk);
        }

        .cohort-price span {
          font-size: 12px;
          font-weight: 500;
          color: var(--ink-soft);
        }

        .cohort-meta {
          font-size: 11px;
          color: var(--success);
          font-weight: 600;
          margin-top: 4px;
        }

        /* Time slot pill buttons */
        .time-slots-pills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 8px;
        }

        .slot-pill-btn {
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--ink);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s;
          text-align: left;
        }

        .slot-pill-btn:hover {
          border-color: var(--border-strong);
        }

        .slot-pill-btn.selected {
          border-color: var(--dusk);
          background: var(--dusk-soft);
          color: var(--dusk);
          box-shadow: 0 2px 6px rgba(76, 95, 213, 0.15);
        }

        .slot-clock {
          font-size: 13px;
        }

        /* Review components */
        .review-card {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 16px;
        }

        .review-card-header {
          padding: 10px 18px;
          background: var(--bg);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-soft);
          border-bottom: 1px solid var(--border);
        }

        .review-card-body {
          padding: 2px 0;
        }

        .review-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 18px;
          border-bottom: 1px solid var(--border);
          gap: 16px;
        }

        .review-row:last-child {
          border-bottom: none;
        }

        .review-row-label {
          font-size: 13px;
          color: var(--ink-soft);
          flex-shrink: 0;
        }

        .review-row-value {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--ink);
          text-align: right;
        }

        .review-message-text {
          padding: 12px 18px;
          font-size: 13.5px;
          color: var(--ink-soft);
          line-height: 1.6;
          font-style: italic;
        }

        /* Action Buttons */
        .step-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .dual-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-action-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 24px;
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          background: var(--dusk);
          color: #ffffff;
          flex: 1;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(76, 95, 213, 0.25);
        }

        .btn-action-primary:hover {
          background: #3c4ec5;
          transform: translateY(-1px);
        }

        .btn-action-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          background: var(--surface);
          color: var(--ink-soft);
          border: 1.5px solid var(--border);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .btn-action-secondary:hover {
          background: var(--bg);
          color: var(--ink);
        }

        .btn-action-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 24px;
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, var(--dusk) 0%, #6B3FA8 100%);
          color: #ffffff;
          flex: 1;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(76, 95, 213, 0.35);
        }

        .btn-action-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(76, 95, 213, 0.45);
        }

        .btn-action-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .global-error-banner {
          background: var(--danger-soft);
          border: 1px solid rgba(225, 72, 60, 0.3);
          color: var(--danger);
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .step-header {
          margin-bottom: 20px;
        }

        .step-title {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .step-subtitle {
          font-size: 13.5px;
          color: var(--ink-soft);
        }

        .privacy-footer {
          text-align: center;
          font-size: 12px;
          color: var(--ink-faint);
          margin-top: 24px;
          line-height: 1.6;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes stepFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ════════════════════════════════════════════════════════════════
           RESPONSIVE MEDIA QUERIES
        ════════════════════════════════════════════════════════════════ */
        @media (max-width: 960px) {
          .booking-page-container {
            grid-template-columns: 1fr;
          }

          .booking-left-panel {
            position: static;
            height: auto;
            padding: 28px 24px 24px;
            overflow: visible !important;
          }

          .hero-heading {
            font-size: 26px;
          }

          .booking-right-panel {
            max-height: none;
            overflow: visible;
            padding: 28px 20px 48px;
          }
        }

        @media (max-width: 640px) {
          .booking-left-panel {
            padding: 20px 16px;
          }

          .booking-right-panel {
            padding: 20px 14px 40px;
          }

          .form-section-card {
            padding: 16px;
          }

          .form-grid-2 {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .class-type-select-grid {
            grid-template-columns: 1fr;
          }

          .cohort-cards-grid {
            grid-template-columns: 1fr;
          }

          .time-slots-pills-grid {
            grid-template-columns: 1fr;
          }

          .desktop-break {
            display: none;
          }

          .step-title {
            font-size: 21px;
          }

          .step-subtitle {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
