import { Router } from 'express';
import {
  getDevices,
  getDeviceStatistics,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceSensorData,
} from '@/controllers/deviceController';
import { authenticate, adminOrTechnician } from '@/middleware/auth';
import { deviceValidation, commonValidations, handleValidationErrors } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public device routes (all authenticated users)
router.get('/', deviceValidation.filters, handleValidationErrors, getDevices);
router.get('/statistics', getDeviceStatistics);
router.get('/:id', commonValidations.id, handleValidationErrors, getDevice);
router.get('/:id/sensor-data', commonValidations.id, handleValidationErrors, getDeviceSensorData);

// Protected device routes (admin and technician only)
router.post('/', adminOrTechnician, deviceValidation.create, handleValidationErrors, createDevice);
router.put('/:id', adminOrTechnician, commonValidations.id, deviceValidation.update, handleValidationErrors, updateDevice);
router.delete('/:id', adminOrTechnician, commonValidations.id, handleValidationErrors, deleteDevice);

export default router;
