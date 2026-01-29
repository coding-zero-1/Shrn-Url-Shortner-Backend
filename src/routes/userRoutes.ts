import { Router } from "express";
import {
  signInController,
  signUpController,
  verificationController,
} from "../controllers/userControllers";
import authMiddleware from "../middleware/authMiddleware";

const userRouter = Router();

userRouter.post("/signup", signUpController);

userRouter.post("/signin", signInController);

userRouter.post("/verification", authMiddleware, verificationController);

export default userRouter;
