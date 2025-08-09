# 🚀 Deployment Guide

Comprehensive deployment guide for the Cooling Manager IoT application covering development, staging, and production environments.

## 📋 Prerequisites

### System Requirements
- **Node.js 18+** and npm
- **PostgreSQL 12+** database
- **Docker & Docker Compose** (recommended)
- **Git** for version control
- **SSL Certificate** (for production HTTPS)

### Cloud Requirements (Production)
- **Server**: 2+ CPU cores, 4GB+ RAM, 20GB+ storage
- **Database**: PostgreSQL instance with backup
- **Domain**: Custom domain with SSL certificate
- **CDN**: Optional for static asset delivery

## 🐳 Docker Deployment (Recommended)

### Development Environment

1. **Clone and setup**
   ```bash
   git clone https://github.com/minh3016/IoT_Manage_111_Web.git
   cd IoT_Manage_111_Web
   cp .env.example .env
   ```

2. **Configure environment**
   ```bash
   # Edit .env file
   DATABASE_URL=postgresql://postgres:password@postgres:5432/cooling_manager
   JWT_SECRET=your-development-jwt-secret-key
   JWT_REFRESH_SECRET=your-development-refresh-secret-key
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Initialize database**
   ```bash
   docker-compose exec backend npm run db:migrate
   docker-compose exec backend npm run db:seed
   ```

### Production Environment

1. **Production configuration**
   ```bash
   cp .env.example .env.production
   ```

   Edit `.env.production`:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@your-db-host:5432/cooling_manager
   JWT_SECRET=your-super-secure-jwt-secret-32-chars-minimum
   JWT_REFRESH_SECRET=your-super-secure-refresh-secret-32-chars-minimum
   CORS_ORIGIN=https://your-domain.com
   REDIS_URL=redis://your-redis-host:6379
   ```

