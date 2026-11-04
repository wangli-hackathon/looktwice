"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Glyph } from "@/components/glyphs";
import { readPhoto, runVision } from "@/components/photo-tools";
import { ResultCard } from "@/components/result-card";
import { useWaste } from "@/components/waste-provider";
import {
  classify,
  needsConfirmation,
  searchItems,
  type ClassifyResult,
} from "@/lib/classify";
import { presentDecision } from "@/lib/guidance";
import { FEATURED_SAMPLE_IDS, getItem, items } from "@/lib/items";
import { buildEntry } from "@/lib/log";
import { getLocality } from "@/lib/localities";
import type { ClassifyMethod, Decision } from "@/lib/types";

const VISION_KEY = "looktwice.vision.v1";
const press =
  "h-11 border-2 border-ink px-4 text-base shadow-[3px_3px_0_0_#1b1712]";

function subscribeVision(listener: () => void) {
  window.addEventListener("looktwice-vision", listener);
  return () => window.removeEventListener("looktwice-vision", listener);
}

function visionSnapshot() {
  return localStorage.getItem(VISION_KEY) === "on" ? "on" : "off";
}

type Stage =
  | { status: "idle" }
  | { status: "reading"; message: string }
  | { status: "error"; message: string }
  | { status: "ready"; result: ClassifyResult; previewUrl: string | null };

