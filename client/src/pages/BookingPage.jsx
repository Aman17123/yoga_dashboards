import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CountrySelect from "../components/CountrySelect";
import PhoneInputWithFlag from "../components/PhoneInputWithFlag";
import CountryFlag from "../components/CountryFlag";
import Navbar from "../components/Navbar";
import { findCountry } from "../constants/countries";
import { api } from "../services/api";

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

const YOGA_GOALS = [
  "Weight Loss & Toning",
  "Flexibility & Posture",
  "Stress Relief & Meditation",
  "Back & Neck Pain Relief",
  "Core & Body Strength",
  "Pranayama & Breathwork",
  "Pre / Postnatal Care",
  "Beginner Fundamentals",
];

// Group Class Cohorts & Slots
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

// Private 1:1 IST Time Slots
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

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "direct";
  const referralUrl = typeof document !== "undefined" ? document.referrer : "";

  // Auth session for navbar state
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem("yoga_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleNavbarLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!loginUsername.trim() || !loginPassword) {
      setLoginError("Please enter both username and password.");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await api.auth.login(loginUsername.trim(), loginPassword);
      if (res?.success) {
        setSession(res.session);
        localStorage.setItem("yoga_session", JSON.stringify(res.session));
        setShowLoginModal(false);
      } else {
        setLoginError("Invalid username or password.");
      }
    } catch (err) {
      setLoginError(err?.message || "Invalid credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("yoga_session");
  };

  // View mode: "form" or "review"
  const [viewMode, setViewMode] = useState("form");
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "Female",
    phone: "",
    country: "India",
    timezone: "Asia/Kolkata",
    language: "English",
    classType: "group",
    goals: ["Flexibility & Posture", "Stress Relief & Meditation"],
    preferredTime1: "7:00 am - 8:00 am IST",
    preferredTime2: "6:00 pm - 7:00 pm IST",
    instructorPreference: "Any",
    groupCohortId: "english",
    groupTimeSlot: "7:00 am - 8:00 am IST",
    joiningDate: todayStr,
    message: "",
  });

  const topRef = useRef(null);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleToggleGoal = (goal) => {
    setForm((prev) => {
      const curr = prev.goals || [];
      const updated = curr.includes(goal)
        ? curr.filter((g) => g !== goal)
        : [...curr, goal];
      return { ...prev, goals: updated };
    });
    if (errors.goals) {
      setErrors((prev) => ({ ...prev, goals: null }));
    }
  };

  const handleLanguageChange = (lang) => {
    set("language", lang);
    if (lang === "Hindi" && form.groupCohortId === "english") {
      setForm((prev) => ({
        ...prev,
        language: "Hindi",
        groupCohortId: "hindi",
        groupTimeSlot: GROUP_COHORTS.hindi.slots[1],
      }));
    } else if (lang === "English" && form.groupCohortId === "hindi") {
      setForm((prev) => ({
        ...prev,
        language: "English",
        groupCohortId: "english",
        groupTimeSlot: GROUP_COHORTS.english.slots[0],
      }));
    }
  };

  const handleGroupCohortChange = (cohortId) => {
    setForm((prev) => ({
      ...prev,
      groupCohortId: cohortId,
      groupTimeSlot: GROUP_COHORTS[cohortId].slots[0],
      language: GROUP_COHORTS[cohortId].language,
    }));
  };

  const handleCountryChange = (countryName) => {
    set("country", countryName);
    if (errors.country) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.country;
        return next;
      });
    }
  };

  const handleAgeChange = (val) => {
    const cleaned = val.replace(/\D/g, "");
    if (cleaned === "") {
      setForm((f) => ({ ...f, age: "" }));
      setErrors((prev) => ({ ...prev, age: "Age is required (5–100)." }));
      return;
    }
    const num = parseInt(cleaned, 10);
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

    const rawPhone = (form.phone || "").trim();
    if (!rawPhone) {
      errs.phone = "Phone number is required.";
    } else {
      const digitsOnly = rawPhone.replace(/\D/g, "");
      const dialCodeMatch = rawPhone.match(/^\+\d+/);
      const dialCodeDigits = dialCodeMatch ? dialCodeMatch[0].replace(/\D/g, "") : "";
      const subscriberDigits = digitsOnly.slice(dialCodeDigits.length);

      if (!subscriberDigits || subscriberDigits.length === 0) {
        errs.phone = "Please enter your phone number digits.";
      } else if (dialCodeMatch && dialCodeMatch[0] === "+91" && subscriberDigits.length !== 10) {
        errs.phone = "Please enter a valid 10-digit Indian phone number.";
      } else if (subscriberDigits.length < 6 || subscriberDigits.length > 15) {
        errs.phone = "Please enter a valid phone number (6 to 15 digits).";
      }
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

  const handleProceedToReview = () => {
    setGlobalError("");
    if (!validateForm()) {
      setGlobalError("Please review and fill in all required fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setViewMode("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      goals: Array.isArray(form.goals) ? form.goals.join(", ") : (form.goals || ""),
      preferredTime: form.classType === "private" ? form.preferredTime1 : form.groupTimeSlot,
      preferredTime2: form.classType === "private" ? form.preferredTime2 : "",
      instructorPreference: form.classType === "private" ? form.instructorPreference : "Any",
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
      navigate(`/book/success?ref=${encodeURIComponent(data.bookingRef)}`);
    } catch (err) {
      setGlobalError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const currentCountryObj = findCountry(form.country);
  const activeCohort = GROUP_COHORTS[form.groupCohortId];

  return (
    <div className="booking-page-root" ref={topRef}>
      {/* ═══ TOP NAVBAR ═══ */}
      <Navbar
        session={session}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        showBookNow={false}
      />

      {/* ═══ CENTERED BOOKING CONTAINER (SIMPLIFIED FULLY-FOCUSED PAGE) ═══ */}
      <main className="booking-centered-shell">
        <div className="booking-form-wrapper">

          {/* Page Hero Header */}
          <div className="booking-page-header">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E7E4DC] text-xs font-bold uppercase tracking-wider text-[#F2994A] shadow-2xs mb-3">
              <span>✨ Interactive Live Online Yoga · Free Trial Class</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171A32] leading-tight mb-2.5" style={{ fontFamily: "var(--font-display)" }}>
              Student Enrollment Form
            </h1>
            <p className="text-sm sm:text-base text-[#5B607A] max-w-xl mx-auto leading-relaxed">
              Reserve your trial session. Select your preferred timezone, batch timing, and practice goals below.
            </p>

            {/* 24h SLA Notice Banner (Requirement 1) */}
            <div className="sla-banner-box">
              <div className="sla-badge">⏱️ 24h SLA</div>
              <p className="sla-banner-text">
                <strong>Instructor Matching within 24 Hours:</strong> Our certified master team carefully reviews your goals, timezone, and class preferences to assign your ideal instructor. Once assigned, your instructor details and dedicated class link will automatically appear on your dashboard.
              </p>
            </div>
          </div>

          {/* View Step Indicator */}
          <div className="flow-steps-pill mx-auto">
            <div className={`flow-step-item ${viewMode === "form" ? "active" : "done"}`}>
              <span className="flow-num">{viewMode === "review" ? "✓" : "1"}</span>
              <span>1. Enrollment Details</span>
            </div>
            <div className="flow-divider" />
            <div className={`flow-step-item ${viewMode === "review" ? "active" : ""}`}>
              <span className="flow-num">2</span>
              <span>2. Review &amp; Confirm</span>
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
              VIEW 1: CLEAN SINGLE ENROLLMENT FORM
             ═════════════════════════════════════════════════════════════ */}
          {viewMode === "form" && (
            <div className="form-step-container">
              {/* SECTION 1: Personal Details */}
              <div className="form-section-card">
                <div className="section-card-title">
                  <span>1. Personal Information</span>
                  <span className="text-xs font-normal text-[#7B8098]">Step 1 of 2</span>
                </div>

                {/* Name & Email */}
                <div className="form-grid-2">
                  <Field label="Full Name" required error={errors.name} id="name">
                    <Input
                      id="name"
                      value={form.name}
                      placeholder="e.g. Aarav Sharma"
                      style={errors.name ? { borderColor: "var(--danger)" } : {}}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </Field>

                  <Field label="Email Address" required error={errors.email} id="email">
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

                {/* Phone & Country */}
                <div className="form-grid-2">
                  <Field label="Phone / WhatsApp Number" required error={errors.phone}>
                    <PhoneInputWithFlag
                      id="phone"
                      value={form.phone}
                      country={form.country}
                      onChange={(val) => set("phone", val)}
                      error={!!errors.phone}
                    />
                  </Field>

                  <Field label="Country of Residence" required error={errors.country}>
                    <CountrySelect
                      value={form.country}
                      onChange={handleCountryChange}
                      error={!!errors.country}
                      placeholder="Select country…"
                    />
                  </Field>
                </div>

                {/* Timezone & Language Preference */}
                <div className="form-grid-2">
                  <Field label="Your Timezone" required>
                    <Select value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.flag} {tz.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Language Preference" required>
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
                        🌐 English
                      </button>
                    </div>
                  </Field>
                </div>
              </div>

              {/* SECTION 2: Class Type & Schedule */}
              <div className="form-section-card">
                <div className="section-card-title">
                  <span>2. Class Type &amp; Schedule</span>
                  <span className="text-xs font-normal text-[#7B8098]">Step 2 of 2</span>
                </div>

                {/* Class Type Selector */}
                <Field label="Class Format" required>
                  <div className="class-type-toggle-grid">
                    <button
                      type="button"
                      onClick={() => set("classType", "group")}
                      className={`class-card-toggle ${form.classType === "group" ? "active" : ""}`}
                    >
                      <div className="card-toggle-top">
                        <span className="card-toggle-icon">👥</span>
                        <div className="card-toggle-badge">Cohort</div>
                      </div>
                      <div className="card-toggle-name">Group Class</div>
                      <div className="card-toggle-desc">
                        Interactive small cohorts with live instructor feedback.
                      </div>
                      <div className="card-toggle-price">Starting ₹999 / mo</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => set("classType", "private")}
                      className={`class-card-toggle ${form.classType === "private" ? "active" : ""}`}
                    >
                      <div className="card-toggle-top">
                        <span className="card-toggle-icon">🧘</span>
                        <div className="card-toggle-badge popular">1-on-1</div>
                      </div>
                      <div className="card-toggle-name">Private 1:1 Coaching</div>
                      <div className="card-toggle-desc">
                        100% personalized attention tailored to your health goals.
                      </div>
                      <div className="card-toggle-price">Personalized Plan</div>
                    </button>
                  </div>
                </Field>

                {/* Conditional Sub-form: GROUP vs PRIVATE */}
                {form.classType === "group" ? (
                  <div className="group-options-wrap animate-fadeIn">
                    <Field label="Select Group Cohort Tier" required>
                      <div className="cohort-tiers-grid">
                        {Object.values(GROUP_COHORTS).map((cohort) => (
                          <div
                            key={cohort.id}
                            onClick={() => handleGroupCohortChange(cohort.id)}
                            className={`cohort-tier-card ${form.groupCohortId === cohort.id ? "selected" : ""}`}
                          >
                            <div className="cohort-tier-radio">
                              <span className={`radio-dot ${form.groupCohortId === cohort.id ? "checked" : ""}`} />
                            </div>
                            <div className="cohort-tier-content">
                              <div className="cohort-name">{cohort.name}</div>
                              <div className="cohort-lang">Language: {cohort.language}</div>
                              <div className="cohort-price">{cohort.priceLabel}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Field>

                    <Field label={`Available Batch Slots (${activeCohort.language} Cohort)`} required error={errors.groupTimeSlot}>
                      <Select
                        value={form.groupTimeSlot}
                        onChange={(e) => set("groupTimeSlot", e.target.value)}
                      >
                        {activeCohort.slots.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                ) : (
                  <div className="private-options-wrap animate-fadeIn">
                    <div className="form-grid-2">
                      <Field label="1st Preferred Time Slot (IST)" required error={errors.preferredTime1}>
                        <Select
                          value={form.preferredTime1}
                          onChange={(e) => set("preferredTime1", e.target.value)}
                        >
                          {PRIVATE_TIME_SLOTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Select>
                      </Field>

                      <Field label="2nd Preferred Time Slot (IST)" required error={errors.preferredTime2}>
                        <Select
                          value={form.preferredTime2}
                          onChange={(e) => set("preferredTime2", e.target.value)}
                        >
                          {PRIVATE_TIME_SLOTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>

                    <Field label="Instructor Preference">
                      <div className="pill-options-row">
                        {["Any", "Female", "Male"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => set("instructorPreference", p)}
                            className={`pill-option-btn ${form.instructorPreference === p ? "selected" : ""}`}
                          >
                            {p === "Any" ? "Any (Male or Female)" : `${p} Instructor`}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                {/* Preferred Trial Date */}
                <div className="mt-4">
                  <Field label="Preferred Trial / Joining Date" required error={errors.joiningDate} id="joiningDate">
                    <Input
                      id="joiningDate"
                      type="date"
                      min={todayStr}
                      value={form.joiningDate}
                      onChange={(e) => set("joiningDate", e.target.value)}
                    />
                  </Field>
                </div>

                {/* Big Health Notes / Specific Inquiries Section (900 character limit) */}
                <div className="mt-5 pt-4 border-t border-[#E7E4DC]">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <label htmlFor="health-notes" className="field-label text-sm font-bold text-[#171A32] mb-0">
                      Health Notes / Specific Inquiries (Optional)
                    </label>
                    <span className={`text-xs font-mono font-semibold ${form.message.length >= 850 ? "text-amber-600 font-bold" : "text-[#7B8098]"}`}>
                      {form.message.length} / 900 characters
                    </span>
                  </div>
                  <p className="text-xs text-[#5B607A] mb-3 leading-relaxed">
                    Please share any medical conditions, injuries (e.g. back/neck/knee pain), recent surgeries, pregnancy, flexibility concerns, or specific practice goals. Our certified yoga masters review these notes prior to your first live trial session.
                  </p>
                  <textarea
                    id="health-notes"
                    rows={6}
                    maxLength={900}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value.slice(0, 900))}
                    placeholder="e.g. Recovering from a lower back injury, working long desk hours, looking for gentle stretching, posture correction, and breathing exercises..."
                    className="booking-textarea w-full p-3.5 rounded-xl border border-[#D5D8E4] focus:border-[#4C5FD5] focus:ring-2 focus:ring-[#4C5FD5]/20 text-sm text-[#171A32] placeholder-[#A0A4B8] bg-white transition-all outline-none resize-y min-h-[140px] leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="step-actions mt-6">
                <button
                  type="button"
                  id="review-booking-btn"
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
              VIEW 2: REVIEW LOOK BEFORE FINAL CONFIRMATION
             ═════════════════════════════════════════════════════════════ */}
          {viewMode === "review" && (
            <div className="form-step-container animate-fadeIn">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#171A32]" style={{ fontFamily: "var(--font-display)" }}>
                  Review Your Enrollment
                </h2>
                <p className="text-xs text-[#5B607A] mt-1">
                  Please confirm your information below before reserving your free trial session.
                </p>
              </div>

              {/* 24-hour match callout */}
              <div className="sla-banner-box mb-5">
                <div className="sla-badge">⏱️ 24h Instructor Match</div>
                <p className="sla-banner-text">
                  Your certified yoga master will be paired within 24 hours based on your class schedule, language preference, and health inquiries.
                </p>
              </div>

              {/* Card 1: Student Information */}
              <ReviewCard title="Student Information">
                <ReviewRow label="Full Name" value={form.name} />
                <ReviewRow label="Email Address" value={form.email} />
                <ReviewRow label="Age" value={`${form.age} years`} />
                <ReviewRow label="Gender" value={form.gender} />
                <ReviewRow label="Phone / WhatsApp">
                  <div className="flex items-center gap-2 justify-end">
                    <CountryFlag country={currentCountryObj} size="xs" />
                    <span>{form.phone}</span>
                  </div>
                </ReviewRow>
                <ReviewRow label="Country of Residence">
                  <div className="flex items-center gap-2 justify-end">
                    <CountryFlag country={currentCountryObj} size="sm" />
                    <span>{form.country}</span>
                  </div>
                </ReviewRow>
                <ReviewRow
                  label="Student Timezone"
                  value={TIMEZONES.find((t) => t.value === form.timezone)?.label || form.timezone}
                />
                <ReviewRow label="Language Preference" value={form.language} />
              </ReviewCard>

              {/* Card 2: Class & Schedule Details */}
              <ReviewCard title="Class &amp; Schedule Details">
                <ReviewRow
                  label="Class Type"
                  value={form.classType === "private" ? "Private 1:1 Coaching" : "Group Cohort"}
                />

                {form.classType === "private" ? (
                  <>
                    <ReviewRow label="1st Preferred Time (IST)" value={form.preferredTime1} />
                    <ReviewRow label="2nd Preferred Time (IST)" value={form.preferredTime2} />
                    <ReviewRow
                      label="Instructor Preference"
                      value={form.instructorPreference === "Any" ? "Any (Male or Female)" : `${form.instructorPreference} Instructor`}
                    />
                    <ReviewRow label="Tuition" value="Personalized Plan (First Trial is 100% Free)" />
                  </>
                ) : (
                  <>
                    <ReviewRow label="Cohort Tier" value={activeCohort.name} />
                    <ReviewRow label="Monthly Tuition" value={activeCohort.priceLabel} />
                    <ReviewRow label="Selected Batch Time" value={form.groupTimeSlot} />
                    <ReviewRow label="Trial Class" value="Free First Session Included" />
                  </>
                )}

                <ReviewRow label="Trial / Joining Date" value={form.joiningDate} />
              </ReviewCard>

              {/* Card 3: Health Notes & Specific Inquiries */}
              <ReviewCard title="Health Notes &amp; Specific Inquiries">
                {form.message ? (
                  <div className="p-3.5 bg-[#F6F7FB] rounded-xl border border-[#E3E6F2] text-sm text-[#171A32] leading-relaxed whitespace-pre-wrap font-normal">
                    "{form.message}"
                  </div>
                ) : (
                  <div className="text-xs text-[#7B8098] italic">No specific health notes provided.</div>
                )}
              </ReviewCard>

              {/* Review Actions */}
              <div className="step-actions dual-actions mt-6">
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
                  id="confirm-booking-btn"
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
          <div className="privacy-footer text-center mt-6">
            🔒 Your personal information is encrypted, securely stored, and never shared with external third parties.
          </div>
        </div>
      </main>

      {/* Login Modal for Navbar if accessed from /book */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-[16px] border border-[#DCD8D0] p-7 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-lg cursor-pointer p-1"
            >
              ✕
            </button>

            <h3 className="font-bold text-xl text-[#171A32] mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
              yogaonlive Login
            </h3>
            <p className="text-xs text-[#6B7089] mb-5">
              Sign in to view your dashboard, schedules, and dedicated class meeting link.
            </p>

            <form onSubmit={handleNavbarLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7089] mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. admin or your username"
                  required
                  autoFocus
                  className="w-full text-sm bg-[#FCFAF7] border border-[#DCD8D0] rounded-[6px] px-3.5 py-2.5 text-[#171A32] focus:outline-none focus:border-[#4C5FD5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7089] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full text-sm bg-[#FCFAF7] border border-[#DCD8D0] rounded-[6px] px-3.5 py-2.5 text-[#171A32] focus:outline-none focus:border-[#4C5FD5]"
                />
              </div>

              {loginError && (
                <div className="text-xs text-[#D93025] bg-[#FFF1F0] p-2.5 rounded-[6px] border border-[#FAD2CF]">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 bg-[#4C5FD5] hover:bg-[#3B4DBF] text-white rounded-[6px] font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                {loginLoading ? "Signing in…" : "Login"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ CLEAN, MODERN, RESPONSIVE CSS STYLES (NO LEFTSIDE SCROLLBAR / LEFTOVER SPACE) ═══ */}
      <style>{`
        .booking-page-root {
          min-height: 100vh;
          background: #FCFAF7;
          display: flex;
          flex-direction: column;
          color: #171A32;
        }

        .booking-centered-shell {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: clamp(24px, 4vw, 48px) 16px clamp(48px, 6vw, 80px);
        }

        .booking-form-wrapper {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
        }

        .booking-page-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .sla-banner-box {
          margin-top: 18px;
          background: linear-gradient(135deg, #F0F4FF 0%, #E8F0FE 100%);
          border: 1.5px solid #CBD8F7;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          sm-flex-direction: row;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .sla-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #4C5FD5;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 3px 10px;
          border-radius: 20px;
          flex-shrink: 0;
        }

        .sla-banner-text {
          font-size: 12.5px;
          color: #24357B;
          line-height: 1.45;
          margin: 0;
        }

        /* Flow steps indicator */
        .flow-steps-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #FFFFFF;
          border: 1.5px solid #E7E4DC;
          border-radius: 30px;
          padding: 6px 16px;
          width: fit-content;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }

        .flow-step-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: #8C90A4;
        }

        .flow-step-item.active {
          color: #4C5FD5;
          font-weight: 700;
        }

        .flow-step-item.done {
          color: #1E9E63;
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
          background: #F0ECE1;
          color: #5B607A;
        }

        .flow-step-item.active .flow-num {
          background: #4C5FD5;
          color: #fff;
        }

        .flow-step-item.done .flow-num {
          background: #1E9E63;
          color: #fff;
        }

        .flow-divider {
          width: 24px;
          height: 1.5px;
          background: #E7E4DC;
        }

        /* Section cards */
        .form-section-card {
          background: #FFFFFF;
          border: 1.5px solid #E7E4DC;
          border-radius: 14px;
          padding: clamp(18px, 3vw, 26px);
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(23, 26, 50, 0.04);
        }

        .section-card-title {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          color: #171A32;
          letter-spacing: -0.01em;
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 1px solid #F0ECE1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 640px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        .booking-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .field-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #454A62;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .field-required {
          color: #D93025;
        }

        .field-error-text {
          font-size: 11.5px;
          color: #D93025;
          margin-top: 2px;
          font-weight: 500;
        }

        .booking-input {
          width: 100%;
          background: #FCFAF7;
          border: 1.5px solid #DCD8D0;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          color: #171A32;
          transition: all 0.15s ease;
          outline: none;
        }

        .booking-input:focus {
          background: #FFFFFF;
          border-color: #4C5FD5;
          box-shadow: 0 0 0 3px rgba(76, 95, 213, 0.12);
        }

        .booking-textarea {
          width: 100%;
          background: #FCFAF7;
          border: 1.5px solid #DCD8D0;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14.5px;
          line-height: 1.6;
          color: #171A32;
          transition: all 0.15s ease;
          outline: none;
          font-family: inherit;
        }

        .booking-textarea:focus {
          background: #FFFFFF;
          border-color: #4C5FD5;
          box-shadow: 0 0 0 3px rgba(76, 95, 213, 0.12);
        }

        .booking-select-wrapper {
          position: relative;
          width: 100%;
        }

        .booking-select {
          width: 100%;
          appearance: none;
          background: #FCFAF7;
          border: 1.5px solid #DCD8D0;
          border-radius: 8px;
          padding: 10px 36px 10px 14px;
          font-size: 14px;
          color: #171A32;
          cursor: pointer;
          outline: none;
          transition: all 0.15s ease;
        }

        .booking-select:focus {
          background: #FFFFFF;
          border-color: #4C5FD5;
          box-shadow: 0 0 0 3px rgba(76, 95, 213, 0.12);
        }

        .select-chevron {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #7B8098;
        }

        /* Pill options */
        .pill-options-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pill-option-btn {
          flex: 1;
          min-width: 90px;
          background: #FCFAF7;
          border: 1.5px solid #DCD8D0;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 12.5px;
          font-weight: 600;
          color: #5B607A;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }

        .pill-option-btn:hover {
          border-color: #A3A8C3;
          color: #171A32;
        }

        .pill-option-btn.selected {
          background: #4C5FD5;
          border-color: #4C5FD5;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(76, 95, 213, 0.25);
        }

        /* Goals chips grid */
        .goals-chips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 8px;
        }

        .goal-chip-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FCFAF7;
          border: 1.5px solid #DCD8D0;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 12.5px;
          font-weight: 600;
          color: #454A62;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .goal-chip-btn:hover {
          border-color: #4C5FD5;
          background: #F8F9FE;
        }

        .goal-chip-btn.selected {
          background: #EEF2FD;
          border-color: #4C5FD5;
          color: #2F3E9E;
        }

        .goal-check-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          background: #E4E1DB;
          color: #5B607A;
          flex-shrink: 0;
        }

        .goal-chip-btn.selected .goal-check-icon {
          background: #4C5FD5;
          color: #ffffff;
        }

        /* Class card toggle */
        .class-type-toggle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 580px) {
          .class-type-toggle-grid {
            grid-template-columns: 1fr;
          }
        }

        .class-card-toggle {
          background: #FCFAF7;
          border: 2px solid #E7E4DC;
          border-radius: 12px;
          padding: 16px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .class-card-toggle:hover {
          border-color: #B5BCDF;
        }

        .class-card-toggle.active {
          background: #F8F9FE;
          border-color: #4C5FD5;
          box-shadow: 0 4px 12px rgba(76, 95, 213, 0.12);
        }

        .card-toggle-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .card-toggle-icon {
          font-size: 20px;
        }

        .card-toggle-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 7px;
          border-radius: 12px;
          background: #E8E6E0;
          color: #5B607A;
        }

        .card-toggle-badge.popular {
          background: #FDE8D7;
          color: #C05621;
        }

        .card-toggle-name {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: #171A32;
          margin-bottom: 4px;
        }

        .card-toggle-desc {
          font-size: 12px;
          color: #6B7089;
          line-height: 1.35;
          margin-bottom: 8px;
        }

        .card-toggle-price {
          font-size: 12px;
          font-weight: 700;
          color: #4C5FD5;
        }

        /* Cohort tiers */
        .cohort-tiers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 14px;
        }

        @media (max-width: 580px) {
          .cohort-tiers-grid {
            grid-template-columns: 1fr;
          }
        }

        .cohort-tier-card {
          display: flex;
          gap: 10px;
          background: #FCFAF7;
          border: 1.5px solid #DCD8D0;
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cohort-tier-card:hover {
          border-color: #4C5FD5;
        }

        .cohort-tier-card.selected {
          background: #F0F4FF;
          border-color: #4C5FD5;
        }

        .radio-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid #A3A8C3;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radio-dot.checked {
          border-color: #4C5FD5;
          background: #4C5FD5;
        }

        .cohort-name {
          font-size: 13px;
          font-weight: 700;
          color: #171A32;
        }

        .cohort-lang {
          font-size: 11.5px;
          color: #6B7089;
        }

        .cohort-price {
          font-size: 12px;
          font-weight: 700;
          color: #1E9E63;
          margin-top: 2px;
        }

        /* Submit actions */
        .step-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-action-primary, .btn-action-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #4C5FD5;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          padding: 13px 26px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(76, 95, 213, 0.28);
        }

        .btn-action-primary:hover, .btn-action-submit:hover {
          background: #3B4DBF;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(76, 95, 213, 0.35);
        }

        .btn-action-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          color: #454A62;
          font-size: 13px;
          font-weight: 700;
          padding: 12px 20px;
          border-radius: 10px;
          border: 1.5px solid #DCD8D0;
          cursor: pointer;
        }

        .btn-action-secondary:hover {
          background: #F6F4EE;
        }

        .dual-actions {
          justify-content: space-between;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Review Cards */
        .review-card {
          background: #FFFFFF;
          border: 1.5px solid #E7E4DC;
          border-radius: 12px;
          margin-bottom: 14px;
          overflow: hidden;
        }

        .review-card-header {
          background: #F8F7F3;
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #5B607A;
          border-bottom: 1px solid #E7E4DC;
        }

        .review-card-body {
          padding: 8px 16px;
        }

        .review-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #F0ECE1;
          font-size: 13px;
        }

        .review-row:last-child {
          border-bottom: none;
        }

        .review-row-label {
          color: #6B7089;
        }

        .review-row-value {
          font-weight: 600;
          color: #171A32;
        }

        .review-message-text {
          padding: 8px 0;
          font-style: italic;
          font-size: 13px;
          color: #5B607A;
        }

        .privacy-footer {
          font-size: 11.5px;
          color: #8C90A4;
        }

        .global-error-banner {
          background: #FDE8E8;
          border: 1.5px solid #F8B4B4;
          color: #9B1C1C;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}
