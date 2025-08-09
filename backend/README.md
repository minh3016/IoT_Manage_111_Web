# Cooling Manager Backend API

A comprehensive Node.js/Express.js backend API server with TypeScript for the Cooling Manager web application.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Real-time Updates**: Socket.IO integration for live sensor data and notifications
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Security**: Comprehensive security middleware with rate limiting, CORS, and input validation
- **Monitoring**: Health checks, logging, and performance monitoring
- **API Documentation**: RESTful API with comprehensive error handling
- **Data Management**: CRUD operations for devices, users, activities, and sensor data
- **Real-time Sensor Simulation**: Built-in sensor data simulation for development/demo

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.IO for WebSocket connections
- **Validation**: Joi and express-validator for input validation
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston with structured logging
- **Testing**: Jest (configured but tests need to be written)

## Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 12+ (or Docker)
- npm or yarn package manager

## Quick Start

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cooling_manager?schema=public"

# JWT Secrets (change these in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`

## Docker Setup

### Using Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -f Dockerfile.node -t cooling-manager-backend .

# Run container
docker run -p 5000:5000 --env-file .env cooling-manager-backend
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/validate` - Validate current token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Devices
- `GET /api/devices` - Get all devices (with filtering)
- `GET /api/devices/statistics` - Get device statistics
- `GET /api/devices/:id` - Get device details
- `POST /api/devices` - Create new device (admin/technician)
- `PUT /api/devices/:id` - Update device (admin/technician)
- `DELETE /api/devices/:id` - Delete device (admin/technician)
- `GET /api/devices/:id/sensor-data` - Get device sensor data

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Activities
- `GET /api/activities` - Get all activities (with filtering)
- `GET /api/activities/statistics` - Get activity statistics
- `GET /api/activities/recent` - Get recent activities
- `GET /api/activities/:id` - Get activity details
- `POST /api/activities/cleanup` - Cleanup old activities (admin)

### System
- `GET /health` - Health check endpoint
- `GET /api/socket/stats` - Socket.IO connection statistics

## Default Users

After running the seed script, these users are available:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| admin | admin | ADMIN | System administrator |
| tech1 | tech123 | TECHNICIAN | Technician user |
| user1 | user123 | USER | Regular user |

## Socket.IO Events

### Client to Server
- `join-device` - Subscribe to device updates
- `leave-device` - Unsubscribe from device updates
- `join-user` - Join user-specific room
- `leave-user` - Leave user-specific room

### Server to Client
- `device-data-updated` - New sensor data available
- `device-status-changed` - Device status changed
- `new-alert` - New alert generated
- `activity-logged` - New activity logged
- `user-notification` - User-specific notification
- `system-notification` - System-wide notification

## Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── scripts/         # Utility scripts
└── server.ts        # Main server file

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma` and run migrations
2. **Types**: Add TypeScript interfaces in `src/types/`
3. **Controllers**: Add business logic in `src/controllers/`
4. **Routes**: Define API endpoints in `src/routes/`
5. **Middleware**: Add validation and security in `src/middleware/`
6. **Services**: Add complex business logic in `src/services/`

## Production Deployment

### Environment Variables

Ensure these are set in production:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-secure-jwt-secret-32-chars-minimum
JWT_REFRESH_SECRET=your-secure-refresh-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Security Checklist

- [ ] Change default JWT secrets
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable request logging
- [ ] Configure database connection limits
- [ ] Set up monitoring and alerts
- [ ] Regular security updates

### Performance Optimization

- Use connection pooling for database
- Enable gzip compression
- Set up Redis for caching
- Configure proper logging levels
- Monitor memory usage and CPU
- Set up load balancing if needed

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify credentials and database exists

2. **JWT Token Issues**
   - Check JWT_SECRET is set and consistent
   - Verify token expiration settings
   - Clear browser localStorage if needed

3. **Socket.IO Connection Issues**
   - Check CORS configuration
   - Verify frontend Socket.IO client version compatibility
   - Check firewall settings for WebSocket connections

4. **Permission Errors**
   - Verify user roles in database
   - Check middleware authentication
   - Ensure proper route protection

### Logs

Logs are written to:
- Console (development)
- `logs/combined.log` (production)
- `logs/error.log` (errors only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License.
