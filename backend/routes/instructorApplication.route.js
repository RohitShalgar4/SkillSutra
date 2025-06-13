import express from 'express';
import { 
  submitApplication, 
  checkApplicationStatus, 
  confirmApplication 
} from '../controllers/instructorApplication.controller.js';
import isAuthenticated  from '../middleware/isAutheticated.js';

const router = express.Router();

// Public routes
router.get('/request-to-be-instructor', checkApplicationStatus);
router.post('/request-to-be-instructor/confirm', confirmApplication);

// Protected routes
router.post('/request-to-be-instructor', isAuthenticated, submitApplication);

export default router; 