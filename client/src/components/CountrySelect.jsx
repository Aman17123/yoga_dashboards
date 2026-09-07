import React, { useState, useRef, useEffect } from "react";
import { COUNTRIES_DATA, findCountry } from "../constants/countries";
import CountryFlag from "./CountryFlag";

export default function CountrySelect({
  value,
  onChange,
  placeholder = "Select your country…",
  error = false,
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedCountry = findCountry(value);

  // Filter countries by search query
  const filtered = COUNTRIES_DATA.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.includes(q)
    );
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus search input on open
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (country) => {
    onChange(country.name, country);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: "100%",
          padding: "11px 14px",
          border: `1.5px solid ${error ? "var(--danger)" : isOpen ? "var(--dusk)" : "var(--border)"}`,
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: selectedCountry ? "var(--ink)" : "var(--ink-faint)",
          background: "var(--surface)",
          outline: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          boxShadow: isOpen ? "0 0 0 3px rgba(76,95,213,0.1)" : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          {selectedCountry ? (
            <>
              <CountryFlag country={selectedCountry} size="sm" />
              <span style={{ fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {selectedCountry.name}
              </span>
              <span style={{ fontSize: 12, color: "var(--ink-soft)", flexShrink: 0 }}>
                ({selectedCountry.dialCode})
              </span>
            </>
          ) : (
            <span style={{ color: "var(--ink-faint)" }}>{placeholder}</span>
          )}
        </div>

        {/* Chevron icon */}
        <div style={{
          color: "var(--ink-soft)",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
          flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 12px 32px rgba(23, 26, 50, 0.14)",
            zIndex: 999,
            overflow: "hidden",
            maxHeight: 320,
            display: "flex",
            flexDirection: "column",
            animation: "dropdownFadeIn 0.15s ease-out",
          }}
        >
          {/* Search bar inside dropdown */}
          <div style={{
            padding: "8px 10px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}>
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}>
              <span style={{ position: "absolute", left: 10, color: "var(--ink-faint)", fontSize: 13, pointerEvents: "none" }}>
                🔍
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or dial code…"
                style={{
                  width: "100%",
                  padding: "7px 10px 7px 32px",
                  fontSize: 13,
                  fontFamily: "var(--font-body)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  outline: "none",
                  color: "var(--ink)",
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: 8,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "var(--ink-soft)",
                    padding: "2px 4px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* List of Countries */}
          <div style={{ overflowY: "auto", flex: 1, padding: "4px 0" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: 13, color: "var(--ink-soft)" }}>
                No matching country found
              </div>
            ) : (
              filtered.map((c) => {
                const isSelected = selectedCountry?.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      background: isSelected ? "var(--dusk-soft)" : "transparent",
                      color: isSelected ? "var(--dusk)" : "var(--ink)",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 13.5,
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
                    <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                      <CountryFlag country={c} size="sm" />
                      <span style={{ fontWeight: isSelected ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.name}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: isSelected ? "var(--dusk)" : "var(--ink-soft)",
                      flexShrink: 0,
                    }}>
                      {c.dialCode}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