export function ScanExperience() {
  const { localityId, ready, addEntries, storageError } = useWaste();
  const locality = getLocality(localityId);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage>({ status: "idle" });
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [methodOverride, setMethodOverride] = useState<ClassifyMethod | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [gramsText, setGramsText] = useState("0");
  const [logged, setLogged] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const visionOn = useSyncExternalStore(subscribeVision, visionSnapshot, () => "off") === "on";
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [modelText, setModelText] = useState<string | null>(null);
  const [modelState, setModelState] = useState<"idle" | "checking" | "rules" | "model">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<string | null>(null);
  const [decisionCity, setDecisionCity] = useState(localityId);
  if (decisionCity !== localityId) {
    setDecisionCity(localityId);
    setDecision(null);
    setLogged(false);
    setModelText(null);
    setModelState("idle");
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  useEffect(() => {
    if (!cameraOn || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => {
      setCameraError("The camera opened but would not play. Upload a photo instead.");
    });
  }, [cameraOn]);

  const grams = Number(gramsText);
  const gramsValid = Number.isFinite(grams) && grams > 0 && grams <= 50000;
  const localGuidance =
    confirmedId && decision && gramsValid
      ? presentDecision(confirmedId, localityId, decision, grams / 1000)?.guidance ?? null
      : null;

  useEffect(() => {
    if (!confirmedId || !decision) return;
    const item = getItem(confirmedId);
    if (!item) return;
    const controller = new AbortController();
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/enhance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            itemId: confirmedId,
            localityId,
            decision,
            weightKg: item.weightKg,
          }),
          signal: controller.signal,
        });
        if (!active) return;
        if (!response.ok) {
          setModelState("rules");
          return;
        }
        const payload = (await response.json()) as { enhanced?: boolean; guidance?: string };
        if (!active) return;
        if (payload.enhanced && payload.guidance) {
          setModelText(payload.guidance);
          setModelState("model");
        } else {
          setModelState("rules");
        }
      } catch (error) {
        if (!active) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setModelState("rules");
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [confirmedId, decision, localityId]);

  function rememberPreview(next: string | null) {
    if (previewRef.current && previewRef.current !== next) {
      URL.revokeObjectURL(previewRef.current);
    }
    previewRef.current = next;
  }

  function applyResult(result: ClassifyResult, previewUrl: string | null) {
    rememberPreview(previewUrl);
    setStage({ status: "ready", result, previewUrl });
    setDecision(null);
    setLogged(false);
    setMethodOverride(null);
    if (result.itemId && !needsConfirmation(result)) {
      const item = getItem(result.itemId);
      setConfirmedId(result.itemId);
      if (item) setGramsText(String(Math.round(item.weightKg * 1000)));
    } else {
      setConfirmedId(null);
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  }

  function confirm(id: string, asSearch: boolean) {
    const item = getItem(id);
    setConfirmedId(id);
    setMethodOverride(asSearch ? "search" : null);
    setDecision(null);
    setLogged(false);
    if (item) setGramsText(String(Math.round(item.weightKg * 1000)));
  }

  async function inspectFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setStage({
        status: "error",
        message: "That file is not an image. Use a photo, or type what the object is.",
      });
      return;
    }
    setStage({ status: "reading", message: "Reading pixels on this device. The photo stays here." });
    try {
      const { summary, previewUrl } = await readPhoto(file);
      let vision = null;
      let visionFailed = false;
      if (visionOn) {
        setStage({
          status: "reading",
          message: "Running MobileNet in the browser. If the download fails, the rules still run.",
        });
        vision = await runVision(previewUrl);
        visionFailed = vision === null;
      }
      const result = classify({ filename: file.name, pixels: summary, vision });
      if (visionFailed) {
        result.notes = [
          ...result.notes,
          "The vision model did not load. File name and color still ran. No photo left this browser.",
        ];
      }
      applyResult(result, previewUrl);
    } catch {
      setStage({
        status: "error",
        message: "That image could not be read. Try another file, or type the object.",
      });
    }
  }

  async function startCamera() {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser has no camera API. Upload a photo instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setCameraError("Camera permission was blocked. Upload a photo instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function shutter() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) {
      setStage({ status: "error", message: "The shutter could not grab a frame." });
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) {
      setStage({ status: "error", message: "The shutter did not produce an image." });
      return;
    }
    stopCamera();
    await inspectFile(new File([blob], "camera.jpg", { type: "image/jpeg" }));
  }

  function onSearch(event: React.FormEvent) {
    event.preventDefault();
    const result = classify({ query });
    if (!result.itemId) {
      setStage({
        status: "error",
        message: "Nothing in the catalog matches that. Try pizza box, alkaline battery, or a sample.",
      });
      return;
    }
    applyResult(result, null);
  }

  function logDecision() {
    if (stage.status !== "ready" || !confirmedId || !decision || !gramsValid || !ready) return;
    const entry = buildEntry({
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      itemId: confirmedId,
      localityId,
      decision,
      weightKg: grams / 1000,
      method: methodOverride ?? stage.result.method,
    });
    if (!entry) return;
    addEntries([entry]);
    setLogged(true);
  }

  const hits = query.trim().length >= 2 ? searchItems(query, 5) : [];
  const visibleSamples = showAll ? items.map((item) => item.id) : [...FEATURED_SAMPLE_IDS];
  const readyResult = stage.status === "ready" ? stage.result : null;
  const method = methodOverride ?? readyResult?.method ?? "unknown";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section>
        <p className="font-mono text-xs uppercase tracking-wide text-primary">Rethinking waste</p>
        <h1 className="mt-2 max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          Look twice before you toss it.
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7">
          Reuse it if it still has a job. Otherwise sort it with {locality?.city ?? "your city"} rules,
          then keep a log that says where the kilograms and the CO2e came from.
        </p>

        <form onSubmit={onSearch} className="mt-6">
          <Label htmlFor="object">What is it?</Label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <Input
              id="object"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="pizza box, banana, alkaline battery"
              className="h-11 border-2 border-ink bg-card text-base"
              autoComplete="off"
            />
            <Button type="submit" className={press}>
              Look it up
            </Button>
          </div>
        </form>
        {hits.length > 0 ? (
          <ul className="mt-2 border-2 border-ink bg-card">
            {hits.map((hit) => {
              const item = getItem(hit.itemId);
              if (!item) return null;
              return (
                <li key={hit.itemId} className="border-b border-ink last:border-b-0">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-background"
                    onClick={() => {
                      setQuery(item.name);
                      applyResult(classify({ selectedItemId: item.id }), null);
                    }}
                  >
                    <span>{item.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {Math.round(hit.score * 100)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div
          className={`mt-4 border-2 border-dashed p-4 ${dragOver ? "border-primary bg-card" : "border-ink bg-card/60"}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            const file = event.dataTransfer.files?.[0];
            if (file) void inspectFile(file);
          }}
        >
          <p className="text-sm">Drop a photo here, or use the buttons. Nothing is uploaded.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" className={press} onClick={() => fileRef.current?.click()}>
              Upload a photo
            </Button>
            <Button type="button" variant="outline" className={press} onClick={() => void startCamera()}>
              Use camera
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void inspectFile(file);
                event.target.value = "";
              }}
            />
          </div>
          {cameraError ? (
            <p className="mt-2 text-sm text-primary" role="alert">
              {cameraError}
            </p>
          ) : null}
          {cameraOn ? (
            <div className="mt-3">
              <video ref={videoRef} className="max-h-64 w-full bg-ink" playsInline muted />
              <div className="mt-2 flex gap-2">
                <Button type="button" className={press} onClick={() => void shutter()}>
                  Take photo
                </Button>
                <Button type="button" variant="outline" className={press} onClick={stopCamera}>
                  Close camera
                </Button>
              </div>
            </div>
          ) : null}
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={visionOn}
              onChange={(event) => {
                localStorage.setItem(VISION_KEY, event.target.checked ? "on" : "off");
                window.dispatchEvent(new Event("looktwice-vision"));
              }}
            />
            <span>
              On-device vision. Downloads MobileNet once, about 16 MB, and maps ImageNet labels
              to this catalog. Off by default so a demo does not depend on that download.
            </span>
          </label>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl">Sample tray</h2>
            <button type="button" className="text-sm underline" onClick={() => setShowAll((value) => !value)}>
              {showAll ? "Fewer samples" : `All ${items.length} objects`}
            </button>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {visibleSamples.map((id) => {
              const item = getItem(id);
              if (!item) return null;
              const selected = confirmedId === id || readyResult?.itemId === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => applyResult(classify({ sampleItemId: id }), null)}
                    className={`flex h-full w-full flex-col items-start border-2 border-ink p-2 text-left ${
                      selected ? "bg-ink text-card" : "bg-card"
                    }`}
                  >
                    <Glyph id={id} />
                    <span className="mt-1 text-sm font-medium">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div ref={resultRef} className="scroll-mt-28">
        {stage.status === "idle" ? (
          <div className="border-2 border-ink bg-card p-5">
            <h2 className="font-serif text-3xl">Nothing in front of you yet.</h2>
            <p className="mt-2 text-sm leading-6">
              Try the greasy pizza box. Then change the city. The bin moves, and the climate line
              stays blank on purpose, because WARM has no composting factor for cardboard.
            </p>
          </div>
        ) : null}
        {stage.status === "reading" ? (
          <p className="border-2 border-ink bg-card p-5 text-base" role="status">
            {stage.message}
          </p>
        ) : null}
        {stage.status === "error" ? (
          <div className="border-2 border-primary bg-card p-5" role="alert">
            <h2 className="font-serif text-2xl">That did not resolve.</h2>
            <p className="mt-2 text-sm leading-6">{stage.message}</p>
          </div>
        ) : null}
        {stage.status === "ready" && stage.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stage.previewUrl}
            alt="The photo you added. It stays in this browser."
            className="mb-3 max-h-56 w-full border-2 border-ink object-contain bg-card"
          />
        ) : null}
        {readyResult ? (
          <ResultCard
            localityId={localityId}
            result={readyResult}
            confirmedId={confirmedId}
            method={method}
            decision={decision}
            gramsText={gramsText}
            logged={logged}
            guidance={modelText ?? localGuidance}
            modelState={modelState}
            ready={ready}
            storageError={storageError}
            onConfirm={confirm}
            onDecision={(next) => {
              setDecision(next);
              setLogged(false);
              setModelText(null);
              setModelState("checking");
            }}
            onGrams={(value) => {
              setGramsText(value);
              setLogged(false);
            }}
            onLog={logDecision}
          />
        ) : null}
      </div>
    </div>
  );
}
