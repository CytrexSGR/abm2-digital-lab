# ABM² Digital Lab - Production Deployment Guide

Complete deployment guide with troubleshooting documentation for the ABM² Digital Lab system.

## Quick Start

```bash
# 1. Clone repository
git clone [repository-url]
cd abm2-digital-lab

# 2. Setup backend
cd digital-lab/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Note: You may need to install additional dependencies like networkx

# 3. Setup frontend
cd ../frontend
npm install

# 4. Configure environment
cp .env.example .env
# Edit .env with your specific configuration

# 5. Start services
# Backend (in backend directory with venv activated):
python main.py

# Frontend (in frontend directory):
npm start
```

## System Requirements

- **OS:** Ubuntu 20.04+ or similar Linux distribution
- **Python:** 3.8+ with python3-venv package
- **Node.js:** 16+ with npm
- **Nginx:** For production reverse proxy (optional)
- **Network:** Proper firewall configuration for external access

## Environment Configuration

### Backend (.env)
```env
# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[secure_password]
SECRET_KEY=[generate_secure_secret]

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://[SERVER_IP],http://[SERVER_IP]:3000

# Logging
LOG_LEVEL=INFO
```

### Frontend (.env)
```env
# API Configuration
REACT_APP_API_BASE_URL=http://[SERVER_IP]:8000

# Development Server (for webpack dev server)
WDS_SOCKET_HOST=localhost
WDS_SOCKET_PORT=3000
WDS_SOCKET_PATH=/ws
```

## Nginx Configuration (Production)

For production deployment with external access, configure nginx as reverse proxy:

```nginx
# /etc/nginx/sites-available/abm2-digital-lab
server {
    listen 80;
    server_name [YOUR_PUBLIC_IP_OR_DOMAIN];

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Frontend (catch-all for React Router)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/abm2-digital-lab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Common Issues and Solutions

### 1. Python Virtual Environment Issues
**Problem:** `ensurepip is not available`
```bash
# Ubuntu/Debian
sudo apt install python3-venv python3-pip
```

### 2. Missing Python Dependencies
**Problem:** `ModuleNotFoundError: No module named 'networkx'`
```bash
pip install networkx
# Or update requirements.txt with all dependencies
```

### 3. FastAPI Import Errors
**Problem:** `NameError: name 'Depends' is not defined`
**Solution:** Update FastAPI imports in main.py:
```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Body, Query, Request, Depends
```

### 4. React Build Issues
**Problem:** `Could not find a required file: index.html`
**Solution:** Create missing public/index.html:
```bash
mkdir -p digital-lab/frontend/public
```

Create `public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ABM² Digital Lab</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 5. TypeScript Compatibility
**Problem:** `Type 'string | null' is not assignable to type 'string | undefined'`
**Solution:** Use null coalescing operator:
```typescript
// Convert null to undefined for React props
<Component error={error || undefined} />
```

### 6. Proxy Configuration
**Problem:** Proxy connection refused
**Solution:** Update package.json proxy setting:
```json
{
  "proxy": "http://[SERVER_IP]:8000"
}
```

### 7. UI Performance (Chart Flickering)
**Problem:** React charts flickering due to re-renders
**Solution:** Move static objects outside component scope:
```typescript
// Outside component to prevent re-creation
const templateColors = {
    'liberal': '#3498db',
    'links': '#e74c3c',
    // ...
};

// Use useMemo for chart data
const chartData = useMemo(() => processData(rawData), [rawData]);
```

### 8. WebSocket Connection Issues
**Problem:** WebSocket connection refused
**Solution:**
1. Check CORS settings in backend
2. Verify WebSocket URL construction
3. Ensure nginx WebSocket proxy configuration

### 9. External Access Issues
**Problem:** External access fails with API routing errors
**Solutions:**
1. **Avoid double API paths** - Set `REACT_APP_API_BASE_URL` without `/api` suffix
2. **Clear React cache** - Delete `node_modules/.cache` and restart
3. **Kill multiple frontend processes** - Use `pkill -f "npm|node"` to clean up

## Network Access

### Local Development
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

### LAN Access
- Backend: http://[SERVER_IP]:8000
- Frontend: http://[SERVER_IP]:3000
- API Docs: http://[SERVER_IP]:8000/docs

### Production (with Nginx)
- Application: http://[PUBLIC_IP]/
- API: http://[PUBLIC_IP]/api/
- WebSocket: ws://[PUBLIC_IP]/ws

## Router Configuration

For internet access, configure port forwarding:
- **Port 80** → [SERVER_IP]:80 (HTTP)
- **Port 443** → [SERVER_IP]:443 (HTTPS, optional)

## Security Considerations

1. **Change default passwords** before production deployment
2. **Use strong SECRET_KEY** for JWT tokens
3. **Configure firewall** to limit access to necessary ports
4. **Enable HTTPS** with SSL certificates for production
5. **Update CORS origins** to match your domain structure

## Service Management

### Start Services
```bash
# Backend (in virtual environment)
cd digital-lab/backend
source venv/bin/activate
python main.py

# Frontend
cd digital-lab/frontend
npm start

# Production mode (disable source maps for better performance)
GENERATE_SOURCEMAP=false npm start
```

### Process Management
```bash
# Check running processes
ps aux | grep -E "(python.*main.py|npm.*start)"

# Kill processes if needed
pkill -f "python.*main.py"
pkill -f "npm.*start"
```

## Verification

After deployment, verify functionality:

1. **API Health Check:** GET http://[SERVER_IP]:8000/api/health
2. **Frontend Loading:** http://[SERVER_IP]:3000
3. **WebSocket Connection:** Check browser developer tools
4. **Authentication:** Login with configured credentials
5. **Simulation Data:** Verify charts and data loading

## Performance Optimization

1. **Disable source maps** in production: `GENERATE_SOURCEMAP=false`
2. **Use production builds** for frontend deployment
3. **Configure nginx caching** for static assets
4. **Monitor memory usage** for Python processes
5. **Implement proper logging** levels

## Monitoring

Watch logs for issues:
```bash
# Backend logs (if configured)
tail -f backend.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System resources
htop
```

---

This guide covers all major deployment scenarios and common issues encountered during installation and configuration of the ABM² Digital Lab system.