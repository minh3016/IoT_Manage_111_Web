# 🚀 Production Deployment Guide - iotmanage111.xyz

Complete guide for deploying the Cooling Manager IoT application to production with the domain `iotmanage111.xyz`.

## 📋 **Prerequisites**

- Domain name: `iotmanage111.xyz` (purchased and accessible)
- Cloud server (AWS EC2, DigitalOcean Droplet, or VPS)
- Server specifications: Minimum 2GB RAM, 2 CPU cores, 20GB storage
- SSH access to the server
- Docker and Docker Compose installed

## 🌐 **Step 1: Server Setup**

### **Option A: DigitalOcean Droplet (Recommended)**

1. **Create Droplet**
   ```bash
   # Create Ubuntu 22.04 LTS droplet
   # Size: 2GB RAM, 2 vCPUs, 50GB SSD
   # Region: Choose closest to your users
   ```

2. **Initial Server Setup**
   ```bash
   # Connect via SSH
   ssh root@your-server-ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install required packages
   apt install -y curl wget git nginx certbot python3-certbot-nginx ufw
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   
   # Create deployment user
   adduser deploy
   usermod -aG docker deploy
   usermod -aG sudo deploy
   ```

### **Option B: AWS EC2 Instance**

1. **Launch EC2 Instance**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t3.small (2 vCPU, 2GB RAM)
   - Security Group: Allow ports 22, 80, 443, 5000
   - Key Pair: Create or use existing

2. **Configure Security Group**
   ```
   Port 22  (SSH)     - Your IP only
   Port 80  (HTTP)    - 0.0.0.0/0
   Port 443 (HTTPS)   - 0.0.0.0/0
   Port 5000 (API)    - Internal only
   ```

## 🌍 **Step 2: Domain Configuration**

### **DNS Records Setup**

Configure the following DNS records for `iotmanage111.xyz`:

```dns
# A Records
@               A       YOUR_SERVER_IP
www             A       YOUR_SERVER_IP
api             A       YOUR_SERVER_IP

# CNAME Records (optional)
app             CNAME   iotmanage111.xyz
dashboard       CNAME   iotmanage111.xyz
```

### **Verify DNS Propagation**
```bash
# Check DNS resolution
nslookup iotmanage111.xyz
dig iotmanage111.xyz

# Test from different locations
# Use online tools like whatsmydns.net
```

## 🔒 **Step 3: SSL Certificate Setup**

### **Install Let's Encrypt Certificate**

```bash
# Stop nginx if running
sudo systemctl stop nginx

# Obtain SSL certificate
sudo certbot certonly --standalone -d iotmanage111.xyz -d www.iotmanage111.xyz -d api.iotmanage111.xyz

# Verify certificate
sudo certbot certificates

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📦 **Step 4: Application Deployment**

### **Clone Repository**

```bash
# Switch to deploy user
su - deploy

# Clone the repository
git clone https://github.com/minh3016/IoT_Manage_111_Web.git
cd IoT_Manage_111_Web

# Create production branch
git checkout -b production
```

### **Production Environment Configuration**

Create production environment files:

```bash
# Root environment
cp .env.example .env.production

# Backend environment
cp backend/.env.example backend/.env.production

# Frontend environment
cp frontend/.env.example frontend/.env.production
```

## 🐳 **Step 5: Docker Production Setup**

### **Production Docker Compose**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: cooling_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: cooling_manager
      POSTGRES_USER: cooling_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - cooling_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cooling_user -d cooling_manager"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: cooling_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - cooling_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: cooling_backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://cooling_user:${POSTGRES_PASSWORD}@postgres:5432/cooling_manager
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CORS_ORIGIN: https://iotmanage111.xyz,https://www.iotmanage111.xyz
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - cooling_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
      target: production
      args:
        VITE_API_URL: https://api.iotmanage111.xyz/api
        VITE_SOCKET_URL: https://api.iotmanage111.xyz
    container_name: cooling_frontend
    restart: unless-stopped
    networks:
      - cooling_network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: cooling_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites-available:/etc/nginx/sites-available:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - backend
      - frontend
    networks:
      - cooling_network
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  nginx_logs:

networks:
  cooling_network:
    driver: bridge
```

## 🔧 **Step 6: Nginx Configuration**

