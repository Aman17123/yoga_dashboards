// Comprehensive international country dataset with flags, ISO codes, dial codes, timezones
export const COUNTRIES_DATA = [
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91", format: "98765 43210", defaultTz: "Asia/Kolkata" },
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1", format: "(555) 234-5678", defaultTz: "America/New_York" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44", format: "7700 900123", defaultTz: "Europe/London" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1", format: "(416) 555-0123", defaultTz: "America/Toronto" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61", format: "400 123 456", defaultTz: "Australia/Sydney" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971", format: "50 123 4567", defaultTz: "Asia/Dubai" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dialCode: "+65", format: "8123 4567", defaultTz: "Asia/Singapore" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49", format: "151 2345678", defaultTz: "Europe/Berlin" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33", format: "6 12 34 56 78", defaultTz: "Europe/Paris" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dialCode: "+81", format: "90-1234-5678", defaultTz: "Asia/Tokyo" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234", format: "803 123 4567", defaultTz: "Africa/Lagos" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27", format: "82 123 4567", defaultTz: "Africa/Johannesburg" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", dialCode: "+64", format: "21 123 4567", defaultTz: "Pacific/Auckland" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dialCode: "+31", format: "6 12345678", defaultTz: "Europe/Amsterdam" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dialCode: "+46", format: "70 123 45 67", defaultTz: "Europe/Stockholm" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", dialCode: "+41", format: "79 123 45 67", defaultTz: "Europe/Zurich" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", dialCode: "+353", format: "87 123 4567", defaultTz: "Europe/Dublin" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dialCode: "+34", format: "612 34 56 78", defaultTz: "Europe/Madrid" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dialCode: "+39", format: "320 123 4567", defaultTz: "Europe/Rome" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966", format: "50 123 4567", defaultTz: "Asia/Riyadh" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dialCode: "+974", format: "3312 3456", defaultTz: "Asia/Qatar" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dialCode: "+965", format: "9123 4567", defaultTz: "Asia/Kuwait" },
  { code: "OM", name: "Oman", flag: "🇴🇲", dialCode: "+968", format: "9123 4567", defaultTz: "Asia/Muscat" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", dialCode: "+973", format: "3600 1234", defaultTz: "Asia/Bahrain" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dialCode: "+60", format: "12-345 6789", defaultTz: "Asia/Kuala_Lumpur" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dialCode: "+62", format: "812-3456-7890", defaultTz: "Asia/Jakarta" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", dialCode: "+63", format: "917 123 4567", defaultTz: "Asia/Manila" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dialCode: "+66", format: "81 234 5678", defaultTz: "Asia/Bangkok" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dialCode: "+84", format: "91 234 56 78", defaultTz: "Asia/Ho_Chi_Minh" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dialCode: "+20", format: "100 123 4567", defaultTz: "Africa/Cairo" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254", format: "712 345678", defaultTz: "Africa/Nairobi" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dialCode: "+55", format: "(11) 91234-5678", defaultTz: "America/Sao_Paulo" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dialCode: "+52", format: "55 1234 5678", defaultTz: "America/Mexico_City" },
  { code: "RU", name: "Russia", flag: "🇷🇺", dialCode: "+7", format: "912 345-67-89", defaultTz: "Europe/Moscow" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dialCode: "+82", format: "10-1234-5678", defaultTz: "Asia/Seoul" },
  { code: "NO", name: "Norway", flag: "🇳🇴", dialCode: "+47", format: "412 34 567", defaultTz: "Europe/Oslo" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", dialCode: "+45", format: "20 12 34 56", defaultTz: "Europe/Copenhagen" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", dialCode: "+32", format: "470 12 34 56", defaultTz: "Europe/Brussels" },
  { code: "AT", name: "Austria", flag: "🇦🇹", dialCode: "+43", format: "664 1234567", defaultTz: "Europe/Vienna" },
  { code: "PL", name: "Poland", flag: "🇵🇱", dialCode: "+48", format: "512 345 678", defaultTz: "Europe/Warsaw" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dialCode: "+351", format: "912 345 678", defaultTz: "Europe/Lisbon" },
  { code: "GR", name: "Greece", flag: "🇬🇷", dialCode: "+30", format: "691 234 5678", defaultTz: "Europe/Athens" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", dialCode: "+90", format: "532 123 4567", defaultTz: "Europe/Istanbul" },
  { code: "Other", name: "Other", flag: "🌐", dialCode: "+1", format: "Phone number", defaultTz: "UTC" },
];

// Quick lookup maps
const countryByNameMap = new Map();
const countryByCodeMap = new Map();

COUNTRIES_DATA.forEach((c) => {
  countryByNameMap.set(c.name.toLowerCase(), c);
  countryByCodeMap.set(c.code.toUpperCase(), c);
});

// Common aliases mapping
const ALIASES = {
  "usa": "United States",
  "us": "United States",
  "america": "United States",
  "uk": "United Kingdom",
  "great britain": "United Kingdom",
  "england": "United Kingdom",
  "uae": "United Arab Emirates",
  "dubai": "United Arab Emirates",
  "abu dhabi": "United Arab Emirates",
  "deutschland": "Germany",
  "bharat": "India",
};

export function findCountry(query) {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();
  if (ALIASES[q]) {
    return countryByNameMap.get(ALIASES[q].toLowerCase()) || null;
  }
  if (countryByNameMap.has(q)) {
    return countryByNameMap.get(q);
  }
  if (countryByCodeMap.has(q.toUpperCase())) {
    return countryByCodeMap.get(q.toUpperCase());
  }
  // Substring match
  for (const c of COUNTRIES_DATA) {
    if (c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q) {
      return c;
    }
  }
  return null;
}

export function getFlagUrl(code) {
  if (!code || code === "Other") return null;
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}
