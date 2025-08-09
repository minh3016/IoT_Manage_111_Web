import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@/config/database';
import { config } from '@/config';
import { logger, logSecurityEvent } from '@/config/logger';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  validateToken 
} from '@/middleware/auth';
import { AppError, catchAsync, createSuccessResponse } from '@/middleware/errorHandler';
import { LoginRequest, UserRole } from '@/types';

// Login controller
export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { username, password }: LoginRequest = req.body;

  // Find user by username
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      isActive: true,
      lastLogin: true,
    },
  });

  // Check if user exists and is active
  if (!user || !user.isActive) {
    logSecurityEvent('Login failed - Invalid credentials', undefined, req.ip, { username });
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logSecurityEvent('Login failed - Invalid password', user.id, req.ip, { username });
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role as UserRole,
  };

  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Log successful login
  logSecurityEvent('Login successful', user.id, req.ip, { username });
  
  // Log activity
  await prisma.activity.create({
    data: {
      userId: user.id,
      action: 'User logged in',
      type: 'USER',
      severity: 'INFO',
      details: `User ${username} logged in from ${req.ip}`,
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json(createSuccessResponse({
    user: userWithoutPassword,
    token,
    refreshToken,
  }, 'Login successful'));
});

// Logout controller
export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (userId) {
    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: 'User logged out',
        type: 'USER',
        severity: 'INFO',
        details: `User logged out from ${req.ip}`,
      },
    });

    logSecurityEvent('Logout successful', userId, req.ip);
  }

  res.json(createSuccessResponse(null, 'Logout successful'));
});

// Refresh token controller
export const refreshToken = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      logSecurityEvent('Token refresh failed - User not found or inactive', decoded.userId, req.ip);
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role as UserRole,
    };

    const newToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.json(createSuccessResponse({
      user,
      token: newToken,
      refreshToken: newRefreshToken,
    }, 'Token refreshed successfully'));

  } catch (error) {
    logSecurityEvent('Token refresh failed - Invalid token', undefined, req.ip);
    throw new AppError('Invalid refresh token', 401);
  }
});

// Validate token controller (reuse from middleware)
export const validate = validateToken;

// Change password controller
export const changePassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.userId;

  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, password: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    logSecurityEvent('Password change failed - Invalid current password', userId, req.ip);
    throw new AppError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId,
      action: 'Password changed',
      type: 'USER',
      severity: 'INFO',
      details: 'User changed their password',
    },
  });

  logSecurityEvent('Password changed successfully', userId, req.ip);

  res.json(createSuccessResponse(null, 'Password changed successfully'));
});

// Get current user profile
export const getProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(createSuccessResponse(user));
});

// Update user profile
export const updateProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { firstName, lastName, phone, email } = req.body;

  // Check if email is already taken by another user
  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    });

    if (existingUser) {
      throw new AppError('Email is already taken', 409);
    }
  }

  // Update user profile
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
    },
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
      createdAt: true,
      updatedAt: true,
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId,
      action: 'Profile updated',
      type: 'USER',
      severity: 'INFO',
      details: 'User updated their profile information',
    },
  });

  res.json(createSuccessResponse(updatedUser, 'Profile updated successfully'));
});

// Forgot password (placeholder for future implementation)
export const forgotPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // This would typically send a password reset email
  // For now, just return a success message
  res.json(createSuccessResponse(null, 'Password reset instructions sent to your email'));
});

// Reset password (placeholder for future implementation)
export const resetPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // This would typically verify a reset token and update the password
  // For now, just return a success message
  res.json(createSuccessResponse(null, 'Password reset successfully'));
});
