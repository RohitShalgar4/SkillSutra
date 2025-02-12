// routes/certificate.route.js
import express from "express";
import { generateCertificate } from "../controllers/certificate.controller.js";
import isAuthenticated from "../middleware/isAutheticated.js";

const router = express.Router();

router.post("/:courseId/generate", isAuthenticated, generateCertificate);

export default router;