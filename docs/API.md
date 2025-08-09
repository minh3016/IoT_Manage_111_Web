# 🔌 Cooling Manager API Documentation

Comprehensive REST API documentation for the Cooling Manager backend server.

## 📋 Base Information

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json`
- **API Version**: v1

## 🔐 Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@coolingmanager.com",
      "role": "ADMIN",
      "firstName": "System",
      "lastName": "Administrator"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Token Refresh
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Validate Token
```http
GET /api/auth/validate
Authorization: Bearer <token>
```

## 🏠 Devices API

### Get All Devices
```http
GET /api/devices?page=1&pageSize=25&search=CM001&status=ACTIVE&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 25, max: 100)
- `search` (optional): Search term for device ID, name, or owner
- `status` (optional): Filter by device status (ACTIVE, INACTIVE, MAINTENANCE, ERROR)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc, desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "deviceId": "CM001",
        "deviceName": "Cooling Unit Alpha",
        "deviceType": "Industrial Cooler",
        "status": "ACTIVE",
        "ownerName": "Nguyen Van A",
        "phoneNumber": "+84901234567",
        "installationDate": "2023-01-15",
        "installationAddress": "123 Le Loi St, District 1, Ho Chi Minh City",
        "warrantyMonths": 24,
        "locationLat": 10.7769,
        "locationLng": 106.7009,
        "createdAt": "2023-01-15T00:00:00.000Z",
        "updatedAt": "2023-01-15T00:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 25
  }
}
```

### Get Device Statistics
```http
GET /api/devices/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDevices": 5,
    "active": 2,
    "maintenance": 1,
    "error": 1,
    "warrantyActive": 4
  }
}
```

### Get Device Details
```http
GET /api/devices/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "deviceId": "CM001",
    "deviceName": "Cooling Unit Alpha",
    "deviceType": "Industrial Cooler",
    "status": "ACTIVE",
    "ownerName": "Nguyen Van A",
    "phoneNumber": "+84901234567",
    "installationDate": "2023-01-15",
    "installationAddress": "123 Le Loi St, District 1, Ho Chi Minh City",
    "warrantyMonths": 24,
    "locationLat": 10.7769,
    "locationLng": 106.7009,
    "createdAt": "2023-01-15T00:00:00.000Z",
    "updatedAt": "2023-01-15T00:00:00.000Z",
    "sensorData": [
      {
        "id": 1,
        "deviceId": 1,
        "tempColdStorage": 2.5,
        "tempEnvironment": 25.0,
        "tempSolution": 15.0,
        "pressureSuction": 2.0,
        "pressureDischarge": 8.0,
        "superheatCurrent": 5.0,
        "voltageA": 220.0,
        "currentA": 12.0,
        "timestamp": "2023-12-01T10:00:00.000Z"
      }
    ],
    "activities": [
      {
        "id": 1,
        "action": "Device created",
        "type": "USER",
        "severity": "INFO",
        "details": "Device CM001 was created",
        "timestamp": "2023-01-15T00:00:00.000Z",
        "user": "admin"
      }
    ],
    "alerts": [
      {
        "id": 1,
        "severity": "WARNING",
        "message": "High temperature detected",
        "status": "ACTIVE",
        "createdAt": "2023-12-01T10:00:00.000Z"
      }
    ]
  }
}
```

### Create Device (Admin/Technician)
```http
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "CM006",
  "deviceName": "New Cooling Unit",
  "deviceType": "Commercial Cooler",
  "ownerName": "John Doe",
  "phoneNumber": "+84901234567",
  "installationDate": "2023-12-01",
  "installationAddress": "123 Main St, City",
  "warrantyMonths": 24,
  "locationLat": 10.7769,
  "locationLng": 106.7009
}
```

### Update Device (Admin/Technician)
```http
PUT /api/devices/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceName": "Updated Cooling Unit",
  "status": "MAINTENANCE"
}
```

### Delete Device (Admin/Technician)
```http
DELETE /api/devices/:id
Authorization: Bearer <token>
```

### Get Device Sensor Data
```http
GET /api/devices/:id/sensor-data?limit=100&startDate=2023-12-01&endDate=2023-12-31
Authorization: Bearer <token>
```

## 👥 Users API (Admin Only)

### Get All Users
```http
GET /api/users?page=1&pageSize=25&search=admin&role=ADMIN&isActive=true
Authorization: Bearer <token>
```

### Get User Details
```http
GET /api/users/:id
Authorization: Bearer <token>
```

### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "USER",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+84901234567"
}
```

### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Updated Name",
  "isActive": false
}
```

### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

## 📊 Activities API

### Get All Activities
```http
GET /api/activities?page=1&pageSize=25&search=login&severity=INFO&type=USER&startDate=2023-12-01&endDate=2023-12-31
Authorization: Bearer <token>
```

### Get Activity Statistics
```http
GET /api/activities/statistics?days=7
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "7 days",
    "total": 150,
    "byType": {
      "user": 50,
      "system": 80,
      "alert": 15,
      "error": 5
    },
    "bySeverity": {
      "success": 60,
      "info": 70,
      "warning": 15,
      "error": 5
    }
  }
}
```

### Get Recent Activities
```http
GET /api/activities/recent?limit=10
Authorization: Bearer <token>
```

## 🔄 Real-time Events (Socket.IO)

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events to Listen
- `device-data-updated` - New sensor data
- `device-status-changed` - Device status change
- `new-alert` - New alert generated
- `activity-logged` - New activity logged
- `user-notification` - User-specific notification

### Events to Emit
- `join-device` - Subscribe to device updates
- `leave-device` - Unsubscribe from device updates
- `join-user` - Join user-specific room
- `leave-user` - Leave user-specific room

## 🏥 System Health

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "database": "connected",
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640
  },
  "socket": {
    "connected": 5,
    "totalConnections": 10
  }
}
```

### Socket Statistics
```http
GET /api/socket/stats
Authorization: Bearer <token>
```

## ❌ Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "username",
      "message": "Username is required",
      "value": ""
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔒 Security

### Rate Limiting
- **General**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Password Change**: 3 attempts per hour

### Headers Required
- `Authorization: Bearer <token>` for protected routes
- `Content-Type: application/json` for POST/PUT requests

---

**Complete API documentation for the Cooling Manager backend** 🔌
