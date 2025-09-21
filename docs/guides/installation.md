# Installation & Setup Guide

## Systemanforderungen

### Mindestanforderungen
- **Betriebssystem**: Linux, macOS, Windows 10+
- **Python**: 3.8 oder höher
- **Node.js**: 16.0 oder höher
- **RAM**: 4 GB (empfohlen: 8 GB+)
- **Festplatte**: 2 GB freier Speicherplatz

### Empfohlene Anforderungen
- **Python**: 3.10+
- **Node.js**: 18+
- **RAM**: 8 GB+
- **CPU**: Multi-Core Prozessor

## Installation

### 1. Repository klonen/herunterladen

```bash
# Falls Git verfügbar ist
git clone [repository-url] abm2
cd abm2

# Oder ZIP-Datei herunterladen und entpacken
```

### 2. Python Environment einrichten

#### Option A: Virtual Environment (empfohlen)
```bash
# Virtual Environment erstellen
python -m venv venv

# Virtual Environment aktivieren
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Requirements installieren
cd digital-lab/backend
pip install -r requirements.txt
```

#### Option B: Conda Environment
```bash
# Conda Environment erstellen
conda create -n abm2 python=3.10
conda activate abm2

# Requirements installieren
cd digital-lab/backend
pip install -r requirements.txt
```

### 3. Frontend Dependencies installieren

```bash
cd digital-lab/frontend
npm install

# Alternative mit Yarn
yarn install
```

### 4. Konfiguration prüfen

Die Standard-Konfigurationsdateien befinden sich in:
```
digital-lab/backend/political_abm/
├── config.yml
├── media_sources.yml
├── initial_milieus.yml
├── templates.yml
└── output_schablonen.yml
```

## Erste Schritte

### 1. Backend starten

```bash
cd digital-lab/backend
python main.py
```

Der Server startet auf `http://0.0.0.0:8000`

**Erfolgreiche Ausgabe:**
```
Initializing SimulationManager...
Resetting model with 100 agents...
ResourceManager initialized.
HazardManager initialized.
SeasonalityManager initialized.
MediaManager initialized with 3 sources.
New PoliticalModel instance created successfully.
CORS enabled for the following origins: ['http://localhost:3000', 'http://192.168.178.55:3000']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 2. Frontend starten

**Neue Terminal-Session öffnen:**

```bash
cd digital-lab/frontend

# Für lokalen Zugriff
npm start

# Für LAN-Zugriff
HOST=0.0.0.0 npm start
```

Das Frontend startet auf `http://localhost:3000` (lokal) oder `http://[ihre-ip]:3000` (LAN)

### 3. Anwendung testen

1. **Browser öffnen** und zu `http://localhost:3000` navigieren
2. **Health Check**: Besuchen Sie `http://localhost:8000/api/health`
3. **API Dokumentation**: Besuchen Sie `http://localhost:8000/docs`

## Netzwerk-Konfiguration

### LAN-Zugriff aktivieren

#### Backend (bereits konfiguriert)
Das Backend bindet standardmäßig an `0.0.0.0:8000` und ist LAN-weit erreichbar.

#### Frontend für LAN konfigurieren
```bash
# Environment Variable setzen
export HOST=0.0.0.0
npm start

# Oder direkt beim Start
HOST=0.0.0.0 npm start
```

### Firewall-Konfiguration

**Linux (ufw):**
```bash
sudo ufw allow 3000
sudo ufw allow 8000
```

**Windows:**
- Windows Defender Firewall öffnen
- Eingehende Regeln für Port 3000 und 8000 hinzufügen

### IP-Adresse ermitteln

```bash
# Linux/macOS
ip addr show | grep inet
# oder
ifconfig | grep inet

# Windows
ipconfig
```

## Entwicklungsumgebung

### Hot Reload aktivieren

**Backend** (bereits aktiviert):
```bash
# Mit reload-Flag (bereits in main.py)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend** (standardmäßig aktiviert):
React-Scripts unterstützt Hot Reload automatisch.

### Debug-Modus

**Backend Debug:**
```bash
# Mit Debug-Logging
export LOG_LEVEL=DEBUG
python main.py
```

**Frontend Debug:**
```bash
# Mit Source Maps
GENERATE_SOURCEMAP=true npm start
```

## Troubleshooting

### Häufige Probleme

#### Port bereits in Verwendung
```bash
# Prozess auf Port finden
lsof -i :8000
lsof -i :3000

# Prozess beenden
kill -9 [PID]
```

#### Python Dependencies fehlen
```bash
# Requirements neu installieren
pip install --upgrade -r requirements.txt

# Spezifische Pakete
pip install fastapi uvicorn python-dotenv
```

#### Node Dependencies fehlen
```bash
# Cache leeren und neu installieren
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### CORS-Fehler
Prüfen Sie die CORS-Konfiguration in `main.py`:
```python
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
```

#### WebSocket-Verbindung fehlschlägt
1. Backend läuft korrekt
2. Keine Proxy-Server blockieren WebSockets
3. Browser unterstützt WebSockets

### Log-Dateien

**Backend Logs:**
- Uvicorn gibt Logs direkt in der Konsole aus
- Bei Bedarf in Datei umleiten: `python main.py > backend.log 2>&1`

**Frontend Logs:**
- Browser Developer Tools → Console
- Network Tab für API-Requests

### Performance-Optimierung

**Backend:**
- Anzahl Worker anpassen: `uvicorn main:app --workers 4`
- Memory-Limits beachten bei großen Simulationen

**Frontend:**
- Production Build: `npm run build`
- Bundle-Analyse: `npm install -g webpack-bundle-analyzer`

## Deployment

### Production Build

**Frontend:**
```bash
cd digital-lab/frontend
npm run build
```

**Backend:**
```bash
# Mit Gunicorn für Production
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Environment Variables

Erstellen Sie eine `.env` Datei im Backend-Verzeichnis:
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://production-domain.com
LOG_LEVEL=INFO
```

## Deinstallation

```bash
# Virtual Environment deaktivieren
deactivate

# Projektverzeichnis löschen
rm -rf abm2

# Conda Environment löschen (falls verwendet)
conda env remove -n abm2
```