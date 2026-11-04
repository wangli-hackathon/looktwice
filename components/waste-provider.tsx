"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  CITY_KEY,
  LOG_KEY,
  loadCity,
  loadLog,
  saveCity,
  saveLog,
  type LogEntry,
} from "@/lib/log";
import { isLocalityId } from "@/lib/localities";
import type { LocalityId } from "@/lib/types";

interface WasteContextValue {
  ready: boolean;
  localityId: LocalityId;
  setLocalityId: (id: LocalityId) => void;
  entries: LogEntry[];
  addEntries: (incoming: LogEntry[]) => void;
  removeEntry: (id: string) => void;
  clearEntries: () => void;
  storageError: string | null;
}

const WasteContext = createContext<WasteContextValue | null>(null);
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === LOG_KEY || event.key === CITY_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function emptySubscribe() {
  return () => {};
}

function logSnapshot() {
  return localStorage.getItem(LOG_KEY) ?? "";
}

function citySnapshot(): LocalityId {
  const stored = loadCity(localStorage);
  return stored && isLocalityId(stored) ? stored : "sf";
}

export function WasteProvider({ children }: { children: ReactNode }) {
  const [storageError, setStorageError] = useState<string | null>(null);
  const ready = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const rawLog = useSyncExternalStore(subscribe, logSnapshot, () => "");
  const localityId = useSyncExternalStore(subscribe, citySnapshot, () => "sf" as const);
  const entries = rawLog ? loadLog({ getItem: () => rawLog }) : [];

  const value: WasteContextValue = {
    ready,
    localityId,
    setLocalityId: (id) => {
      try {
        saveCity(localStorage, id);
        setStorageError(null);
        emit();
      } catch {
        setStorageError("The city choice could not be saved in this browser.");
      }
    },
    entries,
    addEntries: (incoming) => {
      if (incoming.length === 0) return;
      try {
        saveLog(localStorage, [...incoming, ...loadLog(localStorage)]);
        setStorageError(null);
        emit();
      } catch {
        setStorageError(
          "This browser refused to store the log. The decision is on screen and may not survive a refresh.",
        );
      }
    },
    removeEntry: (id) => {
      try {
        saveLog(
          localStorage,
          loadLog(localStorage).filter((entry) => entry.id !== id),
        );
        setStorageError(null);
        emit();
      } catch {
        setStorageError("This browser refused to update the log.");
      }
    },
    clearEntries: () => {
      try {
        saveLog(localStorage, []);
        setStorageError(null);
        emit();
      } catch {
        setStorageError("This browser refused to clear the log.");
      }
    },
    storageError,
  };

  return <WasteContext.Provider value={value}>{children}</WasteContext.Provider>;
}

export function useWaste(): WasteContextValue {
  const value = useContext(WasteContext);
  if (!value) throw new Error("useWaste must be used inside WasteProvider");
  return value;
}
