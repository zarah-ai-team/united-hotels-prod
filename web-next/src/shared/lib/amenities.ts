// The amenities array we get back from the API is double-encoded for many
// hotels — each entry's `name` is itself a JSON-stringified object (or part of
// one), e.g.
//   [{ name: '[{"name":"Free Wi-Fi"}' },
//    { name: '{"name":"stylish boutique rooms"}' },
//    { name: '{"name":"and tour assistance."}]' }]
// extractAmenityNames undoes that wrapping and returns clean human strings.

export function extractAmenityNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const out: string[] = [];
  for (const entry of raw) {
    const cleaned = cleanOne(entry);
    if (cleaned) out.push(cleaned);
  }
  return out;
}

function cleanOne(entry: unknown): string {
  if (entry == null) return "";

  // Pull the candidate string off whatever shape we got
  let raw = "";
  if (typeof entry === "string") {
    raw = entry;
  } else if (typeof entry === "object") {
    const obj = entry as Record<string, unknown>;
    raw = typeof obj.name === "string" ? obj.name : "";
  }

  raw = raw.trim();
  if (!raw) return "";

  // Try to dig out the inner `"name":"X"` if the value is JSON-stringified
  const inner = raw.match(/"name"\s*:\s*"([^"]+)"/);
  if (inner) return collapse(inner[1]);

  // Otherwise strip JSON wrapping characters that may have leaked in
  return collapse(raw.replace(/^[\[\{"\s]+|[\]\}"\s]+$/g, ""));
}

function collapse(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  // Drop trailing punctuation noise like "and tour assistance." → "Tour assistance"
  return t.replace(/^and\s+/i, "").replace(/\.$/, "").trim();
}

export function capitalizeAmenity(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    // Preserve "Wi-Fi" capitalization after the lowercase pass
    .replace(/\bWi-fi\b/g, "Wi-Fi")
    .replace(/\bWifi\b/g, "Wi-Fi");
}