### **Main Nginx Configuration**

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss 
               application/json application/xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Include site configurations
    include /etc/nginx/sites-available/*;
}
```

### **Site Configuration**

```nginx
# nginx/sites-available/iotmanage111.xyz.conf
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name iotmanage111.xyz www.iotmanage111.xyz api.iotmanage111.xyz;
    return 301 https://$server_name$request_uri;
}

# Main application (Frontend)
server {
    listen 443 ssl http2;
    server_name iotmanage111.xyz www.iotmanage111.xyz;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/iotmanage111.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iotmanage111.xyz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https://api.iotmanage111.xyz wss://api.iotmanage111.xyz;" always;

    # Frontend application
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}

# API Server (Backend)
server {
    listen 443 ssl http2;
    server_name api.iotmanage111.xyz;

    # SSL Configuration (same as above)
    ssl_certificate /etc/letsencrypt/live/iotmanage111.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iotmanage111.xyz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # API endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://iotmanage111.xyz" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }

    # Authentication endpoints (stricter rate limiting)
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO WebSocket connections
    location /socket.io/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://backend:5000;
        access_log off;
    }
}
```

## 🔐 **Step 7: Production Environment Variables**

### **Root Environment (.env.production)**

```env
# Production Environment Configuration
NODE_ENV=production
COMPOSE_PROJECT_NAME=cooling_manager

# Database
POSTGRES_PASSWORD=your_secure_postgres_password_here
POSTGRES_DB=cooling_manager
POSTGRES_USER=cooling_user

# Redis
REDIS_PASSWORD=your_secure_redis_password_here

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=your_super_secure_jwt_secret_64_chars_minimum_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_64_chars_minimum_here

# Domain
DOMAIN=iotmanage111.xyz
API_DOMAIN=api.iotmanage111.xyz

# SSL
SSL_EMAIL=admin@iotmanage111.xyz
```

### **Backend Environment (backend/.env.production)**

```env
# Server Configuration
NODE_ENV=production
PORT=5000
API_PREFIX=/api

# Database Configuration
DATABASE_URL=postgresql://cooling_user:${POSTGRES_PASSWORD}@postgres:5432/cooling_manager

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://iotmanage111.xyz,https://www.iotmanage111.xyz

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=warn
LOG_FILE=logs/app.log

# Socket.IO Configuration
SOCKET_IO_CORS_ORIGIN=https://iotmanage111.xyz,https://www.iotmanage111.xyz

# Redis Configuration
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=${JWT_SECRET}

# Monitoring
HEALTH_CHECK_INTERVAL=30000
SENSOR_DATA_RETENTION_DAYS=90

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@iotmanage111.xyz
SMTP_PASS=your_email_app_password
```

### **Frontend Environment (frontend/.env.production)**

```env
# Production API Configuration
VITE_API_URL=https://api.iotmanage111.xyz/api
VITE_SOCKET_URL=https://api.iotmanage111.xyz

# Application Information
VITE_APP_NAME=Cooling Manager
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=IoT Cooling System Management

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_PWA=true

# Production Settings
VITE_DEBUG_MODE=false
VITE_ENABLE_DEV_TOOLS=false
VITE_LOG_LEVEL=warn

# Security
VITE_ENABLE_CSP=true
VITE_FORCE_HTTPS=true
VITE_SESSION_TIMEOUT=60

# Performance
VITE_ENABLE_LAZY_LOADING=true
VITE_ENABLE_IMAGE_OPTIMIZATION=true
VITE_ENABLE_CODE_SPLITTING=true

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

## 🚀 **Step 8: Deployment Execution**

### **Build and Deploy**

```bash
# Navigate to project directory
cd /home/deploy/IoT_Manage_111_Web

# Set production environment
export NODE_ENV=production

# Load environment variables
source .env.production

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### **Database Migration and Seeding**

```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Seed production data
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed:prod

# Verify database connection
docker-compose -f docker-compose.prod.yml exec backend npm run db:status
```

## 🔥 **Step 9: Firewall Configuration**

### **UFW Firewall Setup**

```bash
# Enable UFW
sudo ufw enable

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change 22 to your custom port if modified)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow internal Docker network (optional)
sudo ufw allow from 172.16.0.0/12

# Check status
sudo ufw status verbose
```

## 📊 **Step 10: Monitoring and Health Checks**

### **Health Check Script**

```bash
#!/bin/bash
# /home/deploy/scripts/health-check.sh

DOMAIN="iotmanage111.xyz"
API_DOMAIN="api.iotmanage111.xyz"
LOG_FILE="/var/log/cooling-manager-health.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check frontend
if curl -f -s "https://$DOMAIN" > /dev/null; then
    log "Frontend: OK"
else
    log "Frontend: FAILED"
    # Send alert (email, Slack, etc.)
fi

# Check API health
if curl -f -s "https://$API_DOMAIN/health" > /dev/null; then
    log "API: OK"
else
    log "API: FAILED"
    # Send alert
fi

# Check database
if docker-compose -f /home/deploy/IoT_Manage_111_Web/docker-compose.prod.yml exec -T postgres pg_isready > /dev/null; then
    log "Database: OK"
else
    log "Database: FAILED"
    # Send alert
fi
```

### **Monitoring Setup**

```bash
# Make health check executable
chmod +x /home/deploy/scripts/health-check.sh

# Add to crontab for regular checks
crontab -e
# Add: */5 * * * * /home/deploy/scripts/health-check.sh

