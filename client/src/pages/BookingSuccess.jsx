import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

function SunLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="5.5" fill="#F2994A" />
      <circle cx="17" cy="17" r="11" stroke="#F2994A" strokeWidth="1.5" strokeDasharray="3.5 2.8" fill="none" />
      <path
        d="M17 3.5v3M17 27.5v3M3.5 17h3M27.5 17h3M7.2 7.2l2 2M24.8 24.8l2 2M24.8 7.2l-2 2M7.2 24.8l2-2"
        stroke="#F2994A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TIMELINE = [
  {
    done: true,
    title: "Booking submitted",
    desc: "Saved to studio system & confirmation email dispatched.",
  },
  {
    done: false,
    n: 2,
    title: "Instructor matching",
    desc: "We review your timezone & goals within 24 hours.",
  },
  {
    done: false,
    n: 3,
    title: "Personal outreach",
    desc: "Expect a WhatsApp or email message to confirm trial slot.",
  },
  {
    done: false,
    n: 4,
    title: "Your first class 🧘",
    desc: "Join your live guided complimentary trial session!",
  },
];

export default function BookingSuccess() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawRef = searchParams.get("ref");
  const ref = rawRef?.trim() || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const checkRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Production-grade URL sanitation: strip any extraneous PII parameters (like name or email)
  // so sensitive information is never exposed or retained in the browser address bar
  useEffect(() => {
    if (searchParams.has("name") || searchParams.has("email")) {
      const cleanParams = new URLSearchParams();
      if (ref) cleanParams.set("ref", ref);
      setSearchParams(cleanParams, { replace: true });
    }
  }, [searchParams, ref, setSearchParams]);

  // Fetch and verify booking reference against backend database
  useEffect(() => {
    if (!ref) {
      setLoading(false);
      setError("No booking reference was provided in the address URL.");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    async function verifyBooking() {
      try {
        const res = await fetch(`/api/bookings/ref/${encodeURIComponent(ref)}`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.booking) {
          throw new Error(data.error || `No active booking found matching reference "${ref}".`);
        }

        if (isMounted) {
          setBooking(data.booking);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Invalid or non-existent booking reference.");
          setLoading(false);
        }
      }
    }

    verifyBooking();

    return () => {
      isMounted = false;
    };
  }, [ref]);

  // Trigger pop animation when loaded
  useEffect(() => {
    if (!loading && !error && checkRef.current) {
      checkRef.current.style.animation = "none";
      void checkRef.current.offsetWidth;
      checkRef.current.style.animation = "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both";
    }
  }, [loading, error]);

  const handleCopy = () => {
    const code = booking?.bookingRef || ref;
    if (code) {
      navigator.clipboard?.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── 1. Loading State ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "var(--bg, #F6F7FB)",
          fontFamily: "var(--font-body, system-ui, sans-serif)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <SunLogo size={26} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ink, #171A32)" }}>yogaonlive</span>
        </div>
        <div
          style={{
            background: "var(--surface, #FFFFFF)",
            border: "1px solid var(--border, #E3E6F2)",
            borderRadius: "var(--radius-lg, 16px)",
            maxWidth: 440,
            width: "100%",
            padding: "36px 28px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid var(--border, #E3E6F2)",
              borderTopColor: "var(--dusk, #4C5FD5)",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink, #171A32)", margin: "0 0 6px" }}>
            Verifying Booking Reference…
          </h3>
          <p style={{ fontSize: 13, color: "var(--ink-soft, #6B7089)", margin: 0 }}>
            Checking reference <code style={{ fontFamily: "monospace", color: "var(--dusk, #4C5FD5)" }}>{ref}</code> against studio records.
          </p>
        </div>
      </div>
    );
  }

  // ─── 2. Error State (Invalid / Tampered Reference) ────────────────────────────
  if (error || !booking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(235,87,87,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(76,95,213,0.06) 0%, transparent 50%),
            var(--bg, #F6F7FB)
          `,
          fontFamily: "var(--font-body, system-ui, sans-serif)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <SunLogo size={26} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ink, #171A32)" }}>yogaonlive</span>
        </div>

        <div
          style={{
            background: "var(--surface, #FFFFFF)",
            border: "1px solid var(--border, #E3E6F2)",
            borderRadius: "var(--radius-lg, 16px)",
            maxWidth: 480,
            width: "100%",
            padding: "32px 28px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "rgba(235, 87, 87, 0.1)",
              border: "2px solid rgba(235, 87, 87, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              margin: "0 auto 16px",
            }}
          >
            ⚠️
          </div>

          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#EB5757",
              background: "rgba(235, 87, 87, 0.08)",
              padding: "4px 10px",
              borderRadius: 6,
              marginBottom: 10,
            }}
          >
            Verification Error
          </div>

          <h2 style={{ fontSize: 21, fontWeight: 700, margin: "0 0 8px", color: "var(--ink, #171A32)" }}>
            Booking Reference Not Found
          </h2>

          <p style={{ fontSize: 13.5, color: "var(--ink-soft, #6B7089)", lineHeight: 1.55, margin: "0 0 20px" }}>
            {ref ? (
              <>
                The booking reference <strong style={{ color: "#EB5757", fontFamily: "monospace" }}>{ref}</strong> does not exist in our database. It may be mistyped or expired.
              </>
            ) : (
              "No booking reference was provided in the address URL. Please fill out our registration form to book a yoga class."
            )}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Link
              to="/book"
              style={{
                padding: "11px 16px",
                borderRadius: "var(--radius-md, 10px)",
                background: "var(--dusk, #4C5FD5)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Book a Class &rarr;
            </Link>
            <Link
              to="/"
              style={{
                padding: "11px 16px",
                borderRadius: "var(--radius-md, 10px)",
                border: "1.5px solid var(--border, #E3E6F2)",
                color: "var(--ink-soft, #4B5264)",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Studio Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── 3. Verified Success State ───────────────────────────────────────────────
  const verifiedFirstName = (booking.name || "").trim().split(" ")[0] || "Student";
  const verifiedEmail = booking.email || "";
  const verifiedRef = booking.bookingRef;

  return (
    <div
      style={{
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(76,95,213,0.07) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(242,153,74,0.07) 0%, transparent 50%),
          var(--bg, #F6F7FB)
        `,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 16px",
        boxSizing: "border-box",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <SunLogo size={24} />
        <span
          style={{
            fontFamily: "var(--font-display, inherit)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--ink, #171A32)",
            letterSpacing: "-0.02em",
          }}
        >
          yogaonlive
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          background: "var(--surface, #FFFFFF)",
          border: "1px solid var(--border, #E3E6F2)",
          borderRadius: "var(--radius-lg, 16px)",
          width: "100%",
          maxWidth: 520,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(23,26,50,0.08)",
        }}
      >
        {/* Success header */}
        <div
          className="success-header"
          style={{
            padding: "20px 24px 16px",
            textAlign: "center",
            background: "linear-gradient(145deg, #1E9E63 0%, #25ad73 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              background: "rgba(255,255,255,0.08)",
              borderRadius: "50%",
              top: -60,
              right: -40,
              pointerEvents: "none",
            }}
          />

          {/* Animated check */}
          <div
            ref={checkRef}
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.22)",
              border: "2px solid rgba(255,255,255,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 8px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 34 34" fill="none">
              <path
                d="M7 17.5l7 7 13-13"
                stroke="white"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display, inherit)",
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              margin: "0 0 4px",
            }}
          >
            Booking Confirmed! 🎉
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.45,
              maxWidth: 380,
              margin: "0 auto",
            }}
          >
            Hi <strong>{verifiedFirstName}</strong>! Your request is verified and logged in our studio system.
          </p>
        </div>

        {/* Body */}
        <div className="success-body" style={{ padding: "18px 24px" }}>
          {/* Booking ref row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--dusk-soft, #EEF0FA)",
              border: "1px solid var(--border, #E3E6F2)",
              borderRadius: "var(--radius-md, 10px)",
              padding: "9px 14px",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--ink-faint, #A3A8C3)",
                }}
              >
                Verified Reference
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--dusk, #4C5FD5)",
                  letterSpacing: "0.03em",
                }}
              >
                {verifiedRef}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy Reference Number"
              style={{
                background: copied ? "var(--success-soft, #E6F8F0)" : "var(--surface, #FFF)",
                border: "1px solid var(--border, #E3E6F2)",
                color: copied ? "var(--success, #1E9E63)" : "var(--ink-soft, #4B5264)",
                borderRadius: "var(--radius-sm, 6px)",
                padding: "5px 10px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          {/* Email Confirmation Notice */}
          {verifiedEmail && (
            <div
              style={{
                background: "rgba(76, 95, 213, 0.07)",
                border: "1px solid rgba(76, 95, 213, 0.2)",
                borderRadius: "var(--radius-md, 10px)",
                padding: "10px 14px",
                marginBottom: 14,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>✉️</span>
              <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "var(--ink-soft, #4B5264)" }}>
                Confirmation sent to <strong style={{ color: "var(--ink, #171A32)" }}>{verifiedEmail}</strong>
                <div style={{ fontSize: 11, color: "var(--ink-faint, #A3A8C3)", marginTop: 2 }}>
                  If not in your inbox, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-faint, #A3A8C3)",
              marginBottom: 8,
            }}
          >
            What happens next
          </div>

          <div style={{ position: "relative", marginBottom: 14 }}>
            {/* Vertical connector line */}
            <div
              style={{
                position: "absolute",
                left: 11,
                top: 10,
                bottom: 10,
                width: 2,
                background: "var(--border, #E3E6F2)",
              }}
            />

            {TIMELINE.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "6px 0",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 1,
                    background: item.done ? "var(--success-soft, #E6F8F0)" : "var(--surface, #FFF)",
                    color: item.done ? "var(--success, #1E9E63)" : "var(--ink-faint, #A3A8C3)",
                    border: `1.5px solid ${item.done ? "var(--success, #1E9E63)" : "var(--border, #E3E6F2)"}`,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {item.done ? (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7l3 3 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    item.n
                  )}
                </div>
                <div style={{ paddingTop: 2 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--ink, #171A32)",
                      marginRight: 6,
                    }}
                  >
                    {item.title}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--ink-soft, #4B5264)", lineHeight: 1.4 }}>
                    — {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 14px",
                borderRadius: "var(--radius-md, 10px)",
                fontFamily: "var(--font-body, system-ui, sans-serif)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                background: "var(--dusk, #4C5FD5)",
                color: "#ffffff",
                transition: "opacity 0.15s",
              }}
            >
              Return Home
            </Link>

            <Link
              to="/book"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 14px",
                borderRadius: "var(--radius-md, 10px)",
                fontFamily: "var(--font-body, system-ui, sans-serif)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                background: "transparent",
                color: "var(--ink-soft, #4B5264)",
                border: "1.5px solid var(--border, #E3E6F2)",
                transition: "all 0.15s",
              }}
            >
              Book Another &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
