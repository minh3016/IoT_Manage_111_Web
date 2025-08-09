# 🏗️ Cooling Manager Architecture Overview

Comprehensive architecture documentation for the Cooling Manager IoT web application.

## 🎯 System Overview

The Cooling Manager is a full-stack IoT web application designed for monitoring and managing cooling systems with real-time sensor data, device management, and user authentication.

```
┌─────────────────────────────────────────────────────────────────┐
│                        COOLING MANAGER IOT                     │
│                     Web Application Stack                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │   Frontend   │ │   Backend   │ │ Database  │
        │  (React.js)  │ │ (Node.js)   │ │(PostgreSQL)│
        └──────────────┘ └─────────────┘ └───────────┘
```

## 🏛️ Architecture Layers

### 1. Presentation Layer (Frontend)
- **Technology**: React 18 + TypeScript + Material-UI
- **Responsibilities**: User interface, user experience, client-side logic
- **Communication**: REST API calls, Socket.IO real-time updates

### 2. Application Layer (Backend)
- **Technology**: Node.js + Express.js + TypeScript
- **Responsibilities**: Business logic, API endpoints, authentication, real-time communication
- **Communication**: Database queries, external service integration

### 3. Data Layer (Database)
- **Technology**: PostgreSQL + Prisma ORM
- **Responsibilities**: Data persistence, data integrity, query optimization
- **Communication**: SQL queries, database transactions

## 🔄 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Desktop   │  │   Tablet    │  │   Mobile    │  │   PWA       │      │
│  │   Browser   │  │   Browser   │  │   Browser   │  │   App       │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                              ┌─────▼─────┐
                              │   CDN     │
                              │ (Optional)│
                              └─────┬─────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION TIER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    REACT.JS FRONTEND                               │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │ Components  │ │    Pages    │ │   Hooks     │ │   Utils     │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │Redux Store  │ │   Router    │ │   Theme     │ │   Services  │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │ HTTP/HTTPS    │ WebSocket     │
                    │ REST API      │ Socket.IO     │
                    │               │               │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION TIER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   NODE.JS BACKEND                                  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │Controllers  │ │   Routes    │ │ Middleware  │ │  Services   │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │    Auth     │ │ Validation  │ │   Logging   │ │ Socket.IO   │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                              ┌─────▼─────┐
                              │   ORM     │
                              │ (Prisma)  │
                              └─────┬─────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA TIER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ PostgreSQL  │  │    Redis    │  │ File System │  │   Backups   │      │
│  │  Database   │  │   Cache     │  │   Storage   │  │   Storage   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── common/              # Shared UI components
│   │   ├── Header/         # Application header
│   │   ├── Sidebar/        # Navigation sidebar
│   │   ├── Footer/         # Application footer
│   │   └── Layout/         # Page layout wrapper
│   ├── forms/              # Form components
│   │   ├── LoginForm/      # User login form
│   │   ├── DeviceForm/     # Device creation/editing
│   │   └── UserForm/       # User management form
│   ├── charts/             # Data visualization
│   │   ├── LineChart/      # Time series data
│   │   ├── BarChart/       # Categorical data
│   │   └── PieChart/       # Distribution data
│   └── tables/             # Data tables
│       ├── DeviceTable/    # Device listing
│       ├── UserTable/      # User management
│       └── ActivityTable/  # Activity logs
├── pages/                  # Page components
│   ├── Dashboard/          # Main dashboard
│   ├── Devices/           # Device management
│   ├── Users/             # User management
│   ├── Activities/        # Activity logs
│   └── Settings/          # Application settings
└── store/                 # State management
    ├── slices/            # Redux slices
    └── api/               # RTK Query APIs
```

### Backend Components

```
src/
├── controllers/           # Request handlers
│   ├── authController.ts  # Authentication logic
│   ├── deviceController.ts # Device management
│   ├── userController.ts  # User management
│   └── activityController.ts # Activity logging
├── routes/               # API route definitions
│   ├── authRoutes.ts     # Auth endpoints
│   ├── deviceRoutes.ts   # Device endpoints
│   ├── userRoutes.ts     # User endpoints
│   └── activityRoutes.ts # Activity endpoints
├── middleware/           # Express middleware
│   ├── auth.ts          # Authentication middleware
│   ├── validation.ts    # Input validation
│   └── errorHandler.ts  # Error handling
├── services/            # Business logic
│   ├── socketService.ts # Real-time communication
│   └── sensorDataService.ts # Sensor data processing
└── config/              # Configuration
    ├── database.ts      # Database connection
    ├── logger.ts        # Logging configuration
    └── index.ts         # App configuration
```

## 🔄 Data Flow Architecture

### Request Flow

```
1. User Interaction
   ↓
2. React Component
   ↓
3. Redux Action/RTK Query
   ↓
4. HTTP Request
   ↓
5. Express.js Router
   ↓
6. Middleware (Auth, Validation)
   ↓
7. Controller
   ↓
8. Service Layer
   ↓
9. Prisma ORM
   ↓
10. PostgreSQL Database
    ↓
11. Response (reverse flow)
```

### Real-time Data Flow

```
1. Sensor Data Generation
   ↓
2. Backend Service
   ↓
