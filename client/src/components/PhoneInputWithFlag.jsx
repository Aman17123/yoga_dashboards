import React, { useState, useEffect, useRef } from "react";
import { COUNTRIES_DATA, findCountry } from "../constants/countries";
import CountryFlag from "./CountryFlag";

export default function PhoneInputWithFlag({
  value = "",
  country = "India",
  onChange,
  error = false,
  id = "phone",
}) {
  // Detect country info
  const initialCountry = findCountry(country) || COUNTRIES_DATA[0]; // defaults to India
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dialSearch, setDialSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync selected country when parent `country` prop changes
  useEffect(() => {
    if (country) {
      const match = findCountry(country);
      if (match && match.code !== selectedCountry?.code) {
        setSelectedCountry(match);
      }
    }
  }, [country]);

  // Parse incoming value on initial load or if value prop is updated from outside
  useEffect(() => {
    if (!value) {
      setPhoneNumber("");
      return;
    }
    // Check if value starts with a known dial code
    let matchedCountry = null;
    let strippedNumber = value;

    // Find longest matching dial code
    for (const c of COUNTRIES_DATA) {
      if (value.startsWith(c.dialCode)) {
        if (!matchedCountry || c.dialCode.length > matchedCountry.dialCode.length) {
          matchedCountry = c;
        }
      }
    }

    if (matchedCountry) {
      strippedNumber = value.slice(matchedCountry.dialCode.length).trim();
      setSelectedCountry(matchedCountry);
      setPhoneNumber(strippedNumber);
    } else {
      setPhoneNumber(value);
    }
  }, []);

  // Filter countries for dial code search
  const filtered = COUNTRIES_DATA.filter((c) => {
    if (!dialSearch.trim()) return true;
    const q = dialSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Handle phone number input
  const handleNumberChange = (e) => {
    const raw = e.target.value;
    setPhoneNumber(raw);
    if (onChange) {
      const full = raw.trim() ? `${selectedCountry?.dialCode || "+91"} ${raw.trim()}` : "";
      onChange(full);
    }
  };

  // Handle choosing a different dial code
  const handleSelectCountry = (c) => {
    setSelectedCountry(c);
    setIsDropdownOpen(false);
    setDialSearch("");
    if (onChange && phoneNumber.trim()) {
      onChange(`${c.dialCode} ${phoneNumber.trim()}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          border: `1.5px solid ${error ? "var(--danger)" : isFocused ? "var(--dusk)" : "var(--border)"}`,
          borderRadius: "var(--radius-sm)",
          background: "var(--surface)",
          boxShadow: isFocused ? "0 0 0 3px rgba(76,95,213,0.1)" : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          overflow: "hidden",
        }}
      >
        {/* Flag + Dial Code Trigger */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          title={`Change country code (${selectedCountry?.name || "Country"})`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 12px",
            background: "var(--bg)",
            border: "none",
            borderRight: "1px solid var(--border)",
            cursor: "pointer",
            outline: "none",
            fontSize: 13.5,
            fontFamily: "var(--font-mono)",
            color: "var(--ink)",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-alt)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg)")}
        >
          <CountryFlag country={selectedCountry} size="sm" />
          <span style={{ fontWeight: 600 }}>{selectedCountry?.dialCode || "+91"}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: "var(--ink-soft)" }}>
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Number Input Field */}
        <input
          id={id}
          type="tel"
          value={phoneNumber}
          onChange={handleNumberChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={selectedCountry?.format || "98765 43210"}
          style={{
            flex: 1,
            padding: "11px 14px",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--ink)",
            background: "transparent",
            minWidth: 0,
          }}
        />

        {phoneNumber && (
          <button
            type="button"
            onClick={() => {
              setPhoneNumber("");
              if (onChange) onChange("");
            }}
            style={{
              padding: "0 10px",
              background: "transparent",
              border: "none",
              color: "var(--ink-faint)",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
            }}
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dial Code Dropdown */}
      {isDropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: "min(320px, 90vw)",
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 12px 32px rgba(23, 26, 50, 0.14)",
            zIndex: 1000,
            overflow: "hidden",
            maxHeight: 280,
            display: "flex",
            flexDirection: "column",
            animation: "dropdownFadeIn 0.15s ease-out",
          }}
        >
          {/* Search */}
          <div style={{
            padding: "8px 10px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}>
            <input
              ref={searchInputRef}
              type="text"
              value={dialSearch}
              onChange={(e) => setDialSearch(e.target.value)}
              placeholder="Search code or country…"
              style={{
                width: "100%",
                padding: "6px 10px",
                fontSize: 13,
                fontFamily: "var(--font-body)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                outline: "none",
                color: "var(--ink)",
              }}
            />
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1, padding: "4px 0" }}>
            {filtered.map((c) => {
              const isSelected = selectedCountry?.code === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectCountry(c)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    background: isSelected ? "var(--dusk-soft)" : "transparent",
                    color: isSelected ? "var(--dusk)" : "var(--ink)",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                    fontFamily: "var(--font-body)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "var(--bg)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                    <CountryFlag country={c} size="xs" />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    color: isSelected ? "var(--dusk)" : "var(--ink-soft)",
                    flexShrink: 0,
                  }}>
                    {c.dialCode}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
