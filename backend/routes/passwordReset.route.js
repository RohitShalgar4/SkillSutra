import express from "express";
import {
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} from "../controllers/passwordReset.controller.js";

const router = express.Router();

router.post("/request", requestPasswordReset);
router.get("/verify/:token", verifyResetToken);
router.post("/reset/:token", resetPassword);

export default router; 