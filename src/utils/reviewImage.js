import { urlPictures } from "../constants/constants";

/**
 * Returns a fully qualified and valid URL for review images
 * Handles relative backend paths, bare filenames, blob/data URLs, and external links.
 * 
 * @param {string|object} img - Image object ({ url: ... }) or URL string
 * @returns {string} Fully qualified image URL
 */
export function getReviewImageUrl(img) {
  if (!img) return "";
  const raw = typeof img === "string" ? img : img?.url || "";
  if (!raw || typeof raw !== "string") return "";

  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Blob and base64 URLs (e.g. upload previews)
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const base = (urlPictures || "http://localhost:8080/api/v1/image/").replace(/\/+$/, "");

  // If already absolute URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // If it points to an /api/v1/image/ path on another host (e.g. saved as production sdmedik.ru on dev)
    if (trimmed.includes("/api/v1/image/")) {
      const filename = trimmed.split("/api/v1/image/")[1];
      if (filename) {
        return `${base}/${filename}`;
      }
    }
    return trimmed;
  }

  // If path starts with /api/v1/image/
  if (trimmed.startsWith("/api/v1/image/")) {
    const filename = trimmed.replace(/^\/api\/v1\/image\//, "");
    return `${base}/${filename}`;
  }

  // If path starts with /image/
  if (trimmed.startsWith("/image/")) {
    const filename = trimmed.replace(/^\/image\//, "");
    return `${base}/${filename}`;
  }

  // If path starts with leading slash
  if (trimmed.startsWith("/")) {
    const cleaned = trimmed.replace(/^\/+/, "");
    return `${base}/${cleaned}`;
  }

  // Bare filename (e.g. "0ef8ecca-0fd7-439b-990c-12c8324178cf.jpg")
  return `${base}/${trimmed}`;
}