2. **Deploy with production compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Setup SSL with Let's Encrypt**
   ```bash
   # Install certbot
   sudo apt install certbot python3-certbot-nginx

   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com

   # Auto-renewal
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## 🔧 Manual Deployment

### Backend Deployment

1. **Server setup**
   ```bash
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PostgreSQL
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # Create database
   sudo -u postgres createdb cooling_manager
   sudo -u postgres createuser --interactive
   ```

2. **Application deployment**
   ```bash
   cd backend
   npm install --production
   npm run build

   # Environment setup
   cp .env.example .env
   # Edit .env with production values

   # Database setup
   npm run db:generate
   npm run db:migrate
   npm run db:seed

   # Start with PM2
   npm install -g pm2
   pm2 start dist/server.js --name cooling-manager-backend
   pm2 startup
   pm2 save
   ```

### Frontend Deployment

1. **Build application**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Nginx setup**
   ```bash
   sudo apt install nginx

   # Create nginx config
   sudo nano /etc/nginx/sites-available/cooling-manager
   ```

   Nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/cooling-manager;
       index index.html;

       # Frontend static files
       location / {
           try_files $uri $uri/ /index.html;
       }

       # API proxy
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       # Socket.IO proxy
       location /socket.io/ {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/cooling-manager /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## ☁️ Cloud Deployment

### AWS Deployment

#### EC2 + RDS Setup

1. **Launch EC2 instance**
   - Instance type: t3.medium or larger
   - OS: Ubuntu 20.04 LTS
   - Security groups: HTTP (80), HTTPS (443), SSH (22), Custom (5000)

2. **RDS PostgreSQL setup**
   - Engine: PostgreSQL 14+
   - Instance class: db.t3.micro (development) or db.t3.small (production)
   - Storage: 20GB+ with auto-scaling

3. **Deploy application**
   ```bash
   # Connect to EC2
   ssh -i your-key.pem ubuntu@your-ec2-ip

   # Install dependencies
   sudo apt update
   sudo apt install -y nodejs npm nginx postgresql-client

   # Clone and deploy
   git clone https://github.com/minh3016/IoT_Manage_111_Web.git
   cd IoT_Manage_111_Web

   # Backend deployment
   cd backend
   npm install --production
   npm run build
   
   # Configure environment with RDS endpoint
   cp .env.example .env
   # DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/cooling_manager

   # Start with PM2
   npm install -g pm2
   pm2 start dist/server.js --name cooling-manager-backend

   # Frontend deployment
   cd ../frontend
   npm install
   npm run build
   sudo cp -r dist/* /var/www/html/
   ```

#### ECS + Fargate (Advanced)

1. **Create ECR repositories**
   ```bash
   aws ecr create-repository --repository-name cooling-manager-frontend
   aws ecr create-repository --repository-name cooling-manager-backend
   ```

2. **Build and push images**
   ```bash
   # Build and push backend
   cd backend
   docker build -f Dockerfile.node -t cooling-manager-backend .
   docker tag cooling-manager-backend:latest your-account.dkr.ecr.region.amazonaws.com/cooling-manager-backend:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/cooling-manager-backend:latest

   # Build and push frontend
   cd ../frontend
   docker build -t cooling-manager-frontend .
   docker tag cooling-manager-frontend:latest your-account.dkr.ecr.region.amazonaws.com/cooling-manager-frontend:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/cooling-manager-frontend:latest
   ```

3. **Create ECS task definitions and services**
   - Use AWS Console or CloudFormation templates
   - Configure load balancer for high availability

### Google Cloud Platform

1. **Cloud Run deployment**
   ```bash
   # Enable APIs
   gcloud services enable run.googleapis.com
   gcloud services enable sql-component.googleapis.com

   # Create Cloud SQL instance
   gcloud sql instances create cooling-manager-db \
     --database-version=POSTGRES_14 \
     --tier=db-f1-micro \
     --region=us-central1

   # Deploy backend
   cd backend
   gcloud run deploy cooling-manager-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated

   # Deploy frontend
   cd ../frontend
   gcloud run deploy cooling-manager-frontend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### DigitalOcean

1. **Droplet setup**
   ```bash
   # Create droplet (2GB RAM minimum)
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy with Docker Compose**
   ```bash
   git clone https://github.com/minh3016/IoT_Manage_111_Web.git
   cd IoT_Manage_111_Web
   cp .env.example .env
   # Edit .env with production values
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Let's Encrypt (Free)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **Custom Certificate**
   ```nginx
   server {
       listen 443 ssl http2;
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
   }
   ```

### Firewall Configuration

```bash
# UFW setup
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Specific ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw deny 5000   # Block direct backend access
```

### Environment Security

```bash
# Secure environment file
sudo chown root:root .env
sudo chmod 600 .env

# Database security
sudo -u postgres psql
ALTER USER postgres PASSWORD 'strong-password';
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **PM2 Monitoring**
   ```bash
   pm2 monit
   pm2 logs cooling-manager-backend
   ```

2. **Health Checks**
   ```bash
   # Setup health check monitoring
   curl -f http://localhost:5000/health || exit 1
   ```

### Log Management

1. **Centralized logging**
   ```bash
   # Install log rotation
   sudo nano /etc/logrotate.d/cooling-manager
   ```

   ```
   /var/log/cooling-manager/*.log {
       daily
       missingok
       rotate 52
       compress
       delaycompress
       notifempty
       create 644 www-data www-data
   }
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Build and test
        run: |
          cd backend && npm ci && npm run build && npm test
          cd ../frontend && npm ci && npm run build && npm test
          
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /var/www/cooling-manager
            git pull origin main
            docker-compose -f docker-compose.prod.yml up -d --build
```

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check connection
   psql -h localhost -U postgres -d cooling_manager
   ```

2. **Port already in use**
   ```bash
   # Find process using port
   sudo lsof -i :5000
   
   # Kill process
   sudo kill -9 <PID>
   ```

3. **Permission denied**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /var/www/cooling-manager
   sudo chmod -R 755 /var/www/cooling-manager
   ```

### Performance Optimization

1. **Database optimization**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_devices_status ON devices(status);
   CREATE INDEX idx_sensor_data_device_timestamp ON sensor_data(device_id, timestamp);
   CREATE INDEX idx_activities_timestamp ON activities(timestamp);
   ```

2. **Nginx caching**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

---

**Complete deployment guide for production-ready Cooling Manager application** 🚀
