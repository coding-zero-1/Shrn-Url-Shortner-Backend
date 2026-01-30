import { z } from "zod";

export const signUpBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(20),
  username: z.string().min(3).max(25),
});
export const signinBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(20),
});
export const verificationBodySchema = z.object({
  token: z.string().min(3).max(10),
});
export const generateShortLinkSchema = z.object({
  originalUrl: z.url(),
  expiresAt: z.date().optional()
});

export type SignUpBody = z.infer<typeof signUpBodySchema>;
export type LoginBody = z.infer<typeof signinBodySchema>;