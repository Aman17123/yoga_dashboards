import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CountrySelect from "../components/CountrySelect";
import PhoneInputWithFlag from "../components/PhoneInputWithFlag";
import CountryFlag from "../components/CountryFlag";
import Navbar from "../components/Navbar";
import { findCountry, findCountryByDialCode, COUNTRIES_DATA } from "../constants/countries";
import { api } from "../services/api";
import {
  INITIAL_INSTRUCTORS,
  INITIAL_CLASSES,
  getTeacherTitle,
  normalizeTimeSlot,
} from "../constants/initialData";
import {
  convertSlotToTimezone,
  parseSlotIST,
  offsetSentence,
} from "../utils/dateUtils";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY_TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST — UTC+5:30)", flag: "🇮🇳", country: "India" },
  { value: "America/New_York", label: "United States - East (EST/EDT)", flag: "🇺🇸", country: "United States" },
  { value: "America/Chicago", label: "United States - Central (CST/CDT)", flag: "🇺🇸", country: "United States" },
  { value: "America/Denver", label: "United States - Mountain (MST/MDT)", flag: "🇺🇸", country: "United States" },
  { value: "America/Los_Angeles", label: "United States - West (PST/PDT)", flag: "🇺🇸", country: "United States" },
  { value: "Europe/London", label: "United Kingdom (GMT/BST)", flag: "🇬🇧", country: "United Kingdom" },
  { value: "Asia/Dubai", label: "United Arab Emirates (GST — UTC+4)", flag: "🇦🇪", country: "United Arab Emirates" },
  { value: "Asia/Qatar", label: "Qatar (AST — UTC+3)", flag: "🇶🇦", country: "Qatar" },
  { value: "Asia/Singapore", label: "Singapore (SGT — UTC+8)", flag: "🇸🇬", country: "Singapore" },
  { value: "America/Toronto", label: "Canada - East (EST/EDT)", flag: "🇨🇦", country: "Canada" },
  { value: "America/Vancouver", label: "Canada - West (PST/PDT)", flag: "🇨🇦", country: "Canada" },
  { value: "Australia/Sydney", label: "Australia - East (AEST)", flag: "🇦🇺", country: "Australia" },
  { value: "Australia/Perth", label: "Australia - West (AWST)", flag: "🇦🇺", country: "Australia" },
];

const primaryTzSet = new Set(PRIMARY_TIMEZONES.map((t) => t.value));
const OTHER_TIMEZONES = COUNTRIES_DATA.filter(
  (c) => c.defaultTz && !primaryTzSet.has(c.defaultTz) && c.code !== "Other"
).map((c) => ({
  value: c.defaultTz,
  label: `${c.name} (${c.defaultTz.split("/")[1]?.replace(/_/g, " ") || c.defaultTz})`,
  flag: c.flag,
  country: c.name,
}));

const TIMEZONES = [...PRIMARY_TIMEZONES, ...OTHER_TIMEZONES];

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
    instructor: "Rohan Mehta",
    timingSchedule: "Daily: 5:00 am – 8:00 pm IST (8 Batches)",
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
    instructor: "Priya Nair",
    timingSchedule: "Daily: 7:00 am – 8:30 pm IST (Morning & Evening)",
    slots: [
      "7:00 am - 8:00 am IST",
      "6:30 pm - 7:30 pm IST",
      "7:30 pm - 8:30 pm IST",
    ],
  },
};

