// routes/certificate.route.js
import express from "express";
import { generateCertificate, validateCertificate } from "../controllers/certificate.controller.js";
import isAuthenticated from "../middleware/isAutheticated.js";

const router = express.Router();

router.post("/:courseId/generate", isAuthenticated, generateCertificate);
router.get("/validate/:certificateNumber", validateCertificate);

export default router;