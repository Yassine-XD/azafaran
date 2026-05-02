/**
 * Backend returns product.images as JSONB which can be either an array of
 * strings (URLs) or an array of {url, alt} objects depending on how the row
 * was authored. Normalise to string|null at the boundary so screens don't
 * have to branch.
 */
export function firstImage(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && typeof (first as any).url === "string") {
    return (first as any).url;
  }
  return null;
}

export function allImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((i) => (typeof i === "string" ? i : i?.url))
    .filter((u): u is string => typeof u === "string" && u.length > 0);
}
