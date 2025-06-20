import express from "express";
import {
  createCheckoutSession,
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  stripeWebhook,
  checkAndUpdatePurchaseStatus,
} from "../controllers/coursePurchase.controller.js";
import isAuthenticated from "../middleware/isAutheticated.js";

const router = express.Router();

router
  .route("/checkout/create-checkout-session")
  .post(isAuthenticated, createCheckoutSession);
router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), stripeWebhook);
router
  .route("/course/:courseId/detail-with-status")
  .get(isAuthenticated, getCourseDetailWithPurchaseStatus);
router
  .route("/course/:courseId/check-status")
  .post(isAuthenticated, checkAndUpdatePurchaseStatus);
router.route("/").get(isAuthenticated, getAllPurchasedCourse);

export default router;
