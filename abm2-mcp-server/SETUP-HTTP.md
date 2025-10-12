# ABM² MCP Server - HTTP Setup (FINALE LÖSUNG)

## ✅ Diese Lösung funktioniert!

Der MCP-Server läuft als HTTP-Server auf dem Linux-System und Claude Desktop verbindet sich über Node.js (das auf Windows läuft) per HTTP.

## Schritt 1: Server läuft bereits ✅

Der HTTP-Server läuft bereits auf:
- **URL:** http://192.168.178.77:3002
- **Status:** ✅ Aktiv und authentifiziert

Endpoints:
- `GET /health` - Health Check
- `GET /tools` - Tools auflisten
- `POST /call` - Tool ausführen
- `POST /mcp` - MCP JSON-RPC

## Schritt 2: Client-Datei auf Windows kopieren

Kopiere die Datei `abm2-mcp-http-client.js` auf dein Windows-System, z.B. nach:
```
C:\abm2-mcp\abm2-mcp-http-client.js
```

Du kannst die Datei per SSH/SCP kopieren:
```bash
scp cytrex@192.168.178.77:/home/cytrex/abm2-digital-lab/abm2-mcp-server/abm2-mcp-http-client.js C:\abm2-mcp\
```

Oder manuell den Inhalt kopieren und als JavaScript-Datei speichern.

## Schritt 3: Claude Desktop konfigurieren

Öffne: `%APPDATA%\Claude\claude_desktop_config.json`

Füge hinzu:
```json
{
  "mcpServers": {
    "abm2-digital-lab": {
      "command": "node",
      "args": [
        "C:\\abm2-mcp\\abm2-mcp-http-client.js"
      ],
      "env": {
        "ABM2_MCP_SERVER_URL": "http://192.168.178.77:3002"
      }
    }
  }
}
```

**Wichtig:**
- Passe den Pfad zu `abm2-mcp-http-client.js` an
- Verwende doppelte Backslashes (`\\`) in Windows-Pfaden
- Der HTTP-Server läuft auf Linux und übernimmt die Authentifizierung

## Schritt 4: Claude Desktop neu starten

Schließe Claude Desktop vollständig und starte es neu.

## Schritt 5: Testen

Teste mit:
```
"Führe einen Health Check durch"
"Führe einen Simulationsschritt aus"
"Zeige die aktuellen Simulationsdaten"
```

## Server-Management

### Server Status prüfen
```bash
curl http://192.168.178.77:3002/health
```

### Server neu starten (falls nötig)
```bash
# Alten Prozess finden und beenden
pkill -f "node abm2-mcp-http-server.js"

# Neu starten
cd /home/cytrex/abm2-digital-lab/abm2-mcp-server
nohup node abm2-mcp-http-server.js 3002 > /tmp/abm2-mcp-http.log 2>&1 &
```

### Logs ansehen
```bash
tail -f /tmp/abm2-mcp-http.log
```

## Architektur

```
┌─────────────────┐         HTTP          ┌──────────────────┐
│ Claude Desktop  │────────────────────────│  Linux Server    │
│   (Windows)     │   Port 3002            │ 192.168.178.77   │
│                 │                        │                  │
│ node            │                        │ HTTP MCP Server  │
│ client.js       │◄───────────────────────│ (Port 3002)      │
└─────────────────┘                        │                  │
                                           │ ABM2 Backend     │
                                           │ (Port 8000)      │
                                           └──────────────────┘
```

Der Client auf Windows:
- Läuft mit Node.js (das auf Windows installiert ist)
- Kommuniziert über stdio mit Claude Desktop
- Sendet HTTP-Requests an den Server

Der Server auf Linux:
- Lädt Credentials aus `.env` Datei
- Authentifiziert sich beim ABM2 Backend
- Stellt MCP-Tools über HTTP bereit

## Verfügbare Tools (aktuell 4, erweiterbar auf 39)

- `abm2_health_check` - System Health Check
- `abm2_reset_simulation` - Simulation zurücksetzen
- `abm2_step_simulation` - Simulationsschritt ausführen
- `abm2_get_simulation_data` - Simulationsdaten abrufen

Weitere Tools können einfach im `abm2-mcp-http-server.js` hinzugefügt werden.

## Troubleshooting

### "Connection refused"
- Prüfe ob der Server läuft: `curl http://192.168.178.77:3002/health`
- Prüfe Firewall-Einstellungen
- Stelle sicher Port 3002 ist offen

### "Invalid credentials"
- Die Credentials werden automatisch vom Server aus `.env` geladen
- Prüfe `/home/cytrex/abm2-digital-lab/abm2-mcp-server/.env`

### Tools werden nicht angezeigt
- Starte Claude Desktop neu
- Prüfe Logs: Help > View Logs
- Teste Client-Verbindung: `node C:\abm2-mcp\abm2-mcp-http-client.js`

---

**Status:**
- ✅ HTTP Server läuft (Port 3002)
- ✅ Authentifizierung funktioniert
- ✅ Backend läuft (Port 8000)
- ✅ Frontend läuft (Port 3001)
- ⏳ Claude Desktop Konfiguration ausstehend
