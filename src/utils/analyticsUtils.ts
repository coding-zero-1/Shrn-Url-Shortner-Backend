import type { Request } from "express";
import maxmind, { type CountryResponse } from "maxmind";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";

const geoLookup = await maxmind.open<CountryResponse>("GeoLite2-Country.mmdb");

export function getCountry(ip: string | null): string {
  if (typeof ip !== "string") {
    return "UN"; // UN = Unknown
  }
  const res = geoLookup.get(ip);
  return res?.country?.iso_code ?? "UN"; // UN = Unknown
}

export function getClientIp(req: Request): string | null {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string") {
    return xForwardedFor.split(",")[0]?.trim() ?? null;
  }
  return req.socket?.remoteAddress ?? null;
}

export function hashIp(ip: string | null): string {
  if (typeof ip !== "string") {
    return "";
  }
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export function parseUserAgent(userAgent?: string) {
  const parser = new UAParser(userAgent);

  const browser = parser.getBrowser().name ?? "Unknown";
  const deviceType = parser.getDevice().type ?? "desktop";

  return {
    browser,
    device: deviceType,
  };
}