# 🎨 Cooling Manager Frontend

Modern React.js frontend application for the Cooling Manager IoT system with real-time monitoring, device management, and responsive design.

## 🚀 Features

### 🎯 Core Features
- **Real-time Dashboard** - Live device monitoring with interactive charts
- **Device Management** - Complete CRUD operations for cooling units
- **User Authentication** - Secure login with role-based access control
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Real-time Updates** - Socket.IO integration for live data streaming
- **Activity Logging** - Comprehensive system activity monitoring

### 🎨 UI/UX Features
- **Material-UI Components** - Modern, accessible design system
- **Dark/Light Theme** - User preference theme switching
- **Interactive Charts** - Real-time sensor data visualization
- **Mobile-First Design** - Responsive layout for all screen sizes
- **Loading States** - Smooth user experience with proper feedback
- **Error Handling** - User-friendly error messages and recovery

## 🔧 Technology Stack

- **React 18** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - React component library
- **Redux Toolkit** - State management with RTK Query
- **React Router 6** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Recharts** - Data visualization library
- **React Hook Form** - Form handling and validation
- **Vite** - Fast build tool and dev server

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components (Header, Sidebar, etc.)
│   │   ├── forms/          # Form components
│   │   ├── charts/         # Chart components
│   │   └── layout/         # Layout components
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard page
│   │   ├── devices/        # Device management pages
│   │   ├── users/          # User management pages
│   │   └── activities/     # Activity pages
│   ├── store/              # Redux store and slices
│   │   ├── slices/         # Redux slices
│   │   ├── api/            # RTK Query API slices
│   │   └── index.ts        # Store configuration
│   ├── services/           # API services and utilities
│   │   ├── api.ts          # API configuration
│   │   ├── socket.ts       # Socket.IO client
│   │   └── auth.ts         # Authentication service
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── theme/              # Material-UI theme configuration
│   └── test/               # Test utilities and setup
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API server running (see [backend README](../backend/README.md))

### Installation

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_APP_NAME=Cooling Manager
   VITE_APP_VERSION=1.0.0
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run e2e` - Run end-to-end tests with Playwright

## 🎨 Key Components

### Dashboard
- **Real-time metrics** - Device status, sensor readings, alerts
- **Interactive charts** - Temperature, pressure, electrical data
- **Device overview** - Quick status of all cooling units
- **Recent activities** - Latest system events and user actions

### Device Management
- **Device list** - Filterable and searchable device grid
- **Device details** - Comprehensive device information
- **Sensor monitoring** - Real-time sensor data visualization
- **Parameter configuration** - Device settings management

### User Management (Admin)
- **User list** - User account management
- **Role assignment** - Admin, Technician, User roles
- **Activity tracking** - User action audit trails
- **Profile management** - User profile and preferences

### Authentication
- **Secure login** - JWT-based authentication
- **Role-based access** - Different UI based on user role
- **Session management** - Automatic token refresh
- **Password management** - Change password functionality

## 🔌 API Integration

### REST API
The frontend communicates with the backend via RESTful APIs:
- **Authentication**: `/api/auth/*`
- **Devices**: `/api/devices/*`
- **Users**: `/api/users/*`
- **Activities**: `/api/activities/*`

### Real-time Updates
Socket.IO integration for live updates:
- **Device data updates** - Live sensor readings
- **Status changes** - Device status notifications
- **Alerts** - Real-time alert notifications
- **Activity logs** - Live activity feed

## 🎨 Theming and Styling

### Material-UI Theme
- **Custom color palette** - Brand-specific colors
- **Typography** - Consistent font hierarchy
- **Component overrides** - Customized MUI components
- **Responsive breakpoints** - Mobile-first design

### Theme Configuration
```typescript
// src/theme/index.ts
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    // ... more theme configuration
  },
});
```

## 🧪 Testing

### Unit Testing
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing utilities
- **MSW** - API mocking for tests

### E2E Testing
- **Playwright** - End-to-end testing framework
- **Cross-browser testing** - Chrome, Firefox, Safari
- **Mobile testing** - Responsive design validation

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage
```

## 🚀 Production Build

### Build Process
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- **Code splitting** - Optimized bundle sizes
- **Tree shaking** - Unused code elimination
- **Asset optimization** - Compressed images and assets
- **Source maps** - For debugging in production

### Docker Deployment
```bash
# Build Docker image
docker build -t cooling-manager-frontend .

# Run container
docker run -p 3000:80 cooling-manager-frontend
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL` - Backend API base URL
- `VITE_SOCKET_URL` - Socket.IO server URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

### Vite Configuration
See `vite.config.ts` for build and development server configuration.

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation as needed
4. Use TypeScript for type safety
5. Follow Material-UI design principles

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Frontend built with modern React.js and Material-UI for optimal user experience** 🎨
