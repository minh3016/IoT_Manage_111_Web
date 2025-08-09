# 🌡️ Cooling Manager IoT Web Application

A comprehensive, production-ready IoT web application for managing and monitoring cooling systems with real-time sensor data, device management, and user authentication. Now featuring complete production deployment to **iotmanage111.xyz** with enterprise-grade security and monitoring.

[![Production Status](https://img.shields.io/badge/Production-Ready-brightgreen)](https://iotmanage111.xyz)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue)](https://hub.docker.com)
[![SSL](https://img.shields.io/badge/SSL-Secured-green)](https://iotmanage111.xyz)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## � **Live Production Application**

🚀 **Access the live application**: [https://iotmanage111.xyz](https://iotmanage111.xyz)
🔗 **API Endpoints**: [https://api.iotmanage111.xyz/api](https://api.iotmanage111.xyz/api)
💚 **Health Check**: [https://api.iotmanage111.xyz/health](https://api.iotmanage111.xyz/health)

### **Default Login Credentials**
| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `admin123` | ADMIN | Full system access |
| `tech1` | `tech123` | TECHNICIAN | Device management |
| `user1` | `user123` | USER | Read-only access |

## �🏗️ **Architecture Overview**

### **Frontend Stack**
- **React 18** with TypeScript for modern UI development
- **Material-UI (MUI)** for professional component library
- **Redux Toolkit + RTK Query** for state management and API caching
- **Socket.IO Client** for real-time bidirectional communication
- **Recharts** for interactive data visualization
- **Vite** for lightning-fast development and optimized builds
- **PWA Support** for offline capabilities and app-like experience

### **Backend Stack**
- **Node.js 18+** with Express.js framework
- **TypeScript** for type-safe server-side development
- **PostgreSQL** with Prisma ORM for robust data management
- **Socket.IO** for real-time communication
- **JWT Authentication** with refresh token support
- **bcryptjs** for secure password hashing
- **Winston** for structured logging and monitoring

### **Production Infrastructure**
- **Docker Compose** for containerized deployment
- **Nginx** reverse proxy with SSL termination
- **Let's Encrypt** SSL certificates with auto-renewal
- **PostgreSQL 15** production database
- **Redis 7** for caching and session management
- **UFW Firewall** for network security
- **Automated backups** with retention policies

## 🚀 **Quick Start Options**

### **Option 1: Try the Live Production App (Fastest)**
Visit [https://iotmanage111.xyz](https://iotmanage111.xyz) and login with:
- **Admin**: `admin` / `admin123`
- **Technician**: `tech1` / `tech123`
- **User**: `user1` / `user123`

### **Option 2: Local Development Setup**

#### **Prerequisites**
- **Node.js 18+** and npm
- **PostgreSQL 12+** (or use Docker)
- **Git** for version control
- **Docker & Docker Compose** (recommended)

#### **Quick Development Start**

1. **Clone the repository**
   ```bash
   git clone https://github.com/minh3016/IoT_Manage_111_Web.git
   cd IoT_Manage_111_Web
   ```

2. **Start with Docker (Recommended)**
   ```bash
   # Copy environment files
   cp .env.example .env

   # Start all services
   docker-compose up -d
   ```

   This starts:
   - **PostgreSQL** database on port 5432
   - **Redis** cache on port 6379
   - **Backend API** on port 5000
   - **Frontend app** on port 3001

3. **Manual Development Setup**

   **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env

   # Database setup
   npm run db:generate
   npm run db:migrate
   npm run db:seed

   # Start development server
   npm run dev
   ```

   **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env

   # Start development server
   npm run dev
   ```

#### **Access Local Application**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

### **Option 3: Production Deployment**

Deploy your own instance to any cloud provider with the domain of your choice:

```bash
# Quick production deployment (20 minutes)
git clone https://github.com/minh3016/IoT_Manage_111_Web.git
cd IoT_Manage_111_Web

# Configure production environment
cp .env.production .env
nano .env  # Update passwords and domain

# Deploy with automated script
chmod +x scripts/deploy.sh
./scripts/deploy.sh production --seed
```

📖 **See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for complete production deployment guide**

## 📱 **Features & Capabilities**

### **🎯 Core Functionality**
- **📊 Real-time Dashboard**: Live sensor data visualization with interactive charts
- **🔧 Device Management**: Complete CRUD operations for IoT cooling devices
- **⚡ Real-time Monitoring**: Live sensor data updates via Socket.IO
- **🎛️ GPIO Control**: Remote control of relays, fans, and valves
- **⚙️ Parameter Configuration**: Dynamic device parameter management
- **📈 Data Visualization**: Interactive charts with Recharts library
- **📋 Activity Logging**: Comprehensive audit trail with filtering
- **👥 User Management**: Role-based access control (Admin, Technician, User)
- **📊 Reporting & Export**: Data export capabilities
- **🔔 Alert System**: Real-time notifications and alerts

### **🛡️ Security Features**
- **🔐 JWT Authentication**: Secure token-based authentication with refresh tokens
- **🛡️ Role-based Authorization**: Granular access control (RBAC)
- **🔒 Password Security**: bcrypt hashing with configurable rounds
- **🌐 CORS Protection**: Restricted cross-origin requests
- **🛡️ Security Headers**: CSP, HSTS, XSS protection
- **🔥 Rate Limiting**: API endpoint protection (10r/s API, 5r/m auth)
- **🔐 SSL/TLS**: Let's Encrypt certificates with auto-renewal
- **🚫 Input Validation**: Comprehensive server-side validation

### **⚡ Technical Features**
- **📱 Progressive Web App (PWA)**: Offline support and app-like experience
- **📱 Responsive Design**: Optimized for mobile, tablet, and desktop
- **🔄 Real-time Updates**: Socket.IO with automatic reconnection
- **⚡ Performance Optimized**: Lazy loading, code splitting, caching
- **🐳 Docker Ready**: Complete containerization with Docker Compose
- **📊 Health Monitoring**: Comprehensive health checks and metrics
- **📝 Structured Logging**: Winston logging with log rotation
- **🔄 Auto-deployment**: Automated deployment scripts with rollback

### **🌐 Production Features**
- **🚀 Zero-downtime Deployments**: Rolling updates with health checks
- **📊 Monitoring & Alerting**: Automated health checks every 5 minutes
- **💾 Automated Backups**: Daily database backups with 30-day retention
- **🔄 Auto-scaling Ready**: Horizontal scaling capabilities
- **📈 Performance Metrics**: Application performance monitoring
- **🔧 Maintenance Mode**: Graceful maintenance and updates

## 🧪 **Testing & Quality Assurance**

### **Frontend Testing**
```bash
cd frontend

# Unit tests with Jest and React Testing Library
npm run test

# Test coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch

# E2E tests with Playwright (coming soon)
npm run e2e
```

### **Backend Testing**
```bash
cd backend

# Unit tests with Jest
npm run test

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage

# Load testing
npm run test:load
```

### **Code Quality**
```bash
# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Type checking
npm run type-check

# Security audit
npm audit
```

## 🚀 **Production Deployment**

### **🌐 Live Production Instance**
The application is already deployed and running at:
- **Production URL**: https://iotmanage111.xyz
- **API Base**: https://api.iotmanage111.xyz/api
- **WebSocket**: wss://api.iotmanage111.xyz/socket.io

### **🐳 Docker Production Deployment**

**Quick Production Setup (20 minutes):**
```bash
# Clone repository
git clone https://github.com/minh3016/IoT_Manage_111_Web.git
cd IoT_Manage_111_Web

# Configure production environment
cp .env.production .env
nano .env  # Update passwords, domain, and secrets

# Deploy with automated script
chmod +x scripts/deploy.sh
./scripts/deploy.sh production --seed
```

**Manual Docker Deployment:**
```bash
# Build and start production containers
docker-compose -f docker-compose.production.yml up -d --build

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### **🔧 Production Configuration**

**Required Environment Variables:**
```env
# Domain Configuration
DOMAIN=your-domain.com
API_DOMAIN=api.your-domain.com

# Database (32+ characters)
POSTGRES_PASSWORD=your_secure_postgres_password

# Redis (32+ characters)
REDIS_PASSWORD=your_secure_redis_password

# JWT Secrets (64+ characters)
JWT_SECRET=your_super_secure_jwt_secret
JWT_REFRESH_SECRET=your_super_secure_refresh_secret
```

### **📋 Deployment Checklist**
- [ ] Domain DNS configured (A records)
- [ ] SSL certificates obtained (Let's Encrypt)
- [ ] Environment variables configured
- [ ] Firewall rules configured (ports 80, 443)
- [ ] Database backups scheduled
- [ ] Monitoring and health checks active
- [ ] Default passwords changed

### **📚 Deployment Documentation**
- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - 20-minute deployment guide
- **[docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)** - Comprehensive deployment guide
- **[PRODUCTION_DEPLOYMENT_SUMMARY.md](PRODUCTION_DEPLOYMENT_SUMMARY.md)** - Executive summary

## 🔧 **Development Guidelines**

### **📝 Code Style & Standards**
- **Frontend**: ESLint + Prettier with TypeScript strict mode
- **Backend**: Node.js best practices with TypeScript
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `docs:`, etc.)
- **Branching**: GitFlow with `main`, `develop`, and feature branches
- **Code Reviews**: Required for all pull requests

### **📁 Project Structure**
```
IoT_Manage_111_Web/
├── frontend/                    # React.js frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components (Dashboard, Devices, etc.)
│   │   ├── store/             # Redux store and RTK Query APIs
│   │   ├── services/          # External services and utilities
│   │   ├── types/             # TypeScript type definitions
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── package.json           # Frontend dependencies
├── backend/                    # Node.js backend API server
│   ├── src/
│   │   ├── controllers/       # Express.js route controllers
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic services
│   │   ├── middleware/        # Express middleware
│   │   ├── config/            # Configuration management
│   │   ├── types/             # TypeScript interfaces
│   │   └── scripts/           # Database scripts and utilities
│   ├── prisma/                # Database schema and migrations
│   └── package.json           # Backend dependencies
├── docs/                      # Comprehensive documentation
│   ├── API.md                 # API endpoint documentation
│   ├── DEPLOYMENT.md          # Production deployment guide
│   ├── ARCHITECTURE.md        # System architecture overview
│   └── DEVELOPMENT.md         # Development setup guide
├── nginx/                     # Nginx configuration for production
├── scripts/                   # Deployment and maintenance scripts
├── docker-compose.yml         # Development Docker setup
├── docker-compose.production.yml # Production Docker setup
└── .env.production           # Production environment template
```

## 📊 **API Documentation**

### **RESTful API Endpoints**
The API follows RESTful conventions with **25+ endpoints** covering:

**🔐 Authentication (4 endpoints)**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

**🔧 Device Management (8 endpoints)**
- `GET /api/devices` - List all devices
- `POST /api/devices` - Create new device
- `GET /api/devices/:id` - Get device details
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `GET /api/devices/:id/sensors` - Get device sensors
- `POST /api/devices/:id/control` - Control device
- `GET /api/devices/:id/status` - Get device status

**📊 Sensor Data (6 endpoints)**
- `GET /api/sensor-data` - Get sensor readings
- `POST /api/sensor-data` - Add sensor reading
- `GET /api/sensor-data/latest` - Latest readings
- `GET /api/sensor-data/history` - Historical data
- `GET /api/sensor-data/export` - Export data
- `DELETE /api/sensor-data/cleanup` - Data cleanup

**👥 User Management (5 endpoints)**
- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/profile` - User profile

**📋 Activity Logs (3 endpoints)**
- `GET /api/activities` - Get activity logs
- `POST /api/activities` - Log activity
- `DELETE /api/activities/cleanup` - Cleanup old logs

### **Real-time Communication**
- **Socket.IO Events**: Real-time sensor data, device status, alerts
- **WebSocket URL**: `wss://api.iotmanage111.xyz/socket.io`
- **Authentication**: JWT token-based WebSocket authentication

### **API Documentation Access**
- **Development**: http://localhost:5000/api-docs (Swagger UI)
- **Production**: Available in development mode only for security

## 🔒 **Security Implementation**

### **🛡️ Authentication & Authorization**
- **JWT Tokens**: Secure token-based authentication with 24h expiry
- **Refresh Tokens**: 7-day refresh tokens for seamless user experience
- **Role-based Access Control (RBAC)**: Admin, Technician, User roles
- **Password Security**: bcrypt hashing with 12 rounds
- **Session Management**: Secure session handling with Redis

### **🌐 Network Security**
- **HTTPS Enforcement**: SSL/TLS encryption for all communications
- **CORS Configuration**: Restricted to production domains only
- **Rate Limiting**: API protection (10 req/sec, auth 5 req/min)
- **Firewall Rules**: UFW configured for ports 22, 80, 443 only
- **DDoS Protection**: Nginx rate limiting and connection limits

### **🔐 Application Security**
- **Input Validation**: Comprehensive server-side validation
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookies and CSRF tokens
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options

## 📈 **Monitoring & Observability**

### **🔍 Health Monitoring**
- **Health Endpoints**: `/health` for system status monitoring
- **Container Health Checks**: Docker health checks for all services
- **Database Monitoring**: Connection pool and query performance
- **Real-time Metrics**: Application performance monitoring

### **📝 Logging & Alerting**
- **Structured Logging**: Winston with JSON format
- **Log Levels**: Error, Warn, Info, Debug with production filtering
- **Log Rotation**: 10MB max size, 3 files retention
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Metrics**: Response times, throughput, error rates

### **💾 Backup & Recovery**
- **Automated Backups**: Daily PostgreSQL backups
- **Backup Retention**: 30-day retention policy
- **Point-in-time Recovery**: Database transaction log backups
- **Disaster Recovery**: Documented recovery procedures

## 🤝 **Contributing**

We welcome contributions to the Cooling Manager IoT project! Here's how to get started:

### **🔄 Development Workflow**
1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Make** your changes following our coding standards
5. **Add** tests for new functionality
6. **Ensure** all tests pass (`npm run test`)
7. **Commit** using conventional commits (`git commit -m 'feat: add amazing feature'`)
8. **Push** to your branch (`git push origin feature/amazing-feature`)
9. **Submit** a Pull Request with detailed description

### **📋 Contribution Guidelines**
- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all CI checks pass
- Keep commits atomic and well-described
- Reference issues in commit messages when applicable

### **🐛 Bug Reports**
When reporting bugs, please include:
- Operating system and version
- Node.js and npm versions
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable

### **💡 Feature Requests**
For new features, please:
- Check existing issues first
- Provide detailed use case description
- Consider implementation complexity
- Discuss with maintainers before large changes

## 📊 **Project Statistics**

- **📁 Total Files**: 100+ source files
- **📝 Lines of Code**: 15,000+ lines
- **🧪 Test Coverage**: 85%+ coverage target
- **📚 Documentation**: Comprehensive guides and API docs
- **🐳 Docker Images**: Multi-stage optimized builds
- **🔒 Security**: Production-grade security implementation
- **⚡ Performance**: Optimized for high-throughput operations

## 🌟 **Acknowledgments**

### **🛠️ Technologies Used**
- **Frontend**: React, TypeScript, Material-UI, Redux Toolkit
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Real-time**: Socket.IO for bidirectional communication
- **Infrastructure**: Docker, Nginx, Let's Encrypt, Redis
- **Monitoring**: Winston logging, health checks, metrics

### **📚 Inspiration & References**
- IoT best practices and industry standards
- Modern web application architecture patterns
- Security guidelines from OWASP
- Performance optimization techniques

## 📞 **Support & Community**

### **🆘 Getting Help**
- **📖 Documentation**: Check the comprehensive `/docs` folder
- **🐛 Issues**: Create an issue on GitHub for bugs or questions
- **💬 Discussions**: Use GitHub Discussions for general questions
- **📧 Email**: Contact maintainers for security issues

### **📱 Community Resources**
- **🌐 Live Demo**: https://iotmanage111.xyz
- **📊 API Health**: https://api.iotmanage111.xyz/health
- **📚 Documentation**: Available in repository `/docs` folder
- **🔧 Development Guide**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

### **🚀 Quick Links**
- **Production App**: [iotmanage111.xyz](https://iotmanage111.xyz)
- **GitHub Repository**: [IoT_Manage_111_Web](https://github.com/minh3016/IoT_Manage_111_Web)
- **Quick Deploy Guide**: [QUICK_DEPLOY.md](QUICK_DEPLOY.md)
- **Architecture Overview**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API Documentation**: [docs/API.md](docs/API.md)

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **MIT License Summary**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No warranty provided
- ❌ No liability assumed

---

## 🎉 **Ready to Get Started?**

### **🚀 For Users**
Visit the live application: **[https://iotmanage111.xyz](https://iotmanage111.xyz)**

### **👨‍💻 For Developers**
```bash
git clone https://github.com/minh3016/IoT_Manage_111_Web.git
cd IoT_Manage_111_Web
docker-compose up -d
```

### **🌐 For Production Deployment**
```bash
./scripts/deploy.sh production --seed
```

---

**Built with ❤️ for IoT device management and monitoring**

[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen)](https://iotmanage111.xyz)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue)](https://hub.docker.com)
[![SSL Secured](https://img.shields.io/badge/SSL-Secured-green)](https://iotmanage111.xyz)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
