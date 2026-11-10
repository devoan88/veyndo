"use client";

const MAX_INPUT_BYTES = 8 * 1024 * 1024; // 8 MB before resize
const MAX_OUTPUT_DIM = 1400;

/** Downscale a photo in the browser and return a JPEG data URL. */
export async function resizeImage(file: File, max = MAX_OUTPUT_DIM): Promise<string> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("image_too_large");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}
