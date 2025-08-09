import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '@/controllers/userController';
import { authenticate, adminOnly } from '@/middleware/auth';
import { userValidation, commonValidations, handleValidationErrors } from '@/middleware/validation';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

router.get('/', getUsers);
router.get('/:id', commonValidations.id, handleValidationErrors, getUser);
router.post('/', userValidation.create, handleValidationErrors, createUser);
router.put('/:id', commonValidations.id, userValidation.update, handleValidationErrors, updateUser);
router.delete('/:id', commonValidations.id, handleValidationErrors, deleteUser);

export default router;
