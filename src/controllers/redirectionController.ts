import type { Request, Response } from "express";
import db from "../utils/prismaClient";
import {
  getClientIp,
  getCountry,
  hashIp,
  parseUserAgent,
} from "../utils/analyticsUtils";
import { get, set } from "../utils/redis";

export const redirectionController = async (req: Request, res: Response) => {
  const { shortCode } = req.params as { shortCode: string };
  if (!shortCode) {
    return res.status(400).json({
      success: false,
      data: null,
      error: "Bad Request",
      msg: "Short code is required",
    });
  }
  const start = process.hrtime.bigint();
  try {
    const cacheKey = `link:${shortCode}`;
    let linkId: string;
    let url: string;

    // Try Redis cache first
    const cachedLink = await get<{ id: string; url: string }>(cacheKey);

    if (cachedLink) {
      linkId = cachedLink.id;
      url = cachedLink.url;
    } else {
      // DB query on cache miss
      const shortLink = await db.shortUrl.findUnique({
        where: {
          shortCode,
          isActive: true,
        },
        select: {
          id: true,
          originalUrl: true,
          expiresAt: true,
        },
      });

      if (!shortLink) {
        return res.status(404).json({
          success: false,
          data: null,
          error: "Not Found",
          msg: "Short link not found",
        });
      }

      if (shortLink.expiresAt && new Date(shortLink.expiresAt) < new Date()) {
        return res.status(410).json({
          success: false,
          data: null,
          error: "Gone",
          msg: "This short link has expired",
        });
      }

      linkId = shortLink.id;
      url = shortLink.originalUrl;

      set(cacheKey, { id: linkId, url }, 24 * 60 * 60).catch(() => {});
    }
    res.redirect(302, url);
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;

    console.log(`Redirection processing time: ${durationMs.toFixed(2)} ms`);
    // Fire-and-forget analytics logging (non-blocking)
    setImmediate(() => {
      const ip = getClientIp(req);
      const hashedIp = hashIp(ip);
      const country = getCountry(ip);
      const browserData = parseUserAgent(req.headers["user-agent"]);

      db.redirectLog
        .create({
          data: {
            shortUrlId: linkId,
            ipHash: hashedIp,
            country: country,
            browser: browserData.browser,
            device: browserData.device,
          },
        })
        .catch((error) => {
          console.error("Failed to log redirect analytics:", error);
        });
    });
  } catch (error) {
    console.error("Redirection error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "Internal Server Error",
      msg: "An error occurred while processing the request",
    });
  }
};
