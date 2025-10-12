# ABM² Einfaches Public Deployment

## 🔐 Single-User Authentication Setup

Das System wurde mit einfacher HTTP Basic Authentication für einen Administrator-User erweitert.

### 📋 Vor dem Deployment

1. **Passwort ändern** in `.env.production`:
```bash
cd digital-lab/backend
cp .env.production .env
# Bearbeite .env und ändere:
ADMIN_USERNAME=ihr_benutzername
ADMIN_PASSWORD=ihr_sicheres_passwort_hier
```

2. **Domain konfigurieren**:
```bash
# In .env:
ALLOWED_ORIGINS=https://ihre-domain.com,https://www.ihre-domain.com
```

### 🚀 Schnelle VM-Bereitstellung

#### 1. Backend starten
```bash
cd digital-lab/backend
pip install -r requirements.txt
python main.py
# Läuft auf 0.0.0.0:8000
```

#### 2. Frontend starten
```bash
cd digital-lab/frontend
npm install
npm run build
npm install -g serve
serve -s build -l 3000
# Läuft auf 0.0.0.0:3000
```

#### 3. Firewall konfigurieren
```bash
sudo ufw allow 3000
sudo ufw allow 8000
sudo ufw enable
```

### 🌐 Mit SSL (Empfohlen)

#### Nginx Reverse Proxy
```bash
sudo apt install nginx certbot python3-certbot-nginx

# Nginx Konfiguration
sudo nano /etc/nginx/sites-available/abm2
```

```nginx
server {
    listen 80;
    server_name ihre-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name ihre-domain.com;

    # SSL wird von certbot automatisch konfiguriert

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
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
}
```

```bash
# Nginx aktivieren
sudo ln -s /etc/nginx/sites-available/abm2 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL-Zertifikat
sudo certbot --nginx -d ihre-domain.com
```

### 🔒 Was ist jetzt geschützt?

- ✅ Simulation Reset (`/api/simulation/reset`)
- ✅ Simulation Step (`/api/simulation/step`)
- ✅ Konfiguration ändern (`/api/config`, `/api/config/patch`)
- ✅ Login-Interface im Frontend
- ✅ Automatische Weiterleitung zum Login
- ✅ Session-Speicherung im Browser

### 📱 Benutzung

1. **Öffnen Sie https://ihre-domain.com**
2. **Anmelden** mit konfigurierten Credentials
3. **Alle Funktionen verfügbar** nach erfolgreichem Login
4. **Automatisches Abmelden** bei Session-Ablauf

### ⚠️ Sicherheitshinweise

- **Passwort ändern!** Standard-Passwort vor Deployment ändern
- **HTTPS verwenden** für Produktion (Login-Daten werden übertragen)
- **Regelmäßige Updates** des Systems
- **Backup der Konfiguration** vor größeren Änderungen

### 🔧 Troubleshooting

**Login funktioniert nicht:**
```bash
# Backend-Logs prüfen
cd digital-lab/backend
python main.py
# Schauen Sie nach 401 Unauthorized Fehlern
```

**CORS-Fehler:**
```bash
# ALLOWED_ORIGINS in .env prüfen
echo $ALLOWED_ORIGINS
# Muss Ihre Domain enthalten
```

**WebSocket-Verbindung fehlschlägt:**
```bash
# Nginx WebSocket-Konfiguration prüfen
sudo nginx -t
sudo systemctl status nginx
```

Das war's! Das System ist jetzt sicher für öffentliche Nutzung mit einem Administrator-Account.