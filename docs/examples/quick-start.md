# Quick Start Beispiel

## Erste Simulation starten

### 1. System starten
```bash
# Terminal 1: Backend
cd digital-lab/backend
python main.py

# Terminal 2: Frontend
cd digital-lab/frontend
HOST=0.0.0.0 npm start
```

### 2. Browser öffnen
- Navigiere zu `http://localhost:3000`
- Warte auf erfolgreiche Verbindung

### 3. Grundlegende Simulation
1. **Control Panel** → "Reset Simulation" (100 Agenten)
2. **Control Panel** → "Step" für ersten Schritt
3. **Live Dashboard** beobachten

## Beispiel-Konfigurationen

### Kleine Test-Simulation
```json
{
  "num_agents": 20,
  "network_connections": 3
}
```

### Standard-Simulation
```json
{
  "num_agents": 100,
  "network_connections": 5
}
```

### Große Simulation
```json
{
  "num_agents": 500,
  "network_connections": 8
}
```