3. Database Update
   ↓
4. Socket.IO Emission
   ↓
5. Frontend Socket Listener
   ↓
6. Redux State Update
   ↓
7. Component Re-render
   ↓
8. UI Update
```

## 🗄️ Database Architecture

### Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │   Devices   │    │ SensorData  │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ username    │    │ deviceId    │    │ deviceId(FK)│
│ email       │    │ deviceName  │    │ tempCold... │
│ password    │    │ deviceType  │    │ tempEnv...  │
│ role        │    │ status      │    │ pressure... │
│ firstName   │    │ ownerName   │    │ voltage...  │
│ lastName    │    │ phone       │    │ timestamp   │
│ isActive    │    │ installation│    └─────────────┘
│ createdAt   │    │ warranty    │           │
│ updatedAt   │    │ location    │           │
└─────────────┘    │ createdAt   │           │
        │          │ updatedAt   │           │
        │          └─────────────┘           │
        │                 │                 │
        │                 │                 │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Activities  │    │DeviceParams │    │   Alerts    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ userId (FK) │────│ deviceId(FK)│────│ deviceId(FK)│
│ deviceId(FK)│    │ name        │    │ severity    │
│ action      │    │ value       │    │ message     │
│ type        │    │ unit        │    │ status      │
│ severity    │    │ description │    │ createdAt   │
│ details     │    │ createdAt   │    │ resolvedAt  │
│ timestamp   │    │ updatedAt   │    └─────────────┘
└─────────────┘    └─────────────┘
```

### Database Schema Design Principles

1. **Normalization**: Proper 3NF normalization to reduce redundancy
2. **Indexing**: Strategic indexes on frequently queried columns
3. **Constraints**: Foreign key constraints for data integrity
4. **Audit Trail**: Created/updated timestamps on all entities
5. **Soft Deletes**: Logical deletion for important data
6. **Scalability**: Designed for horizontal scaling

## 🔐 Security Architecture

### Authentication Flow

```
1. User Login Request
   ↓
2. Credential Validation
   ↓
3. JWT Token Generation
   ↓
4. Token Storage (Client)
   ↓
5. Authenticated Requests
   ↓
6. Token Validation (Server)
   ↓
7. Authorization Check
   ↓
8. Resource Access
```

### Security Layers

1. **Transport Security**: HTTPS/TLS encryption
2. **Authentication**: JWT tokens with refresh mechanism
3. **Authorization**: Role-based access control (RBAC)
4. **Input Validation**: Server-side validation and sanitization
5. **Rate Limiting**: Request throttling and DDoS protection
6. **CORS**: Cross-origin resource sharing configuration
7. **Security Headers**: Helmet.js security headers
8. **SQL Injection**: Prisma ORM parameterized queries

## 🚀 Deployment Architecture

### Development Environment

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │  Database   │
│ localhost:  │    │ localhost:  │    │ localhost:  │
│    3000     │    │    5000     │    │    5432     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                       │
│                   (Nginx/HAProxy)                      │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
│   Frontend   │ │ Backend │ │   Backend   │
│  Container   │ │Container│ │ Container   │
│   (Nginx)    │ │   #1    │ │     #2      │
└──────────────┘ └─────────┘ └─────────────┘
                      │
              ┌───────▼───────┐
              │   Database    │
              │  (PostgreSQL) │
              │   + Redis     │
              └───────────────┘
```

## 📊 Performance Architecture

### Optimization Strategies

1. **Frontend Optimization**
   - Code splitting and lazy loading
   - Image optimization and compression
   - Bundle size optimization
   - Browser caching strategies

2. **Backend Optimization**
   - Database query optimization
   - Connection pooling
   - Response caching
   - Compression middleware

3. **Database Optimization**
   - Proper indexing strategy
   - Query optimization
   - Connection pooling
   - Read replicas (future)

4. **Real-time Optimization**
   - Socket.IO connection management
   - Event throttling
   - Room-based broadcasting
   - Connection scaling

## 🔄 Scalability Architecture

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────┐
│                  Load Balancer                         │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
│   Frontend   │ │ Backend │ │   Backend   │
│   Instance   │ │Instance │ │  Instance   │
│      #1      │ │   #1    │ │     #2      │
└──────────────┘ └─────────┘ └─────────────┘
                      │
              ┌───────▼───────┐
              │   Database    │
              │   Cluster     │
              │ (Master/Slave)│
              └───────────────┘
```

### Microservices Evolution (Future)

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    Auth     │ │   Device    │ │   Sensor    │
│  Service    │ │  Service    │ │   Service   │
└─────────────┘ └─────────────┘ └─────────────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
              ┌────────▼────────┐
              │  Message Queue  │
              │ (Redis/RabbitMQ)│
              └─────────────────┘
```

## 📈 Monitoring Architecture

### Observability Stack

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│Application  │ │   Metrics   │ │    Logs     │
│   Traces    │ │(Prometheus) │ │ (Winston)   │
└─────────────┘ └─────────────┘ └─────────────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
              ┌────────▼────────┐
              │    Grafana      │
              │   Dashboard     │
              └─────────────────┘
```

---

**Comprehensive architecture documentation for the Cooling Manager IoT application** 🏗️
