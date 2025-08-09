# 🌡️ Cooling Manager IoT Web Application

A comprehensive IoT web application for managing and monitoring cooling systems with real-time sensor data, device management, and user authentication.

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript 5
- **Vite** for build tooling
- **Material-UI (MUI)** for UI components
- **Redux Toolkit + RTK Query** for state management
- **React Router 6** for routing
- **SignalR** for real-time updates
- **Workbox** for PWA capabilities

### Backend Stack
- **ASP.NET Core 8.0** Web API
- **Entity Framework Core** with MySQL
- **SignalR** for real-time communication
- **JWT Authentication** with role-based authorization
- **Serilog** for structured logging
- **Health Checks** for monitoring

### Infrastructure
- **Docker** containerization
- **Nginx** reverse proxy
- **MySQL 8.0** database
- **Redis** for caching and SignalR backplane
- **GitHub Actions** CI/CD pipeline

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- .NET 8.0 SDK
- Docker & Docker Compose
- MySQL 8.0 (or use Docker)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WEB_COOLING_MANAGE
   ```

2. **Start with Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```
   
   This will start:
   - MySQL database on port 3306
   - Redis cache on port 6379
   - Backend API on port 5000
   - Frontend web app on port 80

3. **Manual Setup**

   **Backend:**
   ```bash
   cd backend/CoolingManagerAPI
   dotnet restore
   dotnet run
   ```

   **Frontend:**
   ```bash
   npm install
   npm run dev
   ```

### Environment Variables

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000/hubs/devices
VITE_LOG_LEVEL=info
```

**Backend (appsettings.json)**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=cooling_manager;User=root;Password=password;",
    "Redis": "localhost:6379"
  },
  "Jwt": {
    "Secret": "your-super-secret-jwt-key-here",
    "Issuer": "CoolingManagerAPI",
    "Audience": "CoolingManagerWeb"
  }
}
```

## 📱 Features

### Core Functionality
- **Device Management**: CRUD operations for IoT cooling devices
- **Real-time Monitoring**: Live sensor data updates via SignalR
- **GPIO Control**: Remote control of relays, fans, and valves
- **Parameter Configuration**: Device parameter management
- **Reporting & Export**: Data export in CSV/Excel formats
- **Activity Logging**: Comprehensive audit trail
- **Role-based Access**: Admin, Technician, and User roles

### Technical Features
- **Progressive Web App (PWA)**: Offline support and app-like experience
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Real-time Updates**: SignalR integration with automatic reconnection
- **Caching Strategy**: Optimized API caching with ETag support
- **Security**: JWT authentication, CORS, CSP headers
- **Monitoring**: Health checks and structured logging

## 🧪 Testing

### Frontend Testing
```bash
# Unit tests
npm run test

# Coverage report
npm run test:coverage

# E2E tests
npm run e2e
```

### Backend Testing
```bash
cd backend/CoolingManagerAPI.Tests
dotnet test --collect:"XPlat Code Coverage"
```

## 📦 Deployment

### Production Build

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
dotnet publish -c Release -o ./publish
```

### Docker Deployment
```bash
# Build images
docker-compose build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline
The project includes a GitHub Actions workflow that:
- Runs tests and linting
- Builds Docker images
- Performs security scanning
- Deploys to production

## 🔧 Development Guidelines

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Backend**: .NET coding conventions
- **Commits**: Conventional Commits format

### Project Structure
```
├── src/                    # Frontend source
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── features/          # Feature-specific modules
│   ├── store/             # Redux store and API
│   ├── services/          # External services
│   └── types/             # TypeScript definitions
├── backend/               # Backend source
│   ├── Controllers/       # API controllers
│   ├── Services/          # Business logic
│   ├── Data/             # Database context and models
│   ├── Hubs/             # SignalR hubs
│   └── Middleware/       # Custom middleware
└── docs/                 # Documentation
```

## 📊 API Documentation

The API follows RESTful conventions with 31 endpoints covering:
- Authentication (4 endpoints)
- Device management (6 endpoints)
- Sensor data (4 endpoints)
- GPIO control (3 endpoints)
- Parameters (3 endpoints)
- Reporting (5 endpoints)
- Activities & System (6 endpoints)

API documentation is available at `/swagger` when running in development mode.

## 🔒 Security

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **CORS**: Configured for web client origins
- **CSP**: Content Security Policy headers
- **HTTPS**: Enforced in production
- **Input Validation**: FluentValidation for API inputs

## 📈 Monitoring

- **Health Checks**: `/health` endpoint for system status
- **Logging**: Structured logging with Serilog
- **Metrics**: Application performance monitoring
- **Alerts**: Configurable alerting for system issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/swagger`
