/** True when the GitHub Pages static demo was built with STATIC_EXPORT=1. */
export const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

/**
 * Prefix a same-origin path with the Next.js basePath when one is baked in.
 * next/link does this automatically; raw fetch() does not.
 */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}
