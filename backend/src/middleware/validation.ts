import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { UserRole, DeviceStatus, ActivityType, ActivitySeverity } from '@/types';

// Handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined,
      })),
    });
    return;
  }
  
  next();
};

// Common validation rules
export const commonValidations = {
  id: param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
    query('sortBy').optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage('Sort by must be a valid field name'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  ],

  search: query('search').optional().isString().trim().isLength({ max: 100 }).withMessage('Search term must be less than 100 characters'),
};

// Authentication validation rules
export const authValidation = {
  login: [
    body('username')
      .isString()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('password')
      .isString()
      .isLength({ min: 6, max: 100 })
      .withMessage('Password must be between 6 and 100 characters'),
  ],

  changePassword: [
    body('currentPassword')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isString()
      .isLength({ min: 6, max: 100 })
      .withMessage('New password must be between 6 and 100 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  ],
};

// User validation rules
export const userValidation = {
  create: [
    body('username')
      .isString()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    
    body('password')
      .isString()
      .isLength({ min: 6, max: 100 })
      .withMessage('Password must be between 6 and 100 characters'),
    
    body('role')
      .optional()
      .isIn(Object.values(UserRole))
      .withMessage(`Role must be one of: ${Object.values(UserRole).join(', ')}`),
    
    body('firstName')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('First name must be less than 50 characters'),
    
    body('lastName')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Last name must be less than 50 characters'),
    
    body('phone')
      .optional()
      .isString()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Phone number must be a valid format'),
  ],

  update: [
    body('username')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    
    body('role')
      .optional()
      .isIn(Object.values(UserRole))
      .withMessage(`Role must be one of: ${Object.values(UserRole).join(', ')}`),
    
    body('firstName')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('First name must be less than 50 characters'),
    
    body('lastName')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Last name must be less than 50 characters'),
    
    body('phone')
      .optional()
      .isString()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Phone number must be a valid format'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
};

// Device validation rules
export const deviceValidation = {
  create: [
    body('deviceId')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device ID must be between 1 and 50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Device ID can only contain letters, numbers, hyphens, and underscores'),
    
    body('deviceName')
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Device name must be between 1 and 100 characters'),
    
    body('deviceType')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device type must be between 1 and 50 characters'),
    
    body('ownerName')
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Owner name must be between 1 and 100 characters'),
    
    body('phoneNumber')
      .optional()
      .isString()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Phone number must be a valid format'),
    
    body('installationDate')
      .isISO8601()
      .withMessage('Installation date must be a valid ISO 8601 date'),
    
    body('installationAddress')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Installation address must be less than 500 characters'),
    
    body('warrantyMonths')
      .isInt({ min: 0, max: 120 })
      .withMessage('Warranty months must be between 0 and 120'),
    
    body('locationLat')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    
    body('locationLng')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
  ],

  update: [
    body('deviceId')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device ID must be between 1 and 50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Device ID can only contain letters, numbers, hyphens, and underscores'),
    
    body('deviceName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Device name must be between 1 and 100 characters'),
    
    body('deviceType')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Device type must be between 1 and 50 characters'),
    
    body('status')
      .optional()
      .isIn(Object.values(DeviceStatus))
      .withMessage(`Status must be one of: ${Object.values(DeviceStatus).join(', ')}`),
    
    body('ownerName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Owner name must be between 1 and 100 characters'),
    
    body('phoneNumber')
      .optional()
      .isString()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Phone number must be a valid format'),
    
    body('installationDate')
      .optional()
      .isISO8601()
      .withMessage('Installation date must be a valid ISO 8601 date'),
    
    body('installationAddress')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Installation address must be less than 500 characters'),
    
    body('warrantyMonths')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('Warranty months must be between 0 and 120'),
    
    body('locationLat')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    
    body('locationLng')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
  ],

  filters: [
    query('status')
      .optional()
      .isIn(Object.values(DeviceStatus))
      .withMessage(`Status must be one of: ${Object.values(DeviceStatus).join(', ')}`),
    ...commonValidations.pagination,
    commonValidations.search,
  ],
};

// Activity validation rules
export const activityValidation = {
  filters: [
    query('severity')
      .optional()
      .isIn(Object.values(ActivitySeverity))
      .withMessage(`Severity must be one of: ${Object.values(ActivitySeverity).join(', ')}`),
    
    query('type')
      .optional()
      .isIn(Object.values(ActivityType))
      .withMessage(`Type must be one of: ${Object.values(ActivityType).join(', ')}`),
    
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    
    ...commonValidations.pagination,
    commonValidations.search,
  ],
};

// Report validation rules
export const reportValidation = {
  filters: [
    body('startDate')
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    body('endDate')
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    
    body('deviceIds')
      .optional()
      .isArray()
      .withMessage('Device IDs must be an array')
      .custom((value) => {
        if (Array.isArray(value)) {
          return value.every(id => Number.isInteger(id) && id > 0);
        }
        return false;
      })
      .withMessage('All device IDs must be positive integers'),
    
    body('reportType')
      .isIn(['temperature', 'performance', 'energy', 'maintenance'])
      .withMessage('Report type must be one of: temperature, performance, energy, maintenance'),
  ],
};

// Sensor data validation rules
export const sensorDataValidation = {
  create: [
    body('deviceId')
      .isInt({ min: 1 })
      .withMessage('Device ID must be a positive integer'),
    
    body('tempColdStorage')
      .optional()
      .isFloat({ min: -50, max: 50 })
      .withMessage('Cold storage temperature must be between -50 and 50 degrees'),
    
    body('tempEnvironment')
      .optional()
      .isFloat({ min: -50, max: 100 })
      .withMessage('Environment temperature must be between -50 and 100 degrees'),
    
    body('tempSolution')
      .optional()
      .isFloat({ min: -50, max: 100 })
      .withMessage('Solution temperature must be between -50 and 100 degrees'),
    
    body('pressureSuction')
      .optional()
      .isFloat({ min: 0, max: 50 })
      .withMessage('Suction pressure must be between 0 and 50 bar'),
    
    body('pressureDischarge')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Discharge pressure must be between 0 and 100 bar'),
    
    body('superheatCurrent')
      .optional()
      .isFloat({ min: 0, max: 50 })
      .withMessage('Superheat current must be between 0 and 50 degrees'),
    
    body('voltageA')
      .optional()
      .isFloat({ min: 0, max: 500 })
      .withMessage('Voltage A must be between 0 and 500 volts'),
    
    body('currentA')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Current A must be between 0 and 100 amperes'),
  ],
};