# Set up log rotation
sudo tee /etc/logrotate.d/cooling-manager << EOF
/var/log/cooling-manager-health.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 deploy deploy
}
EOF
```

## 🔄 **Step 11: Backup Strategy**

### **Database Backup Script**

```bash
#!/bin/bash
# /home/deploy/scripts/backup.sh

BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
POSTGRES_CONTAINER="cooling_postgres"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker exec $POSTGRES_CONTAINER pg_dump -U cooling_user cooling_manager > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://your-backup-bucket/
```

### **Automated Backups**

```bash
# Make backup script executable
chmod +x /home/deploy/scripts/backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /home/deploy/scripts/backup.sh
```

## 🔧 **Step 12: Maintenance and Updates**

### **Update Deployment Script**

```bash
#!/bin/bash
# /home/deploy/scripts/update.sh

cd /home/deploy/IoT_Manage_111_Web

# Pull latest changes
git pull origin production

# Backup database before update
/home/deploy/scripts/backup.sh

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Run any new migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Health check
sleep 30
/home/deploy/scripts/health-check.sh
```

## 🚨 **Step 13: SSL Certificate Auto-Renewal**

### **Certbot Renewal Hook**

```bash
# Create renewal hook script
sudo tee /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << EOF
#!/bin/bash
docker-compose -f /home/deploy/IoT_Manage_111_Web/docker-compose.prod.yml restart nginx
EOF

# Make executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh

# Test renewal
sudo certbot renew --dry-run
```

## 📈 **Step 14: Performance Optimization**

### **System Optimization**

```bash
# Increase file limits
echo "deploy soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "deploy hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize kernel parameters
sudo tee -a /etc/sysctl.conf << EOF
# Network optimization
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 10
EOF

# Apply changes
sudo sysctl -p
```

## ✅ **Step 15: Verification and Testing**

### **Production Testing Checklist**

```bash
# 1. Test domain resolution
nslookup iotmanage111.xyz
nslookup api.iotmanage111.xyz

# 2. Test SSL certificates
curl -I https://iotmanage111.xyz
curl -I https://api.iotmanage111.xyz

# 3. Test application functionality
curl -X POST https://api.iotmanage111.xyz/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 4. Test WebSocket connections
# Use browser developer tools to verify Socket.IO connections

# 5. Load testing (optional)
# Use tools like Apache Bench or Artillery.js
ab -n 1000 -c 10 https://iotmanage111.xyz/
```

## 🎯 **Final Production URLs**

- **Main Application**: https://iotmanage111.xyz
- **API Endpoint**: https://api.iotmanage111.xyz/api
- **Health Check**: https://api.iotmanage111.xyz/health
- **WebSocket**: wss://api.iotmanage111.xyz/socket.io

## 🔐 **Production Credentials**

- **Admin User**: `admin` / `admin123` (change immediately)
- **Database**: `cooling_user` / `[from .env.production]`
- **Redis**: `[from .env.production]`

## 📞 **Support and Troubleshooting**

### **Common Issues**

1. **SSL Certificate Issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --force-renewal
   ```

2. **Docker Container Issues**
   ```bash
   docker-compose -f docker-compose.prod.yml logs [service_name]
   docker-compose -f docker-compose.prod.yml restart [service_name]
   ```

3. **Database Connection Issues**
   ```bash
   docker-compose -f docker-compose.prod.yml exec postgres psql -U cooling_user -d cooling_manager
   ```

4. **Nginx Configuration Issues**
   ```bash
   docker-compose -f docker-compose.prod.yml exec nginx nginx -t
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

---

**🎉 Your Cooling Manager IoT application is now deployed to production at https://iotmanage111.xyz!**
