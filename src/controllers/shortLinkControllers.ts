import type { Request, Response } from "express";
import { generateShortLinkSchema } from "../types/types";
import db from "../utils/prismaClient";
import createRandomString from "../utils/createRandomString";

export const generateShortLinkController = async (
  req: Request,
  res: Response,
) => {
  const body = req.body;
  const parsedBody = generateShortLinkSchema.safeParse(body);
  const userEmail = req.userEmail;
  if (!parsedBody.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: parsedBody.error.message,
      msg: "Invalid request body",
    });
    return;
  }
  try {
    const user = await db.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    if (!user) {
      res.status(401).json({
        success: false,
        data: null,
        error: "User not found",
        msg: "Unauthorized",
      });
      return;
    }
    const existingLink = await db.shortUrl.findFirst({
      where: {
        originalUrl: parsedBody.data.originalUrl,
        userId: user.id,
      },
    });
    if (existingLink && existingLink.isActive === false) {
      const reactivatedLink = await db.shortUrl.update({
        where: {
          id: existingLink.id,
        },
        data: {
          isActive: true,
          expiresAt: parsedBody.data.expiresAt,
        },
      });
      res.status(200).json({
        success: true,
        data: reactivatedLink,
        error: null,
        msg: "Short link reactivated successfully",
      });
      return;
    }
    if (existingLink) {
      res.status(200).json({
        success: true,
        data: existingLink,
        error: null,
        msg: "Short link already exists",
      });
      return;
    }
    const shortCode = createRandomString(8);
    const shortLink = await db.shortUrl.create({
      data: {
        originalUrl: parsedBody.data.originalUrl,
        expiresAt: parsedBody.data.expiresAt,
        userId: user.id,
        shortCode: shortCode,
      },
    });
    res.status(201).json({
      success: true,
      data: shortLink,
      error: null,
      msg: "Short link generated successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Error generating short link",
      msg: "Internal server error",
    });
    return;
  }
};

export const getAllShortLinksController = async (
  req: Request,
  res: Response,
) => {
  const userEmail = req.userEmail;
  try {
    const user = await db.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    if (!user) {
      res.status(401).json({
        success: false,
        data: null,
        error: "User not found",
        msg: "Unauthorized",
      });
      return;
    }
    const links = await db.shortUrl.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
    });
    if (!links) {
      res.status(404).json({
        success: false,
        data: null,
        error: "Not found",
        msg: "No short links found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: links,
      error: null,
      msg: "Short links retrieved successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Error retrieving short links",
      msg: "Internal server error",
    });
    return;
  }
};

export const getSingleShortLinkController = async (
  req: Request,
  res: Response,
) => {
  const shortLinkId = req.params.shortLinkId as string;
  if (
    !shortLinkId ||
    shortLinkId.trim() === "" ||
    typeof shortLinkId !== "string"
  ) {
    res.status(400).json({
      success: false,
      data: null,
      error: "Missing short link ID",
      msg: "Bad request",
    });
    return;
  }
  try {
    const shortLink = await db.shortUrl.findUnique({
      where: {
        id: shortLinkId,
      },
    });
    if (!shortLink) {
      res.status(404).json({
        success: false,
        data: null,
        error: "Short link not found",
        msg: "Not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: shortLink,
      error: null,
      msg: "Short link retrieved successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Error retrieving short link",
      msg: "Internal server error",
    });
    return;
  }
};

export const deleteShortLinkController = async (
  req: Request,
  res: Response,
) => {
  const shortLinkId = req.params.shortLinkId as string;
  if (
    !shortLinkId ||
    shortLinkId.trim() === "" ||
    typeof shortLinkId !== "string"
  ) {
    res.status(400).json({
      success: false,
      data: null,
      error: "Missing short link ID",
      msg: "Bad request",
    });
    return;
  }
  try {
    const shortLink = await db.shortUrl.update({
      where: {
        id: shortLinkId,
      },
      data: {
        isActive: false,
      },
    });
    res.status(200).json({
      success: true,
      data: shortLink,
      error: null,
      msg: "Short link deleted successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Error deleting short link",
      msg: "Internal server error",
    });
    return;
  }
};

export const updateShortLinkController = async (
  req: Request,
  res: Response,
) => {
  const shortLinkId = req.params.shortLinkId as string;
  const { originalUrl, isActive, expiresAt } = req.body;
  if (
    !shortLinkId ||
    shortLinkId.trim() === "" ||
    typeof shortLinkId !== "string"
  ) {
    res.status(400).json({
      success: false,
      data: null,
      error: "Missing short link ID",
      msg: "Bad request",
    });
    return;
  }
  try {
    const shortLink = await db.shortUrl.update({
      where: {
        id: shortLinkId,
      },
      data: {
        expiresAt: expiresAt,
      },
    });
    if (!shortLink) {
      res.status(404).json({
        success: false,
        data: null,
        error: "Short link not found",
        msg: "Not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: shortLink,
      error: null,
      msg: "Short link deleted successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Error deleting short link",
      msg: "Internal server error",
    });
    return;
  }
};

export const getShortLinkAnalyticsController = async (
  req: Request,
  res: Response,
) => {
  const shortLinkId = req.params.shortLinkId as string;
  if (
    !shortLinkId ||
    shortLinkId.trim() === "" ||
    typeof shortLinkId !== "string"
  ) {
    res.status(400).json({
      success: false,
      data: null,
      error: "Missing short link ID",
      msg: "Bad request",
    });
    return;
  }
  try {
    const user = await db.user.findUnique({
      where: { email: req.userEmail },
    });
    if (!user) {
      res.status(401).json({
        success: false,
        data: null,
        error: "User not found",
        msg: "Unauthorized",
      });
      return;
    }
    const totalClicks = await db.redirectLog.count({
      where: { shortUrlId: shortLinkId },
    });
    const clicksByCountry = await db.redirectLog.groupBy({
      by: ["country"],
      where: { shortUrlId: shortLinkId },
      _count: { country: true },
    });
    const clicksByBrowser = await db.redirectLog.groupBy({
      by: ["browser"],
      where: { shortUrlId: shortLinkId },
      _count: { browser: true },
    });
    const clicksByDevice = await db.redirectLog.groupBy({
      by: ["device"],
      where: { shortUrlId: shortLinkId },
      _count: { device: true },
    });
    const analytics = {
      totalClicks,
      clicksByCountry: clicksByCountry.map((item) => ({
        country: item.country,
        count: item._count.country,
      })),
      clicksByBrowser: clicksByBrowser.map((item) => ({
        browser: item.browser,
        count: item._count.browser,
      })),
      clicksByDevice: clicksByDevice.map((item) => ({
        device: item.device,
        count: item._count.device,
      })),
    };
    res.status(200).json({
      success: true,
      data: analytics,
      error: null,
      msg: "Analytics retrieved successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: "Error retrieving analytics",
      msg: "Internal server error",
    });
    return;
  }
};