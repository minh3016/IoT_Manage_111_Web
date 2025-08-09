import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '@/config/logger';
import { config } from '@/config';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Prisma errors
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      const fieldName = field ? field[0] : 'field';
      return new AppError(`${fieldName} already exists`, 409);
    
    case 'P2025':
      // Record not found
      return new AppError('Record not found', 404);
    
    case 'P2003':
      // Foreign key constraint violation
      return new AppError('Related record not found', 400);
    
    case 'P2014':
      // Invalid ID
      return new AppError('Invalid ID provided', 400);
    
    case 'P2021':
      // Table does not exist
      return new AppError('Database table not found', 500, false);
    
    case 'P2022':
      // Column does not exist
      return new AppError('Database column not found', 500, false);
    
    default:
      logger.error('Unhandled Prisma error', { code: error.code, message: error.message });
      return new AppError('Database operation failed', 500, false);
  }
};

// Handle validation errors
const handleValidationError = (error: any): AppError => {
  const message = error.details ? error.details.map((detail: any) => detail.message).join(', ') : error.message;
  return new AppError(`Validation error: ${message}`, 400);
};

// Handle JWT errors
const handleJWTError = (): AppError => {
  return new AppError('Invalid token', 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Token expired', 401);
};

// Send error response in development
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
    },
  });
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unexpected error', err);
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

// Global error handling middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId,
  });

  // Handle specific error types
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new AppError('Invalid data provided', 400);
  } else if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (err.name === 'CastError') {
    error = new AppError('Invalid ID format', 400);
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 409);
  } else if (!err.statusCode) {
    // If no status code is set, it's an unexpected error
    error = new AppError(err.message || 'Internal server error', 500, false);
  }

  // Send error response
  if (config.server.nodeEnv === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Handle unhandled promise rejections
export const handleUnhandledRejection = (reason: any, promise: Promise<any>): void => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason.message || reason,
    stack: reason.stack,
  });
  
  // Close server gracefully
  process.exit(1);
};

// Handle uncaught exceptions
export const handleUncaughtException = (error: Error): void => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack,
  });
  
  // Close server gracefully
  process.exit(1);
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Rate limit error handler
export const rateLimitHandler = (req: Request, res: Response): void => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId,
  });

  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later',
  });
};

// CORS error handler
export const corsErrorHandler = (req: Request, res: Response): void => {
  logger.warn('CORS error', {
    origin: req.get('Origin'),
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(403).json({
    success: false,
    message: 'CORS policy violation',
  });
};

// Request timeout handler
export const timeoutHandler = (req: Request, res: Response): void => {
  logger.warn('Request timeout', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId,
  });

  res.status(408).json({
    success: false,
    message: 'Request timeout',
  });
};

// Payload too large handler
export const payloadTooLargeHandler = (req: Request, res: Response): void => {
  logger.warn('Payload too large', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    contentLength: req.get('Content-Length'),
    userId: req.user?.userId,
  });

  res.status(413).json({
    success: false,
    message: 'Payload too large',
  });
};

// Create error response helper
export const createErrorResponse = (message: string, statusCode: number = 500, errors?: any[]) => {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
};

// Create success response helper
export const createSuccessResponse = (data?: any, message?: string) => {
  return {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
  };
};

// AppError already exported above
