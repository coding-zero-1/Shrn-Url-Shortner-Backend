import { Router } from "express";
import {
  signInController,
  signUpController,
  verificationController,
} from "../controllers/userControllers";
import authMiddleware from "../middleware/authMiddleware";
import { rateLimit } from "../middleware/rateLimitMiddleware";

const userRouter = Router();

const authRateLimit = rateLimit(5, 60);

userRouter.post("/signup", authRateLimit, signUpController);

userRouter.post("/signin", authRateLimit, signInController);

userRouter.post("/verification", authMiddleware, verificationController);

export default userRouter;
