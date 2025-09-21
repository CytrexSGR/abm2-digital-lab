# ABM² Digital Lab - Quick Installation Guide

Get ABM² Digital Lab running in 5 minutes with authentication and production configuration.

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/abm2-digital-lab.git
cd abm2-digital-lab
```

### 2. Backend Setup
```bash
cd digital-lab/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure authentication (IMPORTANT!)
cp .env.production .env
nano .env  # Change ADMIN_USERNAME and ADMIN_PASSWORD

# Start backend
python main.py
```

### 3. Frontend Setup
```bash
# New terminal
cd digital-lab/frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Access Application
- **URL**: http://localhost:3000
- **Login**: admin / abm2_secure_2024! (change in .env!)
- **Backend API**: http://localhost:8000/docs

## 🔐 Security Configuration

### Change Default Credentials
```bash
# In digital-lab/backend/.env
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
```

### For LAN Access
```bash
# Backend (already configured for 0.0.0.0:8000)
python main.py

# Frontend
HOST=0.0.0.0 npm start
```

## 🌐 Production Deployment

### Resource Requirements
- **Minimal**: 2 vCPU, 4 GB RAM, 20 GB SSD
- **Recommended**: 4 vCPU, 8 GB RAM, 40 GB SSD
- **High Performance**: 8 vCPU, 16 GB RAM, 80 GB SSD

### Cloud Providers
- **Hetzner**: CX31 (€8.90/month) - Recommended
- **DigitalOcean**: 4GB Droplet ($48/month)
- **AWS**: t3.large ($60/month)

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete production setup.

## 📋 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Python | 3.8+ | 3.10+ |
| Node.js | 16.0+ | 18.0+ |
| RAM | 4 GB | 8 GB+ |
| Disk | 20 GB | 40 GB+ |

## 🆘 Troubleshooting

### Authentication Issues
```bash
# Check credentials
grep ADMIN_ digital-lab/backend/.env

# Test login
curl -u username:password http://localhost:8000/api/health
```

### Port Conflicts
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### CORS Errors
```bash
# Update ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=http://localhost:3000,http://your-ip:3000
```

## 📚 Next Steps

1. **Read Documentation**: [README.md](README.md)
2. **Configure System**: [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Explore Features**: Start simulation and explore dashboard
4. **Customize Settings**: Modify agent parameters and biomes

**🎉 You're ready to start simulating political systems with ABM²!**