import React, { useState } from "react";
import { findCountry, getFlagUrl } from "../constants/countries";

export default function CountryFlag({
  country,
  countryCode,
  size = "md",
  className = "",
  style = {},
  showName = false,
}) {
  const [imgError, setImgError] = useState(false);

  // Resolve country object
  let resolved = null;
  if (typeof country === "object" && country !== null) {
    resolved = country;
  } else if (country) {
    resolved = findCountry(country);
  } else if (countryCode) {
    resolved = findCountry(countryCode);
  }

  const code = resolved?.code;
  const name = resolved?.name || (typeof country === "string" ? country : "Country");
  const emoji = resolved?.flag || "🌐";
  const flagUrl = code && code !== "Other" ? getFlagUrl(code) : null;

  // Dimensions
  const dimensions = {
    xs: { width: 16, height: 11, fontSize: 12 },
    sm: { width: 20, height: 14, fontSize: 13 },
    md: { width: 24, height: 17, fontSize: 16 },
    lg: { width: 30, height: 21, fontSize: 20 },
  }[size] || { width: 24, height: 17, fontSize: 16 };

  const flagElement = flagUrl && !imgError ? (
    <img
      src={flagUrl}
      srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
      alt={name}
      loading="lazy"
      onError={() => setImgError(true)}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        objectFit: "cover",
        borderRadius: 3,
        boxShadow: "0 0.5px 2px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.08)",
        flexShrink: 0,
        display: "inline-block",
        verticalAlign: "middle",
      }}
    />
  ) : (
    <span
      style={{
        fontSize: dimensions.fontSize,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      role="img"
      aria-label={name}
    >
      {emoji}
    </span>
  );

  if (!showName) {
    return (
      <span
        className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
        style={style}
        title={name}
      >
        {flagElement}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 flex-shrink-0 ${className}`}
      style={style}
    >
      {flagElement}
      <span>{name}</span>
    </span>
  );
}
