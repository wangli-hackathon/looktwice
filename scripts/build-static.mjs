#!/usr/bin/env node
/**
 * Static GitHub Pages build.
 * Parks app/api (POST /api/enhance needs a server) for the duration of
 * `next build` with STATIC_EXPORT=1, then restores it.
 */
import { mkdir, rename, rm, access } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "app", "api");
const stashDir = path.join(root, ".static-stash", "api");
const stashParent = path.join(root, ".static-stash");

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function stashApi() {
  if (!(await exists(apiDir))) return false;
  await rm(stashParent, { recursive: true, force: true });
  await mkdir(stashParent, { recursive: true });
  await rename(apiDir, stashDir);
  return true;
}

async function restoreApi(didStash) {
  if (!didStash) return;
  if (await exists(apiDir)) {
    await rm(apiDir, { recursive: true, force: true });
  }
  if (await exists(stashDir)) {
    await rename(stashDir, apiDir);
  }
  await rm(stashParent, { recursive: true, force: true });
}

function runBuild() {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      STATIC_EXPORT: "1",
      NEXT_PUBLIC_STATIC_EXPORT: "1",
      NEXT_PUBLIC_BASE_PATH: "/looktwice",
    };
    const child = spawn("npx", ["next", "build"], {
      cwd: root,
      env,
      stdio: "inherit",
      shell: false,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`next build exited with code ${code}`));
    });
  });
}

let didStash = false;
try {
  didStash = await stashApi();
  await runBuild();
} finally {
  await restoreApi(didStash);
}
