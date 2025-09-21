# ABM² Digital Lab - Production Deployment Guide

Complete guide for deploying the ABM² Digital Lab system in production environments with authentication, SSL, and monitoring.

[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](#)
[![Production](https://img.shields.io/badge/Production-Ready-green.svg)](#)
[![Security](https://img.shields.io/badge/Security-Basic%20Auth-orange.svg)](#)

## 📋 Table of Contents

- [Environment Types](#environment-types)
- [Resource Requirements](#resource-requirements)
- [Security Setup](#security-setup)
- [Production Deployment](#production-deployment)
- [SSL Configuration](#ssl-configuration)
- [Process Management](#process-management)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## 🏗️ Environment Types

| Environment | Purpose | Hardware | Availability |
|-------------|---------|----------|--------------|
| **Development** | Local development | 8GB RAM, 2 CPU | Not critical |
| **Staging** | Pre-production tests | 16GB RAM, 4 CPU | High |
| **Production** | Live system | 32GB+ RAM, 8+ CPU | Critical (99.9%) |

## 💻 Resource Requirements

### 📊 Recommended Configurations

| Scenario | vCPUs | RAM | SSD | Agents | Concurrent Users | Monthly Cost |
|----------|-------|-----|-----|---------|------------------|--------------|
| **Minimal** | 2 | 4 GB | 20 GB | 100-200 | 1-2 | ~$20 |
| **Standard** | 4 | 8 GB | 40 GB | 500-800 | 3-5 | ~$40 |
| **Performance** | 8 | 16 GB | 80 GB | 1000+ | 5-10 | ~$80 |

### 🌐 Cloud Provider Recommendations

#### Hetzner Cloud (Europe)
```bash
# Standard Configuration
CX31: 4 vCPU, 8 GB RAM, 80 GB SSD
Price: €8.90/month
Ideal for: European users, GDPR compliance
```

#### DigitalOcean
```bash
# Standard Droplet
4 vCPU, 8 GB RAM, 80 GB SSD
Price: $48/month
Ideal for: Global availability
```

#### AWS EC2
```bash
# t3.large instance
2 vCPU, 8 GB RAM + 40 GB gp3
Price: ~$60/month
Ideal for: AWS ecosystem integration
```

## 🔐 Security Setup

### 🔑 Authentication Configuration

#### 1. Update Default Credentials
```bash
cd digital-lab/backend
cp .env.production .env
nano .env
```

```bash
# Required: Change these credentials!
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_very_secure_password_here

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security Settings
LOG_LEVEL=INFO
FORMULA_REGISTRY_ENABLED=false
REGISTRY_RBAC_MODE=enforced

# Performance Limits
MAX_AGENTS=500
```

#### 2. Firewall Configuration
```bash
# Ubuntu/Debian firewall setup
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP (redirects to HTTPS)
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Optional: Allow direct access for testing
# sudo ufw allow 3000  # Frontend (development only)
# sudo ufw allow 8000  # Backend API (development only)
```

### 🛡️ Additional Security Measures

#### IP Whitelist (Optional)
```bash
# In .env file
ALLOWED_IPS=1.2.3.4,5.6.7.8
```

#### Rate Limiting
```bash
# Install fail2ban for additional protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🚀 Production Deployment

### 📦 Quick Production Setup

#### 1. System Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx certbot python3-certbot-nginx

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Application Setup
```bash
# Clone repository
git clone <your-repository-url> abm2
cd abm2

# Backend setup
cd digital-lab/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.production .env
nano .env  # Update credentials and domain

# Frontend setup
cd ../frontend
npm install
npm run build
```

#### 3. Start Services
```bash
# Start backend with PM2
cd digital-lab/backend
source venv/bin/activate
pm2 start "python main.py" --name abm2-backend

# Serve frontend build
cd ../frontend
pm2 serve build 3000 --name abm2-frontend

# Save PM2 configuration
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

## 🔒 SSL Configuration

### 📜 SSL Certificate with Let's Encrypt

#### 1. Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/abm2
```

```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (React build)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Rate limiting configuration
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
}
```

#### 2. Enable Site and Get SSL Certificate
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/abm2 /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Reload nginx
sudo systemctl reload nginx
```

## 🔄 Process Management

### 📊 PM2 Management Commands

#### Basic Operations
```bash
# View all processes
pm2 list

# View logs
pm2 logs abm2-backend
pm2 logs abm2-frontend

# Restart services
pm2 restart abm2-backend
pm2 restart abm2-frontend

# Stop services
pm2 stop abm2-backend
pm2 stop abm2-frontend

# Monitor resources
pm2 monit
```

#### Configuration File (ecosystem.config.js)
```javascript
module.exports = {
  apps: [
    {
      name: 'abm2-backend',
      script: 'main.py',
      cwd: '/path/to/abm2/digital-lab/backend',
      interpreter: '/path/to/abm2/digital-lab/backend/venv/bin/python',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'abm2-frontend',
      script: 'serve',
      args: 'build -l 3000',
      cwd: '/path/to/abm2/digital-lab/frontend',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

### 🔧 Systemd Service (Alternative)

#### Backend Service
```bash
sudo nano /etc/systemd/system/abm2-backend.service
```

```ini
[Unit]
Description=ABM2 Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/abm2/digital-lab/backend
Environment=PATH=/path/to/abm2/digital-lab/backend/venv/bin
ExecStart=/path/to/abm2/digital-lab/backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable abm2-backend
sudo systemctl start abm2-backend
```

## 📊 Monitoring & Logging

### 📈 System Monitoring

#### Setup Monitoring Tools
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/abm2
```

```
/path/to/abm2/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

#### Health Check Script
```bash
#!/bin/bash
# health-check.sh

API_URL="https://yourdomain.com/api/health"
LOG_FILE="/var/log/abm2-health.log"

response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -eq 200 ]; then
    echo "$(date): API healthy (HTTP $response)" >> $LOG_FILE
else
    echo "$(date): API unhealthy (HTTP $response)" >> $LOG_FILE
    # Optional: restart services
    # pm2 restart abm2-backend
fi
```

#### Setup Cron Job
```bash
# Add to crontab
crontab -e

# Check health every 5 minutes
*/5 * * * * /path/to/health-check.sh
```

### 📋 Log Management

#### Nginx Access Logs
```bash
# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

#### Application Logs
```bash
# PM2 logs
pm2 logs abm2-backend --lines 100
pm2 logs abm2-frontend --lines 100

# System logs
sudo journalctl -u nginx -f
```

## 💾 Backup & Recovery

### 🗃️ Backup Strategy

#### Configuration Backup
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/abm2/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup configuration
cp /path/to/abm2/digital-lab/backend/.env $BACKUP_DIR/
cp -r /path/to/abm2/digital-lab/backend/presets $BACKUP_DIR/
cp -r /path/to/abm2/digital-lab/backend/recordings $BACKUP_DIR/

# Backup nginx configuration
cp /etc/nginx/sites-available/abm2 $BACKUP_DIR/

# Create archive
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

#### Automated Backups
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

### 🔄 Recovery Procedure

#### Quick Recovery
```bash
# Restore from backup
tar -xzf backup_file.tar.gz
cp backup/configs/* /path/to/abm2/digital-lab/backend/

# Restart services
pm2 restart all
sudo systemctl reload nginx
```

## 🔧 Troubleshooting

### 🚨 Common Issues

#### Authentication Problems
```bash
# Check if credentials are set correctly
grep "ADMIN_" /path/to/abm2/digital-lab/backend/.env

# Test login
curl -u username:password https://yourdomain.com/api/health
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Check nginx SSL configuration
sudo nginx -t
```

#### Performance Issues
```bash
# Check system resources
htop
iotop
df -h

# Check PM2 processes
pm2 monit

# Check application logs
pm2 logs abm2-backend --lines 50
```

#### WebSocket Connection Issues
```bash
# Test WebSocket connection
wscat -c wss://yourdomain.com/ws

# Check nginx WebSocket configuration
sudo nginx -t
sudo systemctl status nginx
```

### 📞 Getting Help

#### Log Analysis
```bash
# Check all relevant logs
sudo journalctl -u nginx -f
pm2 logs --lines 100
tail -f /var/log/abm2-health.log
```

#### System Status
```bash
# Check all services
sudo systemctl status nginx
pm2 status
sudo ufw status
```

#### Network Connectivity
```bash
# Test internal connections
curl http://localhost:8000/api/health
curl http://localhost:3000

# Test external access
curl https://yourdomain.com/api/health
```

## 🎉 Deployment Checklist

### ✅ Pre-Deployment
- [ ] Update default credentials in `.env`
- [ ] Configure domain in `ALLOWED_ORIGINS`
- [ ] Setup DNS records
- [ ] Prepare SSL certificate

### ✅ Deployment
- [ ] Install system dependencies
- [ ] Deploy application code
- [ ] Configure nginx
- [ ] Setup SSL certificate
- [ ] Start services with PM2

### ✅ Post-Deployment
- [ ] Test login functionality
- [ ] Verify SSL certificate
- [ ] Check WebSocket connections
- [ ] Setup monitoring and backups
- [ ] Document access credentials

**🎯 Your ABM² Digital Lab is now ready for production use!**