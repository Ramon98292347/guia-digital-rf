export const MAX_MEDIA_UPLOAD_BYTES = 150 * 1024 * 1024;

export const MEDIA_STORAGE = {
  privateBucket: "tenant-private-media",
  publicBucket: "tenant-public-media",
  externalBucket: "external-r2",
  maxFileSizeBytes: MAX_MEDIA_UPLOAD_BYTES,
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
    "video/quicktime",
    "application/pdf",
  ] as const,
  extensionsByMimeType: {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/avif": ["avif"],
    "video/mp4": ["mp4"],
    "video/webm": ["webm"],
    "video/quicktime": ["mov"],
    "application/pdf": ["pdf"],
  },
} as const;

export type MediaCategory = (typeof MEDIA_STORAGE.categories)[number];
export type AllowedMediaMimeType =
  (typeof MEDIA_STORAGE.allowedMimeTypes)[number];

export function inferMediaMimeType(filename: string, declaredMimeType: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  const mimeByExtension: Record<string, AllowedMediaMimeType> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
  };

  return mimeByExtension[extension ?? ""] ?? declaredMimeType;
}
