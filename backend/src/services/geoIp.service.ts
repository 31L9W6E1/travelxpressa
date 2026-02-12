import type { Request } from 'express';

export type GeoIpResult = {
  countryCode?: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
};

type CacheEntry = {
  expiresAt: number;
  value: GeoIpResult;
};

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const stripIpPrefix = (ip: string): string => ip.replace(/^::ffff:/, '').trim();

const isPrivateIpv4 = (ip: string): boolean => {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((p) => !Number.isFinite(p) || p < 0 || p > 255)) return true;

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
};

const isPrivateIp = (rawIp: string): boolean => {
  const ip = stripIpPrefix(rawIp);
  if (!ip) return true;
  if (ip === '::1') return true;
  if (ip.startsWith('fe80:')) return true; // IPv6 link-local
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true; // IPv6 ULA
  if (ip.includes('.')) return isPrivateIpv4(ip);
  // Unknown IPv6 ranges: treat as public if not clearly local.
  return false;
};

export function getClientIp(req: Request): string | null {
  const xff = req.headers['x-forwarded-for'];
  const rawFromHeader =
    typeof xff === 'string' ? xff.split(',')[0]?.trim() : Array.isArray(xff) ? xff[0]?.trim() : undefined;

  const raw = rawFromHeader || req.ip || req.socket.remoteAddress;
  if (!raw) return null;
  const cleaned = stripIpPrefix(raw);
  return cleaned || null;
}

export function extractGeoFromHeaders(req: Request): GeoIpResult | null {
  // Support multiple proxy providers. If present, these are faster and more reliable than external lookups.
  const vercelCountry = (req.headers['x-vercel-ip-country'] as string | undefined)?.trim();
  const vercelRegion = (req.headers['x-vercel-ip-country-region'] as string | undefined)?.trim();
  const vercelCity = (req.headers['x-vercel-ip-city'] as string | undefined)?.trim();
  const vercelTz = (req.headers['x-vercel-ip-timezone'] as string | undefined)?.trim();

  const countryCode = vercelCountry || undefined;
  const region = vercelRegion || undefined;
  const city = vercelCity || undefined;
  const timezone = vercelTz || undefined;

  if (!countryCode && !region && !city && !timezone) return null;
  return { countryCode, region, city, timezone };
}

async function lookupGeoWithIpApi(ip: string): Promise<GeoIpResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!res.ok) return null;

    const json = (await res.json()) as any;
    if (!json || json.error) return null;

    const countryCode = typeof json.country_code === 'string' ? json.country_code : undefined;
    const country = typeof json.country_name === 'string' ? json.country_name : undefined;
    const region = typeof json.region === 'string' ? json.region : undefined;
    const city = typeof json.city === 'string' ? json.city : undefined;
    const timezone = typeof json.timezone === 'string' ? json.timezone : undefined;

    if (!countryCode && !country && !region && !city && !timezone) return null;
    return { countryCode, country, region, city, timezone };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function resolveGeoForRequest(req: Request): Promise<GeoIpResult | null> {
  const fromHeaders = extractGeoFromHeaders(req);
  if (fromHeaders) return fromHeaders;

  const ip = getClientIp(req);
  if (!ip) return null;
  if (isPrivateIp(ip)) return null;

  const cached = cache.get(ip);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;

  const value = (await lookupGeoWithIpApi(ip)) || {};
  cache.set(ip, { value, expiresAt: now + CACHE_TTL_MS });
  return Object.keys(value).length ? value : null;
}

