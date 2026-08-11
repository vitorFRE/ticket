type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
};

function createBarcodeDetector(): BarcodeDetectorLike | null {
  const Ctor = (
    globalThis as unknown as {
      BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike;
    }
  ).BarcodeDetector;
  if (!Ctor) return null;
  try {
    return new Ctor({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

export function isPhoneDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

async function decodeFromSource(source: ImageBitmapSource): Promise<string | null> {
  const detector = createBarcodeDetector();
  if (detector) {
    try {
      const codes = await detector.detect(source);
      const text = codes[0]?.rawValue?.trim();
      if (text) return text;
    } catch {
      // fall through to jsQR
    }
  }

  const canvas = document.createElement("canvas");
  const width =
    source instanceof HTMLVideoElement ? source.videoWidth : (source as ImageBitmap).width;
  const height =
    source instanceof HTMLVideoElement ? source.videoHeight : (source as ImageBitmap).height;
  if (!width || !height) return null;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const jsQR = (await import("jsqr")).default;
  return jsQR(imageData.data, imageData.width, imageData.height)?.data.trim() || null;
}

export async function decodeQrFromFile(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    return await decodeFromSource(bitmap);
  } finally {
    bitmap.close();
  }
}

export function decodeQrFromVideo(video: HTMLVideoElement) {
  return decodeFromSource(video);
}

export const GATE_VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: "user" },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
};

export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
