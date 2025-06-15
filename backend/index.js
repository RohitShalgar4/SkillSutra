import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import certificateRouter from "./routes/certificate.route.js";
import chatRoutes from "./routes/chat.routes.js";
import instructorApplicationRoute from "./routes/instructorApplication.route.js";
import passwordResetRoute from "./routes/passwordReset.route.js";

dotenv.config({});
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// Configure CORS with explicit settings
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// API
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/certificates", certificateRouter);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/instructor-application", instructorApplicationRoute);
app.use("/api/v1/password-reset", passwordResetRoute);

app.listen(PORT, () => {
  console.log(`Server listen at port ${PORT}`);
});
