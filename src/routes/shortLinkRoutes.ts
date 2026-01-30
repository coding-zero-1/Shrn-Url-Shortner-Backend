import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { deleteShortLinkController, generateShortLinkController, getAllShortLinksController, getSingleShortLinkController, updateShortLinkController } from "../controllers/shortLinkControllers";

const shortLinkRouter = Router();

shortLinkRouter.post("/generateShortLink",authMiddleware,generateShortLinkController);
shortLinkRouter.get("/getAllShortLinks",authMiddleware,getAllShortLinksController);
shortLinkRouter.get("/getSingleShortLink/:shortLinkId",authMiddleware,getSingleShortLinkController);
shortLinkRouter.delete("/deleteShortLink/:shortLinkId",authMiddleware,deleteShortLinkController);
shortLinkRouter.patch("/updateShortLink/:shortLinkId",authMiddleware,updateShortLinkController);

export default shortLinkRouter;