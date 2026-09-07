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
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") || "Processing…";
  const name = searchParams.get("name") || "";
  const checkRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Trigger pop animation
  useEffect(() => {
    if (checkRef.current) {
      checkRef.current.style.animation = "none";
      void checkRef.current.offsetWidth;
      checkRef.current.style.animation = "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both";
    }
  }, []);

  const handleCopy = () => {
    if (ref && ref !== "Processing…") {
      navigator.clipboard?.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(76,95,213,0.07) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(242,153,74,0.07) 0%, transparent 50%),
          var(--bg)
        `,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 16px",
        boxSizing: "border-box",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Brand - Compact */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <SunLogo size={24} />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
          }}
        >
          yogaonlive
        </span>
      </div>

      {/* Card - Viewport Optimized */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: 520,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(23,26,50,0.08)",
        }}
      >
        {/* Success header - Compact */}
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

          {/* Animated check - Compact 46px */}
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
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              margin: "0 0 4px",
            }}
          >
            Booking Received! 🎉
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
            {name
              ? `Hi ${name}! Your request has been saved. We'll be in touch within 24 hours.`
              : "Your request has been submitted. We'll be in touch within 24 hours!"}
          </p>
        </div>

        {/* Body - Compact */}
        <div className="success-body" style={{ padding: "18px 24px" }}>
          {/* Booking ref row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--dusk-soft)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
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
                  color: "var(--ink-faint)",
                }}
              >
                Booking Reference
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--dusk)",
                  letterSpacing: "0.03em",
                }}
              >
                {ref}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy Reference Number"
              style={{
                background: copied ? "var(--success-soft)" : "var(--surface)",
                border: "1px solid var(--border)",
                color: copied ? "var(--success)" : "var(--ink-soft)",
                borderRadius: "var(--radius-sm)",
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

          {/* Timeline - Compact 4 Steps */}
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
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
                background: "var(--border)",
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
                    background: item.done ? "var(--success-soft)" : "var(--surface)",
                    color: item.done ? "var(--success)" : "var(--ink-faint)",
                    border: `1.5px solid ${item.done ? "var(--success)" : "var(--border)"}`,
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
                      color: "var(--ink)",
                      marginRight: 6,
                    }}
                  >
                    {item.title}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.4 }}>
                    — {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs - 2 Column Row to save vertical space */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <a
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                background: "var(--dusk)",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(76,95,213,0.2)",
                transition: "all 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Return Home
            </a>

            <Link
              to="/book"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                background: "transparent",
                color: "var(--ink-soft)",
                border: "1.5px solid var(--border)",
                transition: "all 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v5l3 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              Book Another
            </Link>
          </div>
        </div>
      </div>

      {/* Sub-note - Compact 1-line */}
      <div
        style={{
          textAlign: "center",
          fontSize: 11.5,
          color: "var(--ink-faint)",
          marginTop: 10,
          lineHeight: 1.4,
        }}
      >
        ✉️ Confirmation email sent to your inbox · If you have questions, reply to the email anytime.
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 500px) {
          .success-header { padding: 18px 16px 14px !important; }
          .success-body { padding: 16px 14px !important; }
        }
      `}</style>
    </div>
  );
}

