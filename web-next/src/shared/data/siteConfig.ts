// Site-level image and branding configuration
export const heroImage = "/figma-assets/2e73560823491cb7aae2b44b94830399bada8384.png";
export const featuredImages = [
  "/figma-assets/7e02ef53fba6bfed58f4b1e0c7a280049a2e42.png",
  "/figma-assets/24b94370ae50cf05c8eda404c2045b52c5b68320.png",
  "/figma-assets/8f984202fbaeba666218cc18c77f76d76937ac95.png",
];
export const placeholderImage = "/figma-assets/9783e6851bc031fabe001ad50fc466eb1ba42e2e.png";

/**
 * Resolve a hotel/room image URL, falling back to the shared placeholder if
 * the source is empty, missing, or otherwise invalid.
 */
export function resolveImage(src?: string | null): string {
  if (!src || typeof src !== "string" || src.trim() === "") {
    return placeholderImage;
  }
  return src;
}

/**
 * onError handler for <img> elements — swaps a broken image to the shared
 * full-width placeholder so the layout never shows an empty/broken state.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
) {
  const img = e.currentTarget;
  if (!img.src.endsWith(placeholderImage)) {
    img.src = placeholderImage;
  }
}
