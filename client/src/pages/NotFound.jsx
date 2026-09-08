import React from "react";
import { useLocation, Link } from "react-router-dom";

function SunLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="5.5" fill="#F2994A" />
      <circle
        cx="17"
        cy="17"
        r="11"
        stroke="#F2994A"
        strokeWidth="1.5"
        strokeDasharray="3.5 2.8"
        fill="none"
      />
      <path
        d="M17 3.5v3M17 27.5v3M3.5 17h3M27.5 17h3M7.2 7.2l2 2M24.8 24.8l2 2M24.8 7.2l-2 2M7.2 24.8l2-2"
        stroke="#F2994A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function NotFound() {
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(235,87,87,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(76,95,213,0.06) 0%, transparent 50%),
          var(--bg, #F6F7FB)
        `,
        fontFamily: "var(--font-body, system-ui, sans-serif)",
        color: "var(--ink, #171A32)",
        boxSizing: "border-box",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <SunLogo size={28} />
        <span
          style={{
            fontFamily: "var(--font-display, inherit)",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          yogaonlive
        </span>
      </div>

      {/* 404 Error Card */}
      <div
        style={{
          background: "var(--surface, #FFFFFF)",
          border: "1px solid var(--border, #E3E6F2)",
          borderRadius: "var(--radius-lg, 16px)",
          width: "100%",
          maxWidth: 480,
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "0 12px 36px rgba(23,26,50,0.06)",
        }}
      >
        {/* Error icon badge */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(235, 87, 87, 0.1)",
            border: "2px solid rgba(235, 87, 87, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            color: "#EB5757",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          ⚠️
        </div>

        <div
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#EB5757",
            background: "rgba(235, 87, 87, 0.08)",
            padding: "4px 12px",
            borderRadius: 6,
            marginBottom: 10,
          }}
        >
          404 &middot; Page Not Found
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "0 0 10px",
            color: "var(--ink, #171A32)",
          }}
        >
          Invalid Address / URL
        </h1>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--ink-soft, #6B7089)",
            margin: "0 0 18px",
          }}
        >
          The page or path{" "}
          <code
            style={{
              background: "var(--dusk-soft, #EEF0FA)",
              color: "var(--dusk, #4C5FD5)",
              padding: "2px 6px",
              borderRadius: 4,
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            {location.pathname}
          </code>{" "}
          does not exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 16px",
              borderRadius: "var(--radius-md, 10px)",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              background: "var(--dusk, #4C5FD5)",
              color: "#ffffff",
              transition: "opacity 0.15s",
            }}
          >
            &larr; Studio Home
          </Link>

          <Link
            to="/book"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 16px",
              borderRadius: "var(--radius-md, 10px)",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              background: "transparent",
              color: "var(--ink-soft, #4B5264)",
              border: "1.5px solid var(--border, #E3E6F2)",
              transition: "all 0.15s",
            }}
          >
            Book Class &rarr;
          </Link>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--ink-faint, #A3A8C3)", marginTop: 20 }}>
        &copy; {new Date().getFullYear()} yogaonlive &middot; Live Online Yoga
      </p>
    </div>
  );
}
