import express from "express";
import isAuthenticated from "../middleware/isAutheticated.js";
import { createCourse } from "../controllers/course.controller.js";
const router = express.Router();

router.route("/").post(isAuthenticated,createCourse);


export default router;