// Private 1:1 Plans & Frequencies (Hindi & English)
const PRIVATE_PLANS = {
  hindi: {
    language: "Hindi",
    label: "Hindi Medium (हिंदी)",
    plans: [
      {
        id: "hindi-regular",
        category: "regular",
        title: "Regular Yoga Plan",
        levelBadge: "Beginner to Intermediate",
        isSpecialized: false,
        desc: "Tailored 1-on-1 sessions built around your unique body condition, routine, flexibility and fitness goals.",
        frequencies: [
          {
            days: "2 Days a Week",
            sessions: "8 live sessions / month",
            price: 4299,
            priceLabel: "₹4,299 /mo",
            isPopular: false,
          },
          {
            days: "3 Days a Week",
            sessions: "12 live sessions / month",
            price: 5799,
            priceLabel: "₹5,799 /mo",
            isPopular: false,
          },
          {
            days: "5 Days a Week",
            sessions: "20 live sessions / month",
            price: 8399,
            priceLabel: "₹8,399 /mo",
            isPopular: true,
          },
        ],
      },
      {
        id: "hindi-advanced",
        category: "advanced",
        title: "Pregnancy & Advanced Yoga",
        levelBadge: "Prenatal / Ashtanga / Therapy",
        isSpecialized: true,
        desc: "Custom therapeutic sessions for prenatal/postnatal wellness, doctor-aligned safe movements, or intensive Ashtanga & Iyengar alignment.",
        frequencies: [
          {
            days: "2 Days a Week",
            sessions: "8 live sessions / month",
            price: 5299,
            priceLabel: "₹5,299 /mo",
            isPopular: false,
          },
          {
            days: "3 Days a Week",
            sessions: "12 live sessions / month",
            price: 6799,
            priceLabel: "₹6,799 /mo",
            isPopular: false,
          },
          {
            days: "5 Days a Week",
            sessions: "20 live sessions / month",
            price: 9599,
            priceLabel: "₹9,599 /mo",
            isPopular: true,
          },
        ],
      },
    ],
  },
  english: {
    language: "English",
    label: "English Medium",
    plans: [
      {
        id: "english-regular",
        category: "regular",
        title: "Regular Yoga Plan",
        levelBadge: "Beginner to Intermediate",
        isSpecialized: false,
        desc: "Tailored 1-on-1 sessions built around your unique body condition, routine, flexibility and fitness goals.",
        frequencies: [
          {
            days: "2 Days a Week",
            sessions: "8 live sessions / month",
            price: 6799,
            priceLabel: "₹6,799 /mo",
            isPopular: false,
          },
          {
            days: "3 Days a Week",
            sessions: "12 live sessions / month",
            price: 8399,
            priceLabel: "₹8,399 /mo",
            isPopular: false,
          },
          {
            days: "5 Days a Week",
            sessions: "20 live sessions / month",
            price: 11899,
            priceLabel: "₹11,899 /mo",
            isPopular: true,
          },
        ],
      },
      {
        id: "english-advanced",
        category: "advanced",
        title: "Pregnancy & Advanced Yoga",
        levelBadge: "Prenatal / Ashtanga / Therapy",
        isSpecialized: true,
        desc: "Custom therapeutic sessions for prenatal/postnatal wellness, doctor-aligned safe movements, or intensive Ashtanga & Iyengar alignment.",
        frequencies: [
          {
            days: "2 Days a Week",
            sessions: "8 live sessions / month",
            price: 8499,
            priceLabel: "₹8,499 /mo",
            isPopular: false,
          },
          {
            days: "3 Days a Week",
            sessions: "12 live sessions / month",
            price: 10999,
            priceLabel: "₹10,999 /mo",
            isPopular: false,
          },
          {
            days: "5 Days a Week",
            sessions: "20 live sessions / month",
            price: 15299,
            priceLabel: "₹15,299 /mo",
            isPopular: true,
          },
        ],
      },
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

function Field({ label, hint, required, error, children, id }) {
  return (
    <div className={`booking-field ${error ? "has-error" : ""}`}>
      {label && (
        <label htmlFor={id} className="field-label">
          <span>{label}</span>
          {required && <span className="field-required">*</span>}
        </label>
      )}
      {hint && <p className="field-hint-text">{hint}</p>}
      {children}
      {error && <div className="field-error-text">{error}</div>}
    </div>
  );
}

function Input({ style, ...props }) {
  return <input className="booking-input" style={style} {...props} />;
}

function CustomSelect({
  value,
  onChange,
  options,
  children,
  placeholder = "Select an option…",
  error = false,
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const normalizedOptions = React.useMemo(() => {
    if (Array.isArray(options) && options.length > 0) {
      return options.map((opt) => {
        if (typeof opt === "object" && opt !== null) {
          return {
            value: opt.value,
            label: opt.label,
            sublabel: opt.sublabel || null,
            badge: opt.badge || null,
            icon: opt.icon || null,
          };
        }
        return {
          value: opt,
          label: opt,
          sublabel: null,
          badge: null,
          icon: null,
        };
      });
    }

    if (children) {
      return React.Children.toArray(children)
        .filter(
          (child) => React.isValidElement(child) && child.type === "option",
        )
        .map((child) => {
          const rawChildren = child.props.children;
          let labelText = "";
          let explicitIcon = child.props["data-icon"] || null;
          let sublabel = child.props["data-sublabel"] || null;
          let badge = child.props["data-badge"] || null;

          if (Array.isArray(rawChildren)) {
            labelText = rawChildren
              .filter(Boolean)
              .map((item) =>
                typeof item === "string" ? item.trim() : String(item),
              )
              .join(" ")
              .trim();
          } else if (typeof rawChildren === "string") {
            labelText = rawChildren.trim();
          } else {
            labelText = String(rawChildren || "");
          }

          // Cleanly extract icon and remove duplicate icon/emoji from the display label
          let detectedIcon = explicitIcon;
          let displayLabel = labelText;

          if (typeof displayLabel === "string") {
            const emojiMatch = displayLabel.match(
              /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\uD83C[\uDDE6-\uDDFF]{2})\s*/u,
            );
            if (emojiMatch) {
              if (!detectedIcon) {
                detectedIcon = emojiMatch[1];
              }
              displayLabel = displayLabel.slice(emojiMatch[0].length).trim();
            } else if (
              detectedIcon &&
              typeof detectedIcon === "string" &&
              displayLabel.startsWith(detectedIcon.trim())
            ) {
              displayLabel = displayLabel
                .slice(detectedIcon.trim().length)
                .trim();
            }
            if (
              displayLabel.startsWith("-") ||
              displayLabel.startsWith("—") ||
              displayLabel.startsWith("·")
            ) {
              displayLabel = displayLabel.slice(1).trim();
            }
          }

          return {
            value:
              child.props.value !== undefined ? child.props.value : labelText,
            label: displayLabel || labelText,
            sublabel,
            badge,
            icon: detectedIcon,
          };
        });
    }

    return [];
  }, [options, children]);

  const selectedOpt = normalizedOptions.find(
    (o) => String(o.value) === String(value),
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { value: val } });
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currIndex = normalizedOptions.findIndex(
          (o) => String(o.value) === String(value),
        );
        if (currIndex < normalizedOptions.length - 1) {
          handleSelect(normalizedOptions[currIndex + 1].value);
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currIndex = normalizedOptions.findIndex(
          (o) => String(o.value) === String(value),
        );
        if (currIndex > 0) {
          handleSelect(normalizedOptions[currIndex - 1].value);
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${isOpen ? "is-open" : ""}`}
    >
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`custom-select-trigger ${error ? "has-error" : ""} ${isOpen ? "active" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="custom-select-trigger-content">
          {selectedOpt?.icon && (
            <span className="custom-select-icon">{selectedOpt.icon}</span>
          )}
          <div className="custom-select-text-group">
            <span className="custom-select-main-label">
              {selectedOpt ? selectedOpt.label : placeholder}
            </span>
            {selectedOpt?.sublabel && (
              <span className="custom-select-sub-label">
                {selectedOpt.sublabel}
              </span>
            )}
          </div>
          {selectedOpt?.badge && (
            <span className="custom-select-badge">{selectedOpt.badge}</span>
          )}
        </div>
        <div className={`custom-select-chevron ${isOpen ? "rotate" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 4.5l3.5 3.5 3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="custom-select-popover" role="listbox">
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <div
                key={String(opt.value)}
                onClick={() => handleSelect(opt.value)}
                className={`custom-select-option ${isSelected ? "selected" : ""}`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="custom-select-option-left">
                  {opt.icon && (
                    <span className="custom-select-opt-icon">{opt.icon}</span>
                  )}
                  <div className="min-w-0">
                    <div className="custom-select-opt-label">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="custom-select-opt-sub">
                        {opt.sublabel}
                      </div>
                    )}
                  </div>
                </div>
                <div className="custom-select-option-right">
                  {opt.badge && (
                    <span className="custom-select-opt-badge">{opt.badge}</span>
                  )}
                  {isSelected && (
                    <svg
                      className="custom-select-check"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M3 8.5l3.5 3.5L13 4.5"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const Select = CustomSelect;

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
    classType: "",
    phoneCountry: "India",
    privatePlanCategory: "regular",
    privateFrequency: "5 Days a Week",
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
    if (form.classType === "group") {
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

  const handleCountryChange = (countryName, countryObj) => {
    const cObj = countryObj || findCountry(countryName);
    const targetTz = cObj?.defaultTz || form.timezone;
    setForm((prev) => ({
      ...prev,
      country: countryName,
      timezone: targetTz,
    }));
    if (errors.country) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.country;
        return next;
      });
    }
  };

  const handleTimezoneChange = (tzValue) => {
    const tzMatch = TIMEZONES.find((t) => t.value === tzValue);
    const countryMatch = COUNTRIES_DATA.find((c) => c.defaultTz === tzValue);
    const targetCountry = tzMatch?.country || countryMatch?.name || form.country;
    setForm((prev) => ({
      ...prev,
      timezone: tzValue,
      country: targetCountry,
    }));
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
      setErrors((prev) => ({
        ...prev,
        age: "Maximum age allowed is 100 years.",
      }));
      return;
    }
    setForm((f) => ({ ...f, age: cleaned }));
    if (num < 5) {
      setErrors((prev) => ({
        ...prev,
        age: "Minimum age allowed is 5 years.",
      }));
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
      setErrors((prev) => ({
        ...prev,
        age: "Please enter a valid age between 5 and 100.",
      }));
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
      const dialCodeDigits = dialCodeMatch
        ? dialCodeMatch[0].replace(/\D/g, "")
        : "";
      const subscriberDigits = digitsOnly.slice(dialCodeDigits.length);

      if (!subscriberDigits || subscriberDigits.length === 0) {
        errs.phone = "Please enter your phone number digits.";
      } else if (
        dialCodeMatch &&
        dialCodeMatch[0] === "+91" &&
        subscriberDigits.length !== 10
      ) {
        errs.phone = "Please enter a valid 10-digit Indian phone number.";
      } else if (subscriberDigits.length < 6 || subscriberDigits.length > 15) {
        errs.phone = "Please enter a valid phone number (6 to 15 digits).";
      }
    }

    if (!form.country) {
      errs.country = "Please select your country.";
    }

    // Class Type: must be selected
    if (!form.classType) {
      errs.classType = "Please select a class type (Private or Group).";
    } else if (form.classType === "private") {
      if (!form.language)
        errs.language = "Please select your instruction medium.";
      if (!form.preferredTime1)
        errs.preferredTime1 = "Please select your primary time slot.";
      if (!form.preferredTime2)
        errs.preferredTime2 = "Please select your secondary / backup time slot.";
    } else if (form.classType === "group") {
      if (!form.groupCohortId)
        errs.groupCohortId = "Please select a group cohort.";
      if (!form.groupTimeSlot)
        errs.groupTimeSlot = "Please select your group batch time slot.";
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
      setTimeout(() => {
        const firstErr = document.querySelector(".field-error-msg, [aria-invalid='true']");
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
      return;
    }
    setViewMode("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentCountryObj = findCountry(form.country);
  const phoneCountryObj =
    findCountryByDialCode(form.phone) ||
    findCountry(form.phoneCountry) ||
    findCountry("India");
  const activeCohort =
    GROUP_COHORTS[form.groupCohortId] || GROUP_COHORTS.english;
  const privateLangKey = (form.language || "English")
    .toLowerCase()
    .includes("hindi")
    ? "hindi"
    : "english";
  const currentLangPlans =
    PRIVATE_PLANS[privateLangKey]?.plans || PRIVATE_PLANS.english.plans;
  const activePrivatePlan =
    currentLangPlans.find((p) => p.category === form.privatePlanCategory) ||
    currentLangPlans[0];
  const activePrivateFreq =
    activePrivatePlan.frequencies.find(
      (f) => f.days === form.privateFrequency,
    ) ||
    activePrivatePlan.frequencies[2] ||
    activePrivatePlan.frequencies[0];

  // Live faculty and timetable state from backend / initialData
  const [instructorsList, setInstructorsList] = useState(() => {
    try {
      const saved = localStorage.getItem("yoga_instructors");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_INSTRUCTORS;
  });

  const [classesList, setClassesList] = useState(() => {
    try {
      const saved = localStorage.getItem("yoga_classes");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CLASSES;
  });

  const [selectedGroupTeacherId, setSelectedGroupTeacherId] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.instructors
      .getAll()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          const enriched = data.map((inst) => {
            const init = INITIAL_INSTRUCTORS.find(
              (i) => i.id === inst.id || i.name === inst.name
            );
            return {
              ...inst,
              profileImage:
                inst.profileImage ||
                init?.profileImage ||
                "/instructors/priya-nair.jpg",
            };
          });
          setInstructorsList(enriched);
        }
      })
      .catch(() => {});

    api.classes
      .getAll()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setClassesList(data);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Time slot matching helper (handles "7:00 am - 8:00 am IST" vs "7:00-8:00 am")
  const matchTimeSlots = (slotA, slotB) => {
    if (!slotA || !slotB) return false;
    const sA = String(slotA).toLowerCase().replace(/\s*ist\s*/g, "").trim();
    const sB = String(slotB).toLowerCase().replace(/\s*ist\s*/g, "").trim();
    if (sA === sB) return true;

    const pA = parseSlotIST(slotA);
    const pB = parseSlotIST(slotB);
    if (pA && pB) {
      return (
        pA.startH === pB.startH &&
        pA.startM === pB.startM &&
        pA.endH === pB.endH
      );
    }
    return false;
  };

  // Only show teachers who are marked as available during that time in the Scheduler tab
  const availableGroupTeachers = useMemo(() => {
    if (!form.groupTimeSlot) return [];
    const cohortLang = (activeCohort?.language || form.language || "").toLowerCase();
    const available = [];
    const seenKeys = new Set();

    // 1. Check classes in scheduler timetable
    (classesList || []).forEach((cls) => {
      if (cls.instructorName && matchTimeSlots(cls.timeSlot, form.groupTimeSlot)) {
        const instObj = (instructorsList || []).find(
          (inst) =>
            (cls.instructorId && inst.id === cls.instructorId) ||
            (inst.name && inst.name.toLowerCase() === cls.instructorName.toLowerCase())
        );
        if (instObj && !seenKeys.has(instObj.id || instObj.name)) {
          const instLang = (instObj.language || instObj.medium || "").toLowerCase();
          if (
            !cohortLang ||
            instLang.includes(cohortLang) ||
            cohortLang.includes(instLang) ||
            instLang === "both"
          ) {
            seenKeys.add(instObj.id || instObj.name);
            available.push({
              ...instObj,
              isScheduledLead: true,
              scheduledClass: cls.title,
            });
          }
        }
      }
    });

    // 2. Check instructor availableSlots in Scheduler
    (instructorsList || []).forEach((inst) => {
      const key = inst.id || inst.name;
      if (seenKeys.has(key)) return;

      const hasSlot =
        Array.isArray(inst.availableSlots) &&
        inst.availableSlots.some((s) => matchTimeSlots(s, form.groupTimeSlot));

      if (hasSlot) {
        const instLang = (inst.language || inst.medium || "").toLowerCase();
        if (
          !cohortLang ||
          instLang.includes(cohortLang) ||
          cohortLang.includes(instLang) ||
          instLang === "both"
        ) {
          seenKeys.add(key);
          available.push({
            ...inst,
            isScheduledLead: false,
          });
        }
      }
    });

    return available;
  }, [form.groupTimeSlot, activeCohort, classesList, instructorsList]);

  // Keep selectedGroupTeacherId in sync
  useEffect(() => {
    if (availableGroupTeachers.length > 0) {
      const exists = availableGroupTeachers.some((t) => t.id === selectedGroupTeacherId);
      if (!exists) {
        setSelectedGroupTeacherId(availableGroupTeachers[0].id);
      }
    } else {
      setSelectedGroupTeacherId(null);
    }
  }, [availableGroupTeachers, selectedGroupTeacherId]);

  const activeGroupTeacher = useMemo(() => {
    if (selectedGroupTeacherId) {
      return (
        instructorsList.find((i) => i.id === selectedGroupTeacherId) ||
        availableGroupTeachers[0] ||
        null
      );
    }
    return availableGroupTeachers[0] || null;
  }, [selectedGroupTeacherId, availableGroupTeachers, instructorsList]);

  // Matched faculty for 1-on-1 Private Class preview
  const matchingPrivateTeachers = useMemo(() => {
    const lang = (form.language || "English").toLowerCase();
    const pref = form.instructorPreference;
    return (instructorsList || []).filter((inst) => {
      const instLang = (inst.language || inst.medium || "").toLowerCase();
      const langMatch =
        instLang.includes(lang) || lang.includes(instLang) || instLang === "both";
      if (!langMatch) return false;
      if (pref === "Female") return inst.gender === "Female";
      if (pref === "Male") return inst.gender === "Male";
      return true;
    });
  }, [form.language, form.instructorPreference, instructorsList]);

  const handleSubmitBooking = async () => {
    setGlobalError("");
    setLoading(true);

    const selectedCohort =
      form.classType === "group"
        ? GROUP_COHORTS[form.groupCohortId] || GROUP_COHORTS.english
        : null;
    const finalFee =
      form.classType === "group"
        ? selectedCohort?.price || 0
        : activePrivateFreq?.price || 0;

    const finalGroupCohort =
      form.classType === "group"
        ? selectedCohort
          ? `${selectedCohort.name} (${selectedCohort.priceLabel})`
          : ""
        : `${activePrivatePlan.title} (${form.language} · ${activePrivateFreq.days} · ${activePrivateFreq.priceLabel})`;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      age: form.age.trim(),
      gender: form.gender,
      phone: form.phone.trim(),
      country: form.country,
      timezone: form.timezone,
      language:
        form.classType === "private"
          ? form.language
          : selectedCohort?.language || form.language,
      classType: form.classType,
      goals: Array.isArray(form.goals)
        ? form.goals.join(", ")
        : form.goals || "",
      preferredTime:
        form.classType === "private" ? form.preferredTime1 : form.groupTimeSlot,
      preferredTime2: form.classType === "private" ? form.preferredTime2 : "",
      instructorPreference:
        form.classType === "private"
          ? form.instructorPreference
          : activeGroupTeacher
          ? activeGroupTeacher.name
          : selectedCohort?.instructor || "Any",
      assignedInstructor:
        form.classType === "group" && activeGroupTeacher
          ? `${getTeacherTitle(activeGroupTeacher.gender)} ${activeGroupTeacher.name}`
          : selectedCohort?.instructor || "Any",
      groupCohort: finalGroupCohort,
      fee: finalFee,
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
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171A32] leading-tight mb-2.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Student Enrollment Form
            </h1>
            <p className="text-sm sm:text-base text-[#5B607A] max-w-xl mx-auto leading-relaxed">
              Reserve your trial session. Select your preferred timezone, batch
              timing, and practice goals below.
            </p>

            {/* 24h SLA Notice Banner (Requirement 1) */}
            <div className="sla-banner-box">
              <div className="sla-badge">⏱️ 24h SLA</div>
              <p className="sla-banner-text">
                <strong>Instructor Matching within 24 Hours:</strong> Our
                certified master team carefully reviews your goals, timezone,
                and class preferences to assign your ideal instructor. Once
                assigned, your instructor details and dedicated class link will
                automatically appear on your dashboard.
              </p>
            </div>
          </div>

          {/* View Step Indicator */}
          <div className="flow-steps-pill mx-auto">
            <div
              className={`flow-step-item ${viewMode === "form" ? "active" : "done"}`}
            >
              <span className="flow-num">
                {viewMode === "review" ? "✓" : "1"}
              </span>
              <span>1. Enrollment Details</span>
            </div>
            <div className="flow-divider" />
            <div
              className={`flow-step-item ${viewMode === "review" ? "active" : ""}`}
            >
              <span className="flow-num">2</span>
              <span>2. Review &amp; Confirm</span>
            </div>
          </div>

          {/* Global Error Banner */}
          {globalError && (
            <div className="global-error-banner">
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
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
                  <span className="text-xs font-normal text-[#7B8098]">
                    Step 1 of 2
                  </span>
                </div>

                {/* Name & Email */}
                <div className="form-grid-2">
                  <Field
                    label="Full Name"
                    required
                    error={errors.name}
                    id="name"
                  >
                    <Input
                      id="name"
                      value={form.name}
                      placeholder="e.g. Aarav Sharma"
                      style={
                        errors.name ? { borderColor: "var(--danger)" } : {}
                      }
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </Field>

                  <Field
                    label="Email Address"
                    required
                    error={errors.email}
                    id="email"
                  >
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      placeholder="you@example.com"
                      style={
                        errors.email ? { borderColor: "var(--danger)" } : {}
                      }
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
                    <Select
                      value={form.gender}
                      onChange={(e) => set("gender", e.target.value)}
                    >
                      <option value="Female" data-icon="👩">
                        Female
                      </option>
                      <option value="Male" data-icon="👨">
                        Male
                      </option>
                      <option value="Other" data-icon="✨">
                        Other / Prefer not to say
                      </option>
                    </Select>
                  </Field>
                </div>

                {/* Phone & Country */}
                <div className="form-grid-2">
                  <Field
                    label="Phone / WhatsApp Number"
                    required
                    error={errors.phone}
                  >
                    <PhoneInputWithFlag
                      id="phone"
                      value={form.phone}
                      phoneCountry={form.phoneCountry}
                      onCountryChange={(c) => set("phoneCountry", c?.name || c)}
                      onChange={(val) => set("phone", val)}
                      error={!!errors.phone}
                    />
                  </Field>

                  <Field
                    label="Country of Residence"
                    required
                    error={errors.country}
                  >
                    <CountrySelect
                      value={form.country}
                      onChange={handleCountryChange}
                      error={!!errors.country}
                      placeholder="Select country…"
                    />
                  </Field>
                </div>

                {/* Timezone */}
                <div>
                  <Field label="Your Timezone" required>
                    <Select
                      value={form.timezone}
                      onChange={(e) => handleTimezoneChange(e.target.value)}
                    >
                      {TIMEZONES.map((tz) => (
                        <option
                          key={tz.value}
                          value={tz.value}
                          data-icon={tz.flag}
                        >
                          {tz.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </div>

              {/* SECTION 2: Class Type & Schedule */}
              <div className="form-section-card">
                <div className="section-card-title">
                  <span>2. Class Type &amp; Schedule</span>
                  <span className="text-xs font-normal text-[#7B8098]">
                    Step 2 of 2
                  </span>
                </div>

                {/* Class Type Dropdown + Conditional Panel */}
                <div className="booking-field">
                  <Field label="Class Type" required error={errors.classType}>
                    <Select
                      id="class-type-dropdown"
                      value={form.classType}
                      onChange={(e) => set("classType", e.target.value)}
                    >
                      <option value="" disabled>
                        Select class type…
                      </option>
                      <option value="private" data-icon="🧘" data-sublabel="Dedicated 1-on-1 · From ₹4,299/mo">
                        Private Class (1:1)
                      </option>
                      <option value="group" data-icon="👥" data-sublabel="Live Community · From ₹999/mo">
                        Group Class
                      </option>
                    </Select>
                  </Field>
                </div>

                {/* ── Conditional panels rendered below the dropdown ── */}
                <div>

                    {/* ─── PRIVATE 1:1 COACHING SUBSECTION (Inline below Private card on phone) ─── */}
                    {form.classType === "private" && (
                      <div className="format-panel-box private-theme animate-fadeIn private-panel-item">
                        <div className="format-panel-header mb-3">
                          <div className="format-panel-badge private-theme">
                            <span>🧘 Private 1-on-1 Coaching</span>
                          </div>
                          <span className="text-xs font-semibold text-[#4C5FD5]">
                            Dedicated 1-on-1 Guidance
                          </span>
                        </div>

                        <div className="form-grid-2">
                          {/* Dropdown 1: Instruction Language */}
                          <Field
                            label="Preferred Language"
                            required
                            error={errors.language}
                          >
                            <Select
                              id="private-language-dropdown"
                              value={form.language}
                              onChange={(e) =>
                                handleLanguageChange(e.target.value)
                              }
                            >
                              <option
                                value="English"
                                data-icon="🌐"
                                data-sublabel="Global & NRI · English Medium"
                              >
                                English Medium
                              </option>
                              <option
                                value="Hindi"
                                data-icon="🇮🇳"
                                data-sublabel="Popular across India · Hindi Medium"
                              >
                                Hindi Medium (हिंदी)
                              </option>
                            </Select>
                          </Field>

                          {/* Dropdown 2: Private Yoga Program */}
                          <Field
                            label="Yoga Style & Focus"
                            required
                          >
                            <Select
                              id="private-plan-dropdown"
                              value={form.privatePlanCategory}
                              onChange={(e) =>
                                set("privatePlanCategory", e.target.value)
                              }
                            >
                              <option
                                value="regular"
                                data-icon="🧘"
                                data-sublabel="Beginner to Intermediate · Tailored Routine"
                              >
                                Regular Yoga Plan (Mobility & Core)
                              </option>
                              <option
                                value="advanced"
                                data-icon="✨"
                                data-sublabel="Doctor-Aligned · Prenatal / Ashtanga / Therapy"
                              >
                                Pregnancy &amp; Advanced Yoga (Specialized Therapy)
                              </option>
                            </Select>
                          </Field>
                        </div>

                        {/* ═══ LIVE PLAN CARD ═══ */}
                        <div className="yoga-pricing-card">
                          <div className="card-top-badges">
                            <div className="flex items-center gap-2">
                              <span className="badge-language">
                                {form.language.toUpperCase()} MEDIUM
                              </span>
                              {activePrivatePlan.isSpecialized && (
                                <span className="badge-specialized">
                                  ★ SPECIALIZED THERAPY
                                </span>
                              )}
                            </div>
                            <span className="badge-level">
                              {activePrivatePlan.levelBadge}
                            </span>
                          </div>

                          <h3 className="plan-title">
                            {activePrivatePlan.title}
                          </h3>
                          <p className="plan-description">
                            {activePrivatePlan.desc}
                          </p>

                          <div className="mt-3 mb-2">
                            <div className="font-bold text-sm text-[#171A32]">
                              Weekly Schedule
                            </div>
                          </div>

                          <div className="frequency-options-list">
                            {activePrivatePlan.frequencies.map((freq) => {
                              const isSelected =
                                form.privateFrequency === freq.days;
                              return (
                                <div
                                  key={freq.days}
                                  onClick={() =>
                                    set("privateFrequency", freq.days)
                                  }
                                  className={`frequency-option-row ${isSelected ? "selected" : ""}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`freq-radio-circle ${isSelected ? "checked" : ""}`}
                                    >
                                      {isSelected && (
                                        <div className="freq-radio-dot" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="freq-days-text">
                                        {freq.days}
                                      </div>
                                      <div className="freq-sessions-text">
                                        {freq.sessions}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    {freq.isPopular && (
                                      <div>
                                        <span className="badge-popular">
                                          POPULAR
                                        </span>
                                      </div>
                                    )}
                                    <div className="freq-price-text">
                                      {freq.priceLabel}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Card Action / Live Feedback Banner */}
                          <div className="plan-card-action-bar">
                            <div className="plan-action-main">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12.004 2C6.48 2 2 6.48 2 12c0 1.76.46 3.42 1.26 4.87L2.05 22l5.31-1.19c1.4.74 2.99 1.19 4.64 1.19 5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.25c-1.46 0-2.88-.4-4.11-1.14l-.29-.18-3.05.68.7-2.97-.19-.31c-.81-1.28-1.26-2.77-1.26-4.33 0-4.55 3.7-8.25 8.25-8.25 4.54 0 8.25 3.7 8.25 8.25 0 4.55-3.71 8.25-8.25 8.25z" />
                              </svg>
                              <span>
                                Selected {activePrivateFreq.days} Plan (
                                {activePrivateFreq.priceLabel})
                              </span>
                            </div>
                            <div className="plan-action-trial-badge">
                              ✨ 1st Trial Session is 100% Free
                            </div>
                          </div>
                        </div>

                        {/* Preferred Practice Time Slots */}
                        <div className="form-grid-2 mt-4">
                          <Field
                            label="Primary Practice Time"
                            required
                            error={errors.preferredTime1}
                          >
                            <Select
                              value={form.preferredTime1}
                              onChange={(e) =>
                                set("preferredTime1", e.target.value)
                              }
                            >
                              {PRIVATE_TIME_SLOTS.map((s) => (
                                <option key={s} value={s} data-icon="⏰">
                                  {s}
                                </option>
                              ))}
                            </Select>
                          </Field>

                          <Field
                            label="Alternate Practice Time (Backup)"
                            required
                            error={errors.preferredTime2}
                          >
                            <Select
                              value={form.preferredTime2}
                              onChange={(e) =>
                                set("preferredTime2", e.target.value)
                              }
                            >
                              {PRIVATE_TIME_SLOTS.map((s) => (
                                <option key={s} value={s} data-icon="⏰">
                                  {s}
                                </option>
                              ))}
                            </Select>
                          </Field>
                        </div>

                        {/* Sleek Timezone & Timing Indicator for Private Class */}
                        <div className="mt-2.5 mb-3 p-3 px-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-2.5">
                          {/* Primary Practice Time */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">🕒</span>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4C5FD5] bg-[#EEF2FF] px-2 py-0.5 rounded-md border border-[#C7D2FE]">
                                Primary
                              </span>
                              <span className="font-semibold text-[#1E293B]">
                                Your Time:{" "}
                                <span className="text-[#4C5FD5] font-bold">
                                  {convertSlotToTimezone(form.preferredTime1, form.timezone).localTimeStr}
                                </span>
                                {convertSlotToTimezone(form.preferredTime1, form.timezone).dayOffsetNote && (
                                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                    {convertSlotToTimezone(form.preferredTime1, form.timezone).dayOffsetNote}
                                  </span>
                                )}
                                <span className="ml-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4C5FD5] border border-[#C7D2FE]">
                                  {form.country || form.timezone.split("/")[1]?.replace(/_/g, " ") || "Local"}
                                </span>
                              </span>
                            </div>
                            <div className="text-[#64748B]">
                              IST: <strong className="text-[#1E293B]">{form.preferredTime1}</strong>
                            </div>
                          </div>

                          {/* Alternate Practice Time (Backup) */}
                          {form.preferredTime2 && (
                            <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-[#E2E8F0]">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">🔄</span>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#CBD5E1]">
                                  Backup
                                </span>
                                <span className="font-semibold text-[#1E293B]">
                                  Your Time:{" "}
                                  <span className="text-[#4C5FD5] font-bold">
                                    {convertSlotToTimezone(form.preferredTime2, form.timezone).localTimeStr}
                                  </span>
                                  {convertSlotToTimezone(form.preferredTime2, form.timezone).dayOffsetNote && (
                                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                      {convertSlotToTimezone(form.preferredTime2, form.timezone).dayOffsetNote}
                                    </span>
                                  )}
                                  <span className="ml-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4C5FD5] border border-[#C7D2FE]">
                                    {form.country || form.timezone.split("/")[1]?.replace(/_/g, " ") || "Local"}
                                  </span>
                                </span>
                              </div>
                              <div className="text-[#64748B]">
                                IST: <strong className="text-[#1E293B]">{form.preferredTime2}</strong>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Instructor Preference Dropdown */}
                        <Field
                          label="Teacher Preference (Optional)"
                        >
                          <Select
                            value={form.instructorPreference}
                            onChange={(e) =>
                              set("instructorPreference", e.target.value)
                            }
                          >
                            <option value="Any" data-icon="👥">
                              Any (Yogi or Yogini)
                            </option>
                            <option value="Female" data-icon="🧘‍♀️">
                              Yogini (Female Teacher)
                            </option>
                            <option value="Male" data-icon="🧘‍♂️">
                              Yogi (Male Teacher)
                            </option>
                          </Select>
                        </Field>

                        {/* Private Faculty Preview Card */}
                        {matchingPrivateTeachers.length > 0 && (
                          <div className="mt-3.5 p-3 bg-white rounded-xl border border-[#CBD8F7] shadow-xs">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-[#4C5FD5] mb-2 flex items-center gap-1.5">
                              <span>✨ Matched Certified Faculty for 1-on-1 Practice</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {matchingPrivateTeachers.slice(0, 2).map((teacher) => {
                                const title = getTeacherTitle(teacher.gender);
                                return (
                                  <div
                                    key={teacher.id || teacher.name}
                                    className="flex items-center gap-3 p-2.5 rounded-lg border border-[#E7E4DC] bg-[#FCFAF7]"
                                  >
                                    <img
                                      src={teacher.profileImage || "/instructors/priya-nair.jpg"}
                                      alt={teacher.name}
                                      className="w-10 h-10 rounded-full object-cover border flex-none"
                                      style={{ borderColor: "var(--border)" }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="font-bold text-xs text-[#171A32] flex items-center gap-1 truncate">
                                        <span
                                          className={
                                            title === "Yogini"
                                              ? "text-purple-700 font-semibold"
                                              : "text-emerald-700 font-semibold"
                                          }
                                        >
                                          {title}
                                        </span>
                                        <span className="truncate">{teacher.name}</span>
                                      </div>
                                      <div className="text-[10px] text-[#4C5FD5] font-semibold mt-0.5">
                                        ✓ {teacher.language} Medium · Certified Master
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}


                    {/* ─── GROUP CLASS SUBSECTION (Inline below Group card on phone) ─── */}
                    {form.classType === "group" && (
                      <div className="format-panel-box animate-fadeIn group-panel-item">
                        <div className="format-panel-header">
                          <div className="format-panel-badge group-theme">
                            <span>👥 Group Cohort Configuration</span>
                          </div>
                          <span className="text-xs font-semibold text-[#6B7089]">
                            Interactive Live Batch
                          </span>
                        </div>

                        <div className="form-grid-2 mb-4">
                          <Field label="Group Cohort &amp; Language" required>
                            <Select
                              id="group-cohort-dropdown"
                              value={form.groupCohortId}
                              onChange={(e) =>
                                handleGroupCohortChange(e.target.value)
                              }
                            >
                              <option
                                value="hindi"
                                data-icon="🇮🇳"
                                data-sublabel="Large Group · ₹999 / mo"
                              >
                                Hindi Group Class
                              </option>
                              <option
                                value="english"
                                data-icon="🌐"
                                data-sublabel="Small Group · ₹1,699 / mo"
                              >
                                English Group Class
                              </option>
                            </Select>
                          </Field>

                          <Field
                            label="Select Class Timing"
                            required
                            error={errors.groupTimeSlot}
                          >
                            <Select
                              id="group-timeslot-dropdown"
                              value={form.groupTimeSlot}
                              onChange={(e) =>
                                set("groupTimeSlot", e.target.value)
                              }
                            >
                              {activeCohort.slots.map((s) => (
                                <option key={s} value={s} data-icon="⏰">
                                  {s}
                                </option>
                              ))}
                            </Select>
                          </Field>
                        </div>

                        {/* ── Sleek 1-Column Timezone & Timing Indicator ── */}
                        <div className="mb-3 p-2.5 px-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-2 flex-wrap text-xs">
                          <div className="flex items-center gap-2">
                            <span>🕒</span>
                            <span className="font-semibold text-[#1E293B]">
                              Your Time:{" "}
                              <span className="text-[#4C5FD5] font-bold">
                                {convertSlotToTimezone(form.groupTimeSlot, form.timezone).localTimeStr}
                              </span>
                              {convertSlotToTimezone(form.groupTimeSlot, form.timezone).dayOffsetNote && (
                                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                  {convertSlotToTimezone(form.groupTimeSlot, form.timezone).dayOffsetNote}
                                </span>
                              )}
                              <span className="ml-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4C5FD5] border border-[#C7D2FE]">
                                {form.country || form.timezone.split("/")[1]?.replace(/_/g, " ") || "Local"}
                              </span>
                            </span>
                          </div>
                          <div className="text-[#64748B]">
                            IST: <strong className="text-[#1E293B]">{form.groupTimeSlot}</strong>
                          </div>
                        </div>

                        {/* ── Available Faculty in Scheduler for Selected Time Slot ── */}
                        <div className="slot-teacher-section mt-3 pt-3 border-t border-[#E7E4DC]">
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wider text-[#171A32] flex items-center gap-1.5">
                                <span>🧑‍🏫 Available Faculty for this Slot</span>
                                <span className="text-[11px] font-normal text-[#6B7089]">
                                  ({form.groupTimeSlot})
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EBF7EE] text-[#1E9E63] border border-[#C6EBD0]">
                              {availableGroupTeachers.length}{" "}
                              {availableGroupTeachers.length === 1
                                ? "Teacher Available"
                                : "Teachers Available"}
                            </span>
                          </div>

                          {availableGroupTeachers.length === 0 ? (
                            <div className="p-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] flex items-center gap-2">
                              <span>ℹ️</span>
                              <span>
                                No instructor is directly scheduled for this slot in the Scheduler. A certified teacher will be paired upon confirmation.
                              </span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {availableGroupTeachers.map((teacher) => {
                                const title = getTeacherTitle(teacher.gender); // "Yogini" or "Yogi"
                                const isSelected =
                                  selectedGroupTeacherId === teacher.id;
                                return (
                                  <div
                                    key={teacher.id || teacher.name}
                                    onClick={() =>
                                      setSelectedGroupTeacherId(teacher.id)
                                    }
                                    className={`teacher-available-card ${isSelected ? "selected" : ""}`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <div className="relative flex-none">
                                        <img
                                          src={
                                            teacher.profileImage ||
                                            "/instructors/priya-nair.jpg"
                                          }
                                          alt={teacher.name}
                                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                                        />
                                        <span
                                          className={`absolute -bottom-1 -right-1 text-[8.5px] font-extrabold uppercase px-1 rounded shadow-xs ${
                                            title === "Yogini"
                                              ? "bg-purple-600 text-white"
                                              : "bg-emerald-600 text-white"
                                          }`}
                                        >
                                          {title}
                                        </span>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                          <div className="font-bold text-xs text-[#171A32] truncate flex items-center gap-1">
                                            <span
                                              className={
                                                title === "Yogini"
                                                  ? "text-purple-700"
                                                  : "text-emerald-700"
                                              }
                                            >
                                              {title}
                                            </span>
                                            <span className="truncate">
                                              {teacher.name}
                                            </span>
                                          </div>
                                          {isSelected && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#4C5FD5] bg-[#EEF2FF] px-1 py-0.5 rounded">
                                              Selected
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[#4C5FD5] font-semibold">
                                          <span>✓ {teacher.language} Medium</span>
                                          {teacher.isScheduledLead && (
                                            <span>· Timetable Lead</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Preferred Start Date */}
                <div className="mt-4">
                  <Field
                    label="Preferred Start Date"
                    required
                    error={errors.joiningDate}
                    id="joiningDate"
                  >
                    <Input
                      id="joiningDate"
                      type="date"
                      min={todayStr}
                      value={form.joiningDate}
                      onChange={(e) => set("joiningDate", e.target.value)}
                    />
                  </Field>
                </div>

                {/* Health Notes Section */}
                <div className="mt-4 pt-3 border-t border-[#E7E4DC]">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <label
                      htmlFor="health-notes"
                      className="field-label text-sm font-bold text-[#171A32] mb-0"
                    >
                      Health Notes &amp; Inquiries (Optional)
                    </label>
                    <span
                      className={`text-xs font-mono font-semibold ${form.message.length >= 850 ? "text-amber-600 font-bold" : "text-[#7B8098]"}`}
                    >
                      {form.message.length} / 900
                    </span>
                  </div>
                  <p className="text-xs text-[#5B607A] mb-2">
                    Share any back or knee pain, injuries, or goals for your instructor before your first session.
                  </p>
                  <textarea
                    id="health-notes"
                    rows={3}
                    maxLength={900}
                    value={form.message}
                    onChange={(e) =>
                      set("message", e.target.value.slice(0, 900))
                    }
                    placeholder="e.g. Back stiffness, desk fatigue, looking for gentle stretching and breathwork..."
                    className="booking-textarea w-full p-3 rounded-xl border border-[#D5D8E4] focus:border-[#4C5FD5] focus:ring-2 focus:ring-[#4C5FD5]/20 text-sm text-[#171A32] placeholder-[#A0A4B8] bg-white transition-all outline-none resize-y min-h-[90px] leading-relaxed"
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
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                <h2
                  className="text-2xl font-bold text-[#171A32]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Review Your Enrollment
                </h2>
                <p className="text-xs text-[#5B607A] mt-1">
                  Please confirm your information below before reserving your
                  free trial session.
                </p>
              </div>

              {/* 24-hour match callout */}
              <div className="sla-banner-box mb-5">
                <div className="sla-badge">⏱️ 24h Instructor Match</div>
                <p className="sla-banner-text">
                  Your certified yoga master will be paired within 24 hours
                  based on your class schedule, language preference, and health
                  inquiries.
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
                    <CountryFlag country={phoneCountryObj} size="xs" />
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
                  value={
                    TIMEZONES.find((t) => t.value === form.timezone)?.label ||
                    form.timezone
                  }
                />
              </ReviewCard>

              {/* Card 2: Class & Schedule Details */}
              <ReviewCard title="Class &amp; Schedule Details">
                <ReviewRow
                  label="Class Type"
                  value={
                    form.classType === "private"
                      ? "Private 1:1 Coaching"
                      : "Group Cohort"
                  }
                />

                {form.classType === "private" ? (
                  <>
                    <ReviewRow
                      label="Instruction Language"
                      value={`${form.language} Medium`}
                    />
                    <ReviewRow
                      label="Private Yoga Program"
                      value={activePrivatePlan.title}
                    />
                    <ReviewRow
                      label="Focus Level"
                      value={activePrivatePlan.levelBadge}
                    />
                    <ReviewRow
                      label="Weekly Frequency"
                      value={`${activePrivateFreq.days} (${activePrivateFreq.sessions})`}
                    />
                    <ReviewRow
                      label="Monthly Tuition"
                      value={`${activePrivateFreq.priceLabel} (First Trial is 100% Free)`}
                    />
                    <ReviewRow
                      label="1st Preferred Time (IST)"
                      value={form.preferredTime1}
                    />
                    <ReviewRow
                      label="2nd Preferred Time (IST)"
                      value={form.preferredTime2}
                    />
                    <ReviewRow
                      label="Teacher Preference"
                      value={
                        form.instructorPreference === "Any"
                          ? "Any Yoga Master (Yogi or Yogini)"
                          : form.instructorPreference === "Female"
                          ? "Yogini (Female Teacher)"
                          : "Yogi (Male Teacher)"
                      }
                    />
                    {matchingPrivateTeachers.length > 0 && (
                      <ReviewRow label="Assigned Faculty">
                        <div className="flex items-center gap-2 justify-end flex-wrap">
                          {matchingPrivateTeachers.slice(0, 2).map((t) => (
                            <div
                              key={t.id || t.name}
                              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FCFAF7] border border-[#CBD8F7]"
                            >
                              <img
                                src={t.profileImage || "/instructors/priya-nair.jpg"}
                                alt={t.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="font-semibold text-xs text-[#171A32]">
                                {getTeacherTitle(t.gender)} {t.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </ReviewRow>
                    )}
                  </>
                ) : (
                  <>
                    <ReviewRow label="Cohort Tier" value={activeCohort.name} />
                    <ReviewRow label="Assigned Yoga Faculty">
                      <div className="flex items-center gap-2.5 justify-end">
                        {activeGroupTeacher?.profileImage && (
                          <img
                            src={activeGroupTeacher.profileImage}
                            alt={activeGroupTeacher.name}
                            className="w-7 h-7 rounded-full object-cover border-2 border-[#4C5FD5]/30 shadow-2xs"
                          />
                        )}
                        <span className="font-bold text-sm text-[#171A32]">
                          {activeGroupTeacher
                            ? `${getTeacherTitle(activeGroupTeacher.gender)} ${activeGroupTeacher.name}`
                            : activeCohort.instructor}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-2xs ${
                            getTeacherTitle(activeGroupTeacher?.gender) === "Yogini"
                              ? "bg-purple-600 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {getTeacherTitle(activeGroupTeacher?.gender)}
                        </span>
                      </div>
                    </ReviewRow>
                    <ReviewRow
                      label="Class Timings"
                      value={activeCohort.timingSchedule}
                    />
                    <ReviewRow
                      label="Selected Batch Time"
                      value={
                        form.timezone !== "Asia/Kolkata"
                          ? `${convertSlotToTimezone(form.groupTimeSlot, form.timezone).fullLocalStr} · (${form.groupTimeSlot})`
                          : form.groupTimeSlot
                      }
                    />
                    <ReviewRow label="Language" value={activeCohort.language} />
                    <ReviewRow
                      label="Monthly Tuition"
                      value={activeCohort.priceLabel}
                    />
                    <ReviewRow
                      label="Trial Class"
                      value="Free First Session Included"
                    />
                  </>
                )}

                <ReviewRow
                  label="Trial / Joining Date"
                  value={form.joiningDate}
                />
              </ReviewCard>

              {/* Card 3: Health Notes & Specific Inquiries */}
              <ReviewCard title="Health Notes &amp; Specific Inquiries">
                {form.message ? (
                  <div className="p-3.5 bg-[#F6F7FB] rounded-xl border border-[#E3E6F2] text-sm text-[#171A32] leading-relaxed whitespace-pre-wrap font-normal">
                    "{form.message}"
                  </div>
                ) : (
                  <div className="text-xs text-[#7B8098] italic">
                    No specific health notes provided.
                  </div>
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
                    <path
                      d="M10 3L5 8l5 5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M13.5 2.5l-8 8M13.5 2.5H8.5M13.5 2.5V7.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 5H3a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1v-3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
            🔒 Your personal information is encrypted, securely stored, and
            never shared with external third parties.
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

            <h3
              className="font-bold text-xl text-[#171A32] mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              yogaonlive Login
            </h3>
            <p className="text-xs text-[#6B7089] mb-5">
              Sign in to view your dashboard, schedules, and dedicated class
              meeting link.
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
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .form-grid-2 > * {
          min-width: 0;
          max-width: 100%;
        }

        @media (max-width: 640px) {
          .form-grid-2 {
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
          }
        }

        .booking-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
          min-width: 0;
          max-width: 100%;
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

        .field-hint-text {
          font-size: 12px;
          color: #5B607A;
          line-height: 1.45;
          margin: -2px 0 6px 0;
        }

        .timezone-converter-card {
          background: linear-gradient(135deg, #F8FAFF 0%, #EFF4FE 100%);
          border: 1.5px solid #CBD8F7;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .slot-tz-card {
          background: #FFFFFF;
          border: 1.5px solid #E7E4DC;
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .slot-tz-card:hover {
          border-color: #4C5FD5;
          box-shadow: 0 2px 8px rgba(76, 95, 213, 0.08);
        }

        .slot-tz-card.selected {
          border-color: #4C5FD5;
          background: #F4F6FF;
          box-shadow: 0 0 0 2px rgba(76, 95, 213, 0.2);
        }

        .slot-radio-circle {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid #B0B5C6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .slot-radio-circle.checked {
          border-color: #4C5FD5;
          background: #4C5FD5;
        }

        .slot-radio-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FFFFFF;
        }

        .teacher-available-card {
          background: #FFFFFF;
          border: 1.5px solid #E7E4DC;
          border-radius: 12px;
          padding: 12px 14px;
          cursor: pointer;
          transition: all 0.18s ease;
          user-select: none;
        }

        .teacher-available-card:hover {
          border-color: #4C5FD5;
          box-shadow: 0 3px 10px rgba(76, 95, 213, 0.08);
        }

        .teacher-available-card.selected {
          border-color: #4C5FD5;
          background: #F4F6FF;
          box-shadow: 0 0 0 2px rgba(76, 95, 213, 0.2);
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

        /* ═══ MODERN CLASS FORMAT SELECTION CARDS & RESPONSIVE ACCORDION ═══ */
        .class-format-section-wrapper {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 14px;
          row-gap: 14px;
          margin-top: 4px;
          margin-bottom: 8px;
        }

        .class-format-card.private-card {
          grid-column: 1;
          grid-row: 1;
        }

        .class-format-card.group-card {
          grid-column: 2;
          grid-row: 1;
        }

        .format-panel-box.private-panel-item,
        .format-panel-box.group-panel-item {
          grid-column: 1 / -1;
          grid-row: 2;
          margin-top: 0;
        }

        @media (max-width: 640px) {
          .class-format-section-wrapper {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .class-format-card.private-card {
            order: 1;
          }

          .format-panel-box.private-panel-item {
            order: 2;
            margin-top: 0;
            margin-bottom: 4px;
          }

          .class-format-card.group-card {
            order: 3;
          }

          .format-panel-box.group-panel-item {
            order: 4;
            margin-top: 0;
            margin-bottom: 4px;
          }
        }

        .class-format-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #FFFFFF;
          border: 2px solid #E2E6F2;
          border-radius: 14px;
          padding: 18px 20px;
          cursor: pointer;
          text-align: left;
          position: relative;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 6px rgba(23, 26, 50, 0.03);
          outline: none;
        }

        .class-format-card:hover {
          border-color: #9AA3D5;
          background: #FAFBFD;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(76, 95, 213, 0.08);
        }

        .class-format-card:focus-visible {
          box-shadow: 0 0 0 3.5px rgba(76, 95, 213, 0.25);
        }

        .class-format-card.selected {
          border-color: #4C5FD5;
          background: #F5F7FF;
          box-shadow: 0 6px 22px rgba(76, 95, 213, 0.14), 0 0 0 1px #4C5FD5;
          transform: translateY(-1px);
        }

        .class-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 12px;
        }

        .class-card-badge {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 3.5px 9px;
          border-radius: 6px;
        }

        .class-card-badge.private-badge {
          background: #EEF2FD;
          color: #4C5FD5;
        }

        .class-card-badge.group-badge {
          background: #EFE7FE;
          color: #7C3AED;
        }

        .class-card-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #CBD2E6;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          background: #FFFFFF;
        }

        .class-format-card:hover .class-card-radio {
          border-color: #9AA3D5;
        }

        .class-card-radio.checked {
          border-color: #4C5FD5;
          background: #4C5FD5;
          box-shadow: 0 2px 6px rgba(76, 95, 213, 0.35);
        }

        .class-card-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .class-card-emoji {
          font-size: 24px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #F8F9FE;
          border: 1px solid #E4E8F5;
          box-shadow: 0 2px 5px rgba(23, 26, 50, 0.04);
          flex-shrink: 0;
        }

        .class-format-card.selected .class-card-emoji {
          background: #FFFFFF;
          border-color: #CBD8F7;
          box-shadow: 0 2px 8px rgba(76, 95, 213, 0.12);
        }

        .class-card-title {
          font-family: var(--font-display);
          font-size: 16.5px;
          font-weight: 700;
          color: #171A32;
          margin: 0;
          line-height: 1.25;
        }

        .class-card-price-tag {
          font-size: 12px;
          font-weight: 700;
          color: #4C5FD5;
          margin-top: 2px;
        }

        .class-card-description {
          font-size: 12.5px;
          color: #5B607A;
          line-height: 1.5;
          margin: 0 0 12px 0;
        }

        .class-card-footer {
          border-top: 1px dashed #E2E6F2;
          padding-top: 9px;
          margin-top: auto;
        }

        .class-format-card.selected .class-card-footer {
          border-top-color: #CBD8F7;
        }

        .class-card-highlight {
          font-size: 11px;
          font-weight: 600;
          color: #4C5FD5;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* ═══ CUSTOM SELECT (PREMIUM MODERN DROPDOWN COMPONENT) ═══ */
        .custom-select-container {
          position: relative;
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }

        .custom-select-trigger {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #FFFFFF;
          border: 1.5px solid #DCD8D0;
          border-radius: 10px;
          padding: 8px 14px;
          font-family: var(--font-body);
          font-size: 13.5px;
          color: #171A32;
          cursor: pointer;
          text-align: left;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 2px rgba(23, 26, 50, 0.04);
          box-sizing: border-box;
        }

        .custom-select-trigger:hover {
          border-color: #9AA3D5;
          background: #FAFBFD;
          box-shadow: 0 2px 6px rgba(23, 26, 50, 0.04);
        }

        .custom-select-trigger:focus,
        .custom-select-trigger.active {
          background: #FFFFFF;
          border-color: #4C5FD5;
          box-shadow: 0 0 0 3px rgba(76, 95, 213, 0.14), 0 2px 8px rgba(76, 95, 213, 0.08);
        }

        .custom-select-trigger.has-error {
          border-color: #D93025;
          box-shadow: 0 0 0 3px rgba(217, 48, 37, 0.12);
        }

        .custom-select-trigger-content {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1 1 0%;
          min-width: 0;
          overflow: hidden;
        }

        .custom-select-icon,
        .custom-select-opt-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          line-height: 1;
          flex-shrink: 0;
        }

        .custom-select-text-group {
          display: flex;
          flex-direction: column;
          flex: 1 1 0%;
          min-width: 0;
          overflow: hidden;
        }

        .custom-select-main-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #171A32;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.35;
        }

        .custom-select-sub-label {
          font-size: 11px;
          color: #6B7089;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }

        .custom-select-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          background: #EEF2FD;
          color: #4C5FD5;
          padding: 2px 7px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .custom-select-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          color: #7B8098;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
          flex-shrink: 0;
        }

        .custom-select-chevron.rotate {
          transform: rotate(180deg);
          color: #4C5FD5;
        }

        /* Popover listbox */
        .custom-select-popover {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          z-index: 100;
          background: #FFFFFF;
          border: 1.5px solid #E2E6F2;
          border-radius: 12px;
          padding: 6px;
          max-height: 260px;
          overflow-y: auto;
          box-shadow: 0 14px 36px rgba(23, 26, 50, 0.12), 0 2px 8px rgba(23, 26, 50, 0.04);
          animation: selectFadeDown 0.16s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes selectFadeDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-select-popover::-webkit-scrollbar {
          width: 6px;
        }
        .custom-select-popover::-webkit-scrollbar-track {
          background: #F8F7F3;
          border-radius: 4px;
        }
        .custom-select-popover::-webkit-scrollbar-thumb {
          background: #D5D2CA;
          border-radius: 4px;
        }
        .custom-select-popover::-webkit-scrollbar-thumb:hover {
          background: #B8B3A8;
        }

        .custom-select-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.12s ease;
          user-select: none;
        }

        .custom-select-option:hover {
          background: #F4F6FD;
          color: #4C5FD5;
        }

        .custom-select-option.selected {
          background: #EEF2FD;
          color: #2F3E9E;
        }

        .custom-select-option-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }

        .custom-select-opt-label {
          font-size: 13px;
          font-weight: 500;
          color: inherit;
          line-height: 1.35;
        }

        .custom-select-option.selected .custom-select-opt-label {
          font-weight: 700;
          color: #2F3E9E;
        }

        .custom-select-opt-sub {
          font-size: 11px;
          color: #6B7089;
          margin-top: 1px;
        }

        .custom-select-option-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .custom-select-opt-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          background: #EEF2FD;
          color: #4C5FD5;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .custom-select-check {
          color: #4C5FD5;
          flex-shrink: 0;
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

        /* Format Panel Box */
        .format-panel-box {
          background: #FFFFFF;
          border: 1.5px solid #E2E6F2;
          border-radius: 14px;
          padding: clamp(16px, 2.5vw, 22px);
          margin-top: 14px;
          box-shadow: 0 2px 8px rgba(23, 26, 50, 0.03);
        }

        .format-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid #F0ECE1;
          flex-wrap: wrap;
        }

        .format-panel-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .format-panel-badge.group-theme {
          background: #EFE7FE;
          color: #7C3AED;
        }

        .format-panel-badge.private-theme {
          background: #EEF2FD;
          color: #4C5FD5;
        }

        .group-summary-banner {
          margin-top: 14px;
          background: #F4F7FE;
          border: 1.5px solid #CBD8F7;
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .group-summary-banner {
            flex-direction: row;
            align-items: center;
          }
        }

        /* ═══ YOGA PRICING CARD (UNIFIED DESIGN SYSTEM) ═══ */
        .yoga-pricing-card {
          margin-top: 16px;
          margin-bottom: 18px;
          background: #FFFFFF;
          border: 1.5px solid #E2E6F2;
          border-radius: 16px;
          padding: clamp(18px, 3.5vw, 26px);
          box-shadow: 0 6px 24px rgba(76, 95, 213, 0.06);
          position: relative;
        }

        .card-specialized-tag {
          position: absolute;
          top: -12px;
          right: 20px;
          background: #4C5FD5;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 12px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(76, 95, 213, 0.35);
        }

        .badge-specialized {
          background: #4C5FD5;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          box-shadow: 0 1px 4px rgba(76, 95, 213, 0.25);
        }

        .card-top-badges {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .badge-language {
          background: #EEF2FD;
          color: #4C5FD5;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .badge-level {
          font-size: 12.5px;
          font-weight: 600;
          color: #6B7089;
          background: #F6F7FB;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .plan-title {
          font-size: clamp(20px, 3vw, 25px);
          font-weight: 700;
          color: #171A32;
          font-family: var(--font-display);
          letter-spacing: -0.01em;
          margin: 0 0 6px 0;
        }

        .plan-description {
          font-size: 13px;
          color: #5B607A;
          line-height: 1.55;
          margin: 0 0 18px 0;
        }

        .frequency-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.07em;
          color: #6B7089;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .frequency-options-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .frequency-option-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: #FAFBFD;
          border: 1.5px solid #E2E6F2;
          border-radius: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        .frequency-option-row:hover {
          border-color: #9AA3D5;
          background: #F5F7FF;
          transform: translateY(-1px);
        }

        .frequency-option-row.selected {
          border-color: #4C5FD5;
          background: #EEF2FD;
          box-shadow: 0 0 0 1px #4C5FD5;
        }

        .freq-radio-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #CBD2E6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
          background: #FFFFFF;
        }

        .frequency-option-row.selected .freq-radio-circle {
          border-color: #4C5FD5;
          background: #4C5FD5;
        }

        .freq-radio-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #FFFFFF;
        }

        .freq-days-text {
          font-size: 14px;
          font-weight: 700;
          color: #171A32;
        }

        .freq-sessions-text {
          font-size: 12px;
          color: #6B7089;
          font-weight: 500;
          margin-top: 1px;
        }

        .freq-price-text {
          font-size: 16.5px;
          font-weight: 800;
          color: #171A32;
          letter-spacing: -0.01em;
        }

        .badge-popular {
          background: #4C5FD5;
          color: #FFFFFF;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 4px;
          margin-bottom: 2px;
          display: inline-block;
        }

        .plan-card-action-bar {
          background: linear-gradient(135deg, #4C5FD5 0%, #3B4DBF 100%);
          color: #FFFFFF;
          border-radius: 10px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 4px;
          box-shadow: 0 4px 16px rgba(76, 95, 213, 0.28);
        }

        .plan-action-main {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 700;
        }

        .plan-action-trial-badge {
          font-size: 11.5px;
          background: rgba(255, 255, 255, 0.2);
          padding: 3px 10px;
          border-radius: 20px;
          font-weight: 600;
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
