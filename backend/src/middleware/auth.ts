import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { logger, logSecurityEvent } from '@/config/logger';
import { prisma } from '@/config/database';
import { JwtPayload, UserRole } from '@/types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Extract token from request headers
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies (for browser requests)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
};

// Verify JWT token
export const verifyToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as JwtPayload);
      }
    });
  });
};

// Generate JWT token
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload as any, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  } as any);
};

// Generate refresh token
export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload as any, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  } as any);
};

// Verify refresh token
export const verifyRefreshToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.refreshSecret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as JwtPayload);
      }
    });
  });
};

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      logSecurityEvent('Authentication failed - No token provided', undefined, req.ip);
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const decoded = await verifyToken(token);
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      logSecurityEvent('Authentication failed - User not found or inactive', decoded.userId, req.ip);
      res.status(401).json({
        success: false,
        message: 'Invalid token or user account is inactive',
      });
      return;
    }

    // Attach user info to request
    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role as UserRole,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logSecurityEvent('Authentication failed - Invalid token', undefined, req.ip, { error: error.message });
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      logSecurityEvent('Authentication failed - Token expired', undefined, req.ip);
      res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    } else {
      logger.error('Authentication error', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = await verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, role: true, isActive: true },
      });

      if (user && user.isActive) {
        req.user = {
          userId: user.id,
          username: user.username,
          role: user.role as UserRole,
        };
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logSecurityEvent(
        'Authorization failed - Insufficient permissions',
        req.user.userId,
        req.ip,
        { requiredRoles: allowedRoles, userRole: req.user.role }
      );
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize(UserRole.ADMIN);

// Admin or Technician middleware
export const adminOrTechnician = authorize(UserRole.ADMIN, UserRole.TECHNICIAN);

// Check if user owns resource or is admin
export const ownerOrAdmin = (getUserId: (req: Request) => number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const resourceUserId = getUserId(req);
    const isOwner = req.user.userId === resourceUserId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      logSecurityEvent(
        'Authorization failed - Not owner or admin',
        req.user.userId,
        req.ip,
        { resourceUserId, requestedUserId: req.user.userId }
      );
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    next();
  };
};

// Rate limiting for authentication endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logSecurityEvent('Rate limit exceeded for authentication', undefined, req.ip);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
    });
  },
};

// Validate token endpoint
export const validateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        lastLogin: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user,
        tokenValid: true,
      },
    });
  } catch (error) {
    logger.error('Token validation error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
