import React from "react";

/**
 * yogaonlive official brand logo component using /yoga-on-live.svg
 */
export default function BrandLogo({
  size = 32,
  className = "",
  style = {},
  alt = "yogaonlive logo",
}) {
  const sizeStyle = size ? { width: size, height: size } : {};
  return (
    <img
      src="/yoga-on-live.svg"
      alt={alt}
      className={`inline-block object-contain flex-none select-none ${className}`}
      style={{ ...sizeStyle, ...style }}
      draggable={false}
    />
  );
}

export { BrandLogo };
