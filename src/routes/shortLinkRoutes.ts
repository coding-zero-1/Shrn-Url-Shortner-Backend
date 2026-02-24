import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { deleteShortLinkController, generateShortLinkController, getAllShortLinksController, getShortLinkAnalyticsController, getSingleShortLinkController, updateShortLinkController } from "../controllers/shortLinkControllers";
import { rateLimit } from "../middleware/rateLimitMiddleware";

const shortLinkRouter = Router();

const generateLimit = rateLimit(10, 3600, (req: any) => req.userId);
const crudLimit = rateLimit(30, 60, (req: any) => req.userId);
const analyticsLimit = rateLimit(20, 60, (req: any) => req.userId);

shortLinkRouter.post("/generateShortLink", authMiddleware, generateLimit, generateShortLinkController);
shortLinkRouter.get("/getAllShortLinks", authMiddleware, crudLimit, getAllShortLinksController);
shortLinkRouter.get("/getSingleShortLink/:shortLinkId", authMiddleware, crudLimit, getSingleShortLinkController);
shortLinkRouter.delete("/deleteShortLink/:shortLinkId", authMiddleware, crudLimit, deleteShortLinkController);
shortLinkRouter.patch("/updateShortLink/:shortLinkId", authMiddleware, crudLimit, updateShortLinkController);
shortLinkRouter.get("/getShortLinkAnalytics/:shortLinkId", authMiddleware, analyticsLimit, getShortLinkAnalyticsController);

export default shortLinkRouter;