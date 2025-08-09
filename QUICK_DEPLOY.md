# 🚀 Quick Production Deployment Guide - iotmanage111.xyz

## 📋 **Prerequisites Checklist**

- [ ] Domain `iotmanage111.xyz` purchased and DNS configured
- [ ] Cloud server (2GB RAM, 2 CPU, 20GB storage minimum)
- [ ] SSH access to server
- [ ] Docker and Docker Compose installed

## ⚡ **Quick Deployment Steps**

### **1. Server Setup (5 minutes)**

```bash
# Connect to your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx and Certbot
apt install -y nginx certbot python3-certbot-nginx

# Create deploy user
adduser deploy
usermod -aG docker deploy
usermod -aG sudo deploy
```

### **2. DNS Configuration (2 minutes)**

Configure these DNS records for `iotmanage111.xyz`:

```dns
@               A       YOUR_SERVER_IP
www             A       YOUR_SERVER_IP
api             A       YOUR_SERVER_IP
```

### **3. Clone and Configure (3 minutes)**

```bash
# Switch to deploy user
su - deploy

# Clone repository
git clone https://github.com/minh3016/IoT_Manage_111_Web.git
cd IoT_Manage_111_Web

# Copy production environment
cp .env.production .env

# Edit environment file (IMPORTANT!)
nano .env
```

**⚠️ CRITICAL: Update these values in `.env`:**
```env
POSTGRES_PASSWORD=your_secure_32_char_password_here
REDIS_PASSWORD=your_secure_32_char_password_here
JWT_SECRET=your_super_secure_64_char_jwt_secret_here
JWT_REFRESH_SECRET=your_super_secure_64_char_refresh_secret_here
```

### **4. SSL Certificate Setup (2 minutes)**

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d iotmanage111.xyz -d www.iotmanage111.xyz -d api.iotmanage111.xyz

# Start nginx
sudo systemctl start nginx
```

### **5. Deploy Application (5 minutes)**

```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh production --seed
```

### **6. Verify Deployment (2 minutes)**

```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# Test endpoints
curl https://iotmanage111.xyz
curl https://api.iotmanage111.xyz/health

# Check logs if needed
docker-compose -f docker-compose.production.yml logs -f
```

## 🎯 **Access Your Application**

- **Main App**: https://iotmanage111.xyz
- **API**: https://api.iotmanage111.xyz/api
- **Health**: https://api.iotmanage111.xyz/health

## 🔐 **Default Login Credentials**

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | ADMIN |
| `tech1` | `tech123` | TECHNICIAN |
| `user1` | `user123` | USER |

**⚠️ Change these passwords immediately after first login!**

## 🔧 **Common Commands**

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart services
docker-compose -f docker-compose.production.yml restart

# Update application
git pull origin production
./scripts/deploy.sh production

# Backup database
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U cooling_user cooling_manager > backup.sql

# Scale services
docker-compose -f docker-compose.production.yml up -d --scale backend=2
```

## 🚨 **Troubleshooting**

### **SSL Certificate Issues**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### **Container Issues**
```bash
docker-compose -f docker-compose.production.yml logs [service_name]
docker-compose -f docker-compose.production.yml restart [service_name]
```

### **Database Issues**
```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U cooling_user -d cooling_manager
```

### **Permission Issues**
```bash
sudo chown -R deploy:deploy /home/deploy/IoT_Manage_111_Web
sudo chmod 600 .env
```

## 📊 **Monitoring Setup**

```bash
# Add health check to crontab
crontab -e
# Add: */5 * * * * /home/deploy/IoT_Manage_111_Web/scripts/health-check.sh

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

## 🔄 **Auto-Renewal Setup**

```bash
# Add SSL auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook "docker-compose -f /home/deploy/IoT_Manage_111_Web/docker-compose.production.yml restart nginx"
```

## 🎉 **Success!**

Your Cooling Manager IoT application is now live at:
**https://iotmanage111.xyz**

## 📞 **Support**

- **Documentation**: `/docs` directory
- **Issues**: GitHub Issues
- **Logs**: `docker-compose logs -f`

---

**Total Deployment Time: ~20 minutes** ⏱️
