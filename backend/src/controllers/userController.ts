import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@/config/database';
import { config } from '@/config';
import { logger, logSecurityEvent } from '@/config/logger';
import { AppError, catchAsync, createSuccessResponse } from '@/middleware/errorHandler';
import { CreateUserRequest, UpdateUserRequest, UserRole } from '@/types';

// Get all users (admin only)
export const getUsers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    search,
    role,
    isActive,
    page = 1,
    pageSize = 25,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = ((page as number) - 1) * (pageSize as number);
  const take = pageSize as number;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { username: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Build order by clause
  const orderBy: any = {};
  orderBy[sortBy as string] = sortOrder;

  // Get users with pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
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
    }),
    prisma.user.count({ where }),
  ]);

  // Format response
  const formattedUsers = users.map(user => ({
    ...user,
    lastLogin: user.lastLogin?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));

  res.json(createSuccessResponse({
    data: formattedUsers,
    total,
    page,
    pageSize,
  }));
});

// Get single user by ID (admin only)
export const getUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = parseInt(id!, 10);

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }

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
      activities: {
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          type: true,
          severity: true,
          details: true,
          timestamp: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Format response
  const formattedUser = {
    ...user,
    lastLogin: user.lastLogin?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    activities: user.activities.map(activity => ({
      ...activity,
      timestamp: activity.timestamp.toISOString(),
    })),
  };

  res.json(createSuccessResponse(formattedUser));
});

// Create new user (admin only)
export const createUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userData: CreateUserRequest = req.body;
  const adminUserId = req.user!.userId;

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username: userData.username },
  });

  if (existingUsername) {
    throw new AppError('Username already exists', 409);
  }

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingEmail) {
    throw new AppError('Email already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, config.security.bcryptRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      role: userData.role || UserRole.USER,
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
      createdAt: true,
      updatedAt: true,
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId: adminUserId,
      action: 'User created',
      type: 'USER',
      severity: 'INFO',
      details: `User ${user.username} was created with role ${user.role}`,
    },
  });

  logSecurityEvent('User created', adminUserId, req.ip, { 
    createdUserId: user.id, 
    username: user.username,
    role: user.role 
  });

  // Format response
  const formattedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  res.status(201).json(createSuccessResponse(formattedUser, 'User created successfully'));
});

// Update user (admin only)
export const updateUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = parseInt(id!, 10);
  const updateData: UpdateUserRequest = req.body;
  const adminUserId = req.user!.userId;

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Check if new username already exists (if being updated)
  if (updateData.username && updateData.username !== existingUser.username) {
    const userWithSameUsername = await prisma.user.findUnique({
      where: { username: updateData.username },
    });

    if (userWithSameUsername) {
      throw new AppError('Username already exists', 409);
    }
  }

  // Check if new email already exists (if being updated)
  if (updateData.email && updateData.email !== existingUser.email) {
    const userWithSameEmail = await prisma.user.findUnique({
      where: { email: updateData.email },
    });

    if (userWithSameEmail) {
      throw new AppError('Email already exists', 409);
    }
  }

  // Update user
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
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
      userId: adminUserId,
      action: 'User updated',
      type: 'USER',
      severity: 'INFO',
      details: `User ${user.username} was updated`,
    },
  });

  logSecurityEvent('User updated', adminUserId, req.ip, { 
    updatedUserId: user.id, 
    username: user.username 
  });

  // Format response
  const formattedUser = {
    ...user,
    lastLogin: user.lastLogin?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  res.json(createSuccessResponse(formattedUser, 'User updated successfully'));
});

// Delete user (admin only)
export const deleteUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = parseInt(id!, 10);
  const adminUserId = req.user!.userId;

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }

  // Prevent admin from deleting themselves
  if (userId === adminUserId) {
    throw new AppError('Cannot delete your own account', 400);
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Delete user
  await prisma.user.delete({
    where: { id: userId },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId: adminUserId,
      action: 'User deleted',
      type: 'USER',
      severity: 'WARNING',
      details: `User ${existingUser.username} was deleted`,
    },
  });

  logSecurityEvent('User deleted', adminUserId, req.ip, { 
    deletedUserId: userId, 
    username: existingUser.username 
  });

  res.json(createSuccessResponse(null, 'User deleted successfully'));
});
