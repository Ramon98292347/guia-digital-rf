export const MEDIA_STORAGE = {
  privateBucket: "tenant-private-media",
  publicBucket: "tenant-public-media",
  maxFileSizeBytes: 50 * 1024 * 1024,
  privatePreviewExpiresInSeconds: 60 * 5,
  categories: [
    "branding",
    "accommodations",
    "gallery",
    "services",
    "local-tips",
    "general",
  ] as const,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "video/mp4",
    "video/webm",
    "application/pdf",
  ] as const,
  extensionsByMimeType: {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/avif": ["avif"],
    "video/mp4": ["mp4"],
    "video/webm": ["webm"],
    "application/pdf": ["pdf"],
  },
} as const;

export type MediaCategory = (typeof MEDIA_STORAGE.categories)[number];
export type AllowedMediaMimeType =
  (typeof MEDIA_STORAGE.allowedMimeTypes)[number];
