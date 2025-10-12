# ABM² MCP Server - Setup Anleitung

## Schnellstart für Claude Desktop (Windows)

### 1. Claude Desktop Konfiguration bearbeiten

Öffne die Claude Desktop Konfigurationsdatei:
```
%APPDATA%\Claude\claude_desktop_config.json
```

### 2. Füge folgende Konfiguration hinzu:

**Option A: Mit WSL (empfohlen für Windows)**

```json
{
  "mcpServers": {
    "abm2-digital-lab": {
      "command": "wsl",
      "args": [
        "node",
        "/home/cytrex/abm2-digital-lab/abm2-mcp-server/abm2-mcp-bridge.js"
      ]
    }
  }
}
```

**Option B: Mit SSH (falls WSL nicht verfügbar)**

```json
{
  "mcpServers": {
    "abm2-digital-lab": {
      "command": "ssh",
      "args": [
        "cytrex@192.168.178.77",
        "node",
        "/home/cytrex/abm2-digital-lab/abm2-mcp-server/abm2-mcp-bridge.js"
      ]
    }
  }
}
```

**Wichtig:** Die Authentifizierungsdaten werden automatisch aus der `.env` Datei auf dem Server geladen. Du musst sie nicht in der Claude Desktop Konfiguration angeben!

**Wichtig:** Da Claude Desktop auf Windows läuft, aber der MCP-Server auf dem Linux-System (192.168.178.77) liegt, verwenden wir `wsl` als Command, um über Windows Subsystem for Linux zu verbinden.

### 3. Starte Claude Desktop neu

Schließe Claude Desktop vollständig und starte es neu.

### 4. Teste die Verbindung

In Claude Desktop kannst du jetzt testen:

```
"Liste alle verfügbaren ABM2 Tools auf"
```

oder

```
"Führe einen Health Check durch"
```

## Alternative: Direkte Netzwerkverbindung

Falls WSL nicht verfügbar ist, kannst du auch eine direkte Netzwerkverbindung verwenden. Dafür musst du den MCP-Server als HTTP-Service bereitstellen (siehe unten).

## Verfügbare Authentifizierungsdaten

- **Username:** `admin`
- **Password:** `bwi2025`
- **Backend URL:** `http://192.168.178.77:8000`

## Troubleshooting

### "Invalid username or password" Fehler

Stelle sicher, dass:
1. Die Umgebungsvariablen `ABM2_USERNAME` und `ABM2_PASSWORD` korrekt gesetzt sind
2. Das Backend läuft: `curl http://192.168.178.77:8000/api/health`
3. Die Credentials stimmen mit denen im Backend `.env` überein

### WSL-Verbindung schlägt fehl

1. Überprüfe, ob WSL installiert ist: `wsl --version`
2. Teste WSL-Zugriff: `wsl ls /home/cytrex/abm2-digital-lab/abm2-mcp-server/`
3. Stelle sicher, dass Node.js in WSL installiert ist: `wsl node --version`

### Connection Timeout

1. Überprüfe, ob das Backend erreichbar ist: `ping 192.168.178.77`
2. Teste den API-Zugriff: `curl http://192.168.178.77:8000/api/health`
3. Überprüfe Firewall-Einstellungen

## Debug-Modus aktivieren

Für detaillierte Logs setze `DEBUG: "true"` in der Konfiguration:

```json
"env": {
  "ABM2_API_URL": "http://192.168.178.77:8000",
  "ABM2_USERNAME": "admin",
  "ABM2_PASSWORD": "bwi2025",
  "DEBUG": "true"
}
```

Logs findest du dann in Claude Desktop unter: Help > View Logs

## Unterstützte Tools

Der MCP-Server stellt **39 Tools** bereit:

- **Simulation Control:** reset, step, get data, health check
- **Configuration:** get/set/patch config
- **Presets:** list/get/save/delete
- **Media & Milieus:** get/set media sources, milieus, initial milieus
- **Recording:** start/stop recording, list/get recordings
- **Formula Registry:** 10 Tools für Formula Management
- **Audit:** get logs, add marks

Siehe `TOOLS.md` für vollständige Dokumentation.

---

**Status der Server:**
- ✅ Backend: http://192.168.178.77:8000
- ✅ Frontend: http://192.168.178.77:3001
- ✅ MCP Server: Bereit für Claude Desktop
