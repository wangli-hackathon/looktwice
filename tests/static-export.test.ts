import { afterEach, describe, expect, it, vi } from "vitest";

describe("static-export helpers", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("reports a static demo when NEXT_PUBLIC_STATIC_EXPORT is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_STATIC_EXPORT", "1");
    const mod = await import("@/lib/static-export");
    expect(mod.isStaticExport).toBe(true);
  });

  it("prefixes paths with NEXT_PUBLIC_BASE_PATH", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/looktwice");
    vi.stubEnv("NEXT_PUBLIC_STATIC_EXPORT", "1");
    const { withBasePath } = await import("@/lib/static-export");
    expect(withBasePath("/api/enhance")).toBe("/looktwice/api/enhance");
    expect(withBasePath("method")).toBe("/looktwice/method");
  });

  it("leaves paths alone when there is no base path", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    const { withBasePath, isStaticExport } = await import("@/lib/static-export");
    expect(isStaticExport).toBe(false);
    expect(withBasePath("/api/enhance")).toBe("/api/enhance");
  });
});
