import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import shortLinkRouter from "./routes/shortLinkRoutes";
import authMiddleware from "./middleware/authMiddleware";
import { redirectionController } from "./controllers/redirectionController";

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/v1/user", userRouter);
app.use("/re/:shortCode",redirectionController)
app.use("/v1/shortLink", authMiddleware, shortLinkRouter);

app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});