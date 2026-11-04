import { summarizeRgba, type PixelSummary, type VisionHit } from "@/lib/classify";

const TF_SRC = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
const MOBILENET_SRC =
  "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js";

interface MobileNetModel {
  classify: (
    image: HTMLImageElement | HTMLCanvasElement,
    topk?: number,
  ) => Promise<{ className: string; probability: number }[]>;
}

interface MobileNetGlobal {
  load: (options?: { version?: number; alpha?: number }) => Promise<MobileNetModel>;
}

let modelPromise: Promise<MobileNetModel> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-looktwice="${src}"]`);
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }
    const script = existing ?? document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.looktwice = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    if (!existing) document.head.appendChild(script);
  });
}

async function loadModel(): Promise<MobileNetModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      await loadScript(TF_SRC);
      await loadScript(MOBILENET_SRC);
      const host = window as Window & { mobilenet?: MobileNetGlobal };
      if (!host.mobilenet) throw new Error("MobileNet did not attach to the page.");
      return host.mobilenet.load({ version: 2, alpha: 1 });
    })().catch((error) => {
      modelPromise = null;
      throw error;
    });
  }
  return modelPromise;
}

export async function readPhoto(file: File): Promise<{ summary: PixelSummary; previewUrl: string }> {
  const previewUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(previewUrl);
    const max = 64;
    const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas is unavailable.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return { summary: summarizeRgba(pixels.data), previewUrl };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That image could not be decoded."));
    image.src = url;
  });
}

export async function runVision(previewUrl: string): Promise<VisionHit[] | null> {
  try {
    const image = await loadImage(previewUrl);
    const model = await loadModel();
    const predictions = await model.classify(image, 5);
    return predictions.map((prediction) => ({
      label: prediction.className,
      probability: prediction.probability,
    }));
  } catch {
    return null;
  }
}
