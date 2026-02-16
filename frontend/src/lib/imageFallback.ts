import type { SyntheticEvent } from "react";
import { normalizeImageUrl } from "@/api/upload";

export const handleImageFallback = (
  event: SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl?: string | null
) => {
  const image = event.currentTarget;
  const hasFallbackApplied = image.dataset.fallbackApplied === "1";
  const fallback = fallbackUrl ? normalizeImageUrl(fallbackUrl) : "";

  if (!fallback || hasFallbackApplied || image.src === fallback) {
    image.style.display = "none";
    return;
  }

  image.dataset.fallbackApplied = "1";
  image.src = fallback;
};

