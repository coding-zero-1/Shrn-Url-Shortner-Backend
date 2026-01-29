import type { Request, Response } from "express";
import {
  signinBodySchema,
  signUpBodySchema,
  verificationBodySchema,
} from "../types/types";
import db from "../utils/prismaClient";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// verification flow to be added later, sending email should be done in this controller
export const signUpController = async (req: Request, res: Response) => {
  const body = req.body;
  const parsedBody = signUpBodySchema.safeParse(body);
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
    const hashedPassword = bcrypt.hashSync(parsedBody.data.password, 8);
    await db.user.create({
      data: {
        email: parsedBody.data.email,
        hashedPassword: hashedPassword,
        name: parsedBody.data.username,
      },
    });
    res.status(201).json({
      success: true,
      data: null,
      error: null,
      msg: "User created successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: error,
      msg: "Internal server error",
    });
    return;
  }
};

export const signInController = async (req: Request, res: Response) => {
  const body = req.body;
  const parsedBody = signinBodySchema.safeParse(body);
  if (!parsedBody.success) {
    res.status(401).json({
      success: false,
      data: null,
      error: parsedBody.error.message,
      msg: "Invalid request body",
    });
    return;
  }
  const token = jwt.sign(
    {
      email: parsedBody.data.email,
    },
    process.env.JWT_SECRET!,
  );

  res.status(200).json({
    success: true,
    data: token,
    error: null,
    msg: "SignedIn successfully",
  });
  return;
};

// yet to be implemented
export const verificationController = async (req: Request, res: Response) => {
  const body = req.body;
  const parsedBody = verificationBodySchema.safeParse(body);
  if (!parsedBody.success) {
    res.status(401).json({
      success: false,
      error: parsedBody.error.message,
      data: null,
      msg: "Invalid request body",
    });
    return;
  }
  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
      data: null,
      msg: "Internal server error, please try again later!",
    });
  }
};