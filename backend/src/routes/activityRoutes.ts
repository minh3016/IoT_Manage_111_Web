import { Router } from 'express';
import {
  getActivities,
  getActivity,
  getActivityStatistics,
  getRecentActivities,
  cleanupOldActivities,
} from '@/controllers/activityController';
import { authenticate, adminOnly } from '@/middleware/auth';
import { activityValidation, commonValidations, handleValidationErrors } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public activity routes (all authenticated users)
router.get('/', activityValidation.filters, handleValidationErrors, getActivities);
router.get('/statistics', getActivityStatistics);
router.get('/recent', getRecentActivities);
router.get('/:id', commonValidations.id, handleValidationErrors, getActivity);

// Admin only routes
router.post('/cleanup', adminOnly, cleanupOldActivities);

export default router;
