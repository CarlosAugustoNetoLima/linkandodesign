const HOSTS = new Set([
  "linkandodesign.com",
  "www.linkandodesign.com",
  "linkandodesign.vercel.app",
  "localhost",
  "127.0.0.1",
]);

export function allowedOrigin(req: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return HOSTS.has(new URL(origin).hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function oversized(req: Request, max = 32_000): boolean {
  const length = Number(req.headers.get("content-length") ?? 0);
  return Number.isFinite(length) && length > max;
}
