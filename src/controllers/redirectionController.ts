import type { Request, Response } from "express";
import db from "../utils/prismaClient";
import {
  getClientIp,
  getCountry,
  hashIp,
  parseUserAgent,
} from "../utils/analyticsUtils";

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
  try {
    const shortLink = await db.shortUrl.findUnique({
      where: { shortCode },
    });
    if (!shortLink) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "Not Found",
        msg: "Short link not found",
      });
    }
    res.status(302).redirect(shortLink.originalUrl);
    const ip = getClientIp(req);
    const hashedIp = hashIp(ip);
    const country = getCountry(ip);
    const browserData = parseUserAgent(req.headers["user-agent"]);
    await db.redirectLog.create({
      data: {
        shortUrlId: shortLink.id,
        ipHash: hashedIp,
        country: country,
        browser: browserData.browser,
        device: browserData.device,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: "Internal Server Error",
      msg: "An error occurred while processing the request",
    });
  }
};