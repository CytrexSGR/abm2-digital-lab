# ABM² Digital Lab MCP Server

MCP (Model Context Protocol) Server für ABM² Digital Lab - macht alle Simulationsfunktionen für Claude Desktop und andere MCP-Clients verfügbar.

## Features

- **40+ MCP Tools** für vollständige ABM2-Kontrolle
- Simulation Control (Reset, Step, Get Data)
- Configuration Management (Get, Set, Patch)
- Preset Management (List, Load, Save, Delete)
- Media Sources & Milieus Configuration
- Recording & Export (CSV)
- Formula Registry (Create, Validate, Compile, Test, Release)
- Audit System

## Installation

### Voraussetzungen

- Node.js >= 14.0.0
- ABM² Digital Lab Backend läuft auf `http://localhost:8000` (oder andere URL)

### Setup

1. **Installiere den MCP Server:**

```bash
cd /home/cytrex/abm2-digital-lab/abm2-mcp-server
npm install
```

2. **Konfiguriere Umgebungsvariablen (optional):**

Erstelle eine `.env` Datei:

```bash
ABM2_API_URL=http://localhost:8000
ABM2_USERNAME=admin
ABM2_PASSWORD=your_password
DEBUG=false
```

## Verwendung mit Claude Desktop

### Option 1: Direkte Konfiguration

Füge folgendes zu deiner Claude Desktop `claude_desktop_config.json` hinzu:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "abm2-digital-lab": {
      "command": "node",
      "args": [
        "/home/cytrex/abm2-digital-lab/abm2-mcp-server/abm2-mcp-bridge.js"
      ],
      "env": {
        "ABM2_API_URL": "http://localhost:8000",
        "ABM2_USERNAME": "admin",
        "ABM2_PASSWORD": "Aug2012#",
        "DEBUG": "false"
      }
    }
  }
}
```

### Option 2: Mit URL-Parameter

```json
{
  "mcpServers": {
    "abm2-digital-lab": {
      "command": "node",
      "args": [
        "/home/cytrex/abm2-digital-lab/abm2-mcp-server/abm2-mcp-bridge.js",
        "http://192.168.178.77:8000"
      ],
      "env": {
        "ABM2_USERNAME": "admin",
        "ABM2_PASSWORD": "Aug2012#"
      }
    }
  }
}
```

### Nach der Konfiguration

1. **Starte Claude Desktop neu**
2. **Überprüfe die Verbindung** - Claude sollte nun Zugriff auf alle ABM2-Tools haben
3. **Teste mit:** "Liste alle verfügbaren ABM2 Tools auf"

## Verfügbare Tools

### Simulation Control

- `abm2_reset_simulation` - Reset simulation mit neuen Parametern
- `abm2_step_simulation` - Einen Simulationsschritt ausführen
- `abm2_get_simulation_data` - Aktuellen Simulationszustand abrufen
- `abm2_health_check` - System Health Check

### Configuration Management

- `abm2_get_config` - Vollständige Konfiguration abrufen
- `abm2_set_config` - Vollständige Konfiguration setzen
- `abm2_patch_config` - Teile der Konfiguration aktualisieren

### Preset Management

- `abm2_list_presets` - Alle Presets einer Sektion auflisten
- `abm2_get_preset` - Spezifisches Preset laden
- `abm2_save_preset` - Preset speichern
- `abm2_delete_preset` - Preset löschen

### Media Sources & Milieus

- `abm2_get_media_sources` / `abm2_set_media_sources`
- `abm2_get_milieus` / `abm2_set_milieus`
- `abm2_get_initial_milieus` / `abm2_set_initial_milieus`
- `abm2_get_output_schablonen` / `abm2_set_output_schablonen`

### Recording & Export

- `abm2_start_recording` - CSV-Aufzeichnung starten
- `abm2_stop_recording` - Aufzeichnung stoppen
- `abm2_list_recordings` - Alle Aufzeichnungen auflisten
- `abm2_get_recording` - Spezifische Aufzeichnung herunterladen

### Formula Registry

- `abm2_list_formulas` - Alle Formeln auflisten
- `abm2_get_formula` - Details zu einer Formel
- `abm2_create_formula` - Formel erstellen/aktualisieren
- `abm2_validate_formula` - Formel validieren
- `abm2_compile_formula` - Formel kompilieren
- `abm2_test_formula` - Formel testen
- `abm2_release_formula` - Formel als released markieren
- `abm2_get_pins` / `abm2_set_pins` - Pin-Konfiguration
- `abm2_get_formula_versions` - Alle Versionen einer Formel

### Audit System

- `abm2_get_audit_logs` - Audit-Logs abrufen (mit Filtern)
- `abm2_add_audit_mark` - Custom Audit-Eintrag hinzufügen

## Beispiel-Verwendung

### Mit Claude Desktop

```
Du: "Erstelle eine neue Simulation mit 150 Agenten"
Claude: [Verwendet abm2_reset_simulation mit num_agents=150]

Du: "Führe 10 Simulationsschritte aus"
Claude: [Verwendet abm2_step_simulation 10x]

Du: "Zeige mir die aktuellen Simulationsdaten"
Claude: [Verwendet abm2_get_simulation_data]

Du: "Starte eine Aufzeichnung mit dem Namen 'experiment1'"
Claude: [Verwendet abm2_start_recording mit preset_name='experiment1']
```

### Programmatisch testen

```bash
node test-abm2-mcp.js
```

## Troubleshooting

### Claude Desktop sieht den MCP Server nicht

1. Überprüfe die Pfade in der Konfiguration
2. Stelle sicher, dass Node.js installiert ist: `node --version`
3. Überprüfe die Logs in Claude Desktop (Help > View Logs)

### Verbindung zu ABM2 API fehlschlägt

1. Stelle sicher, dass das Backend läuft: `curl http://localhost:8000/api/health`
2. Überprüfe die URL in der Konfiguration
3. Überprüfe Username/Password für authentifizierte Endpoints

### Authentifizierung fehlschlägt

1. Stelle sicher, dass `ABM2_USERNAME` und `ABM2_PASSWORD` korrekt gesetzt sind
2. Überprüfe die Backend-Credentials in `.env.production`

### Debug-Modus aktivieren

Setze `DEBUG=true` in der Umgebungsvariablen, dann werden detaillierte Logs nach stderr geschrieben (sichtbar in Claude Desktop Logs).

## Entwicklung

### Neue Tools hinzufügen

1. Füge Tool-Definition in `defineTools()` hinzu
2. Implementiere Handler in `handleToolCall()`
3. Teste mit `test-abm2-mcp.js`

### Logs ansehen

```bash
# In Claude Desktop: Help > View Logs
# Oder direkt testen:
DEBUG=true node abm2-mcp-bridge.js
```

## Lizenz

MIT License - siehe ABM² Digital Lab Hauptprojekt

## Support

- **GitHub:** https://github.com/infinimind-creations/abm2-digital-lab
- **Issues:** https://github.com/infinimind-creations/abm2-digital-lab/issues
- **Email:** cytrex@infinimind.dev

---

**Version:** 1.0.0
**Autor:** Cytrex / Infinimind Creations
**Letzte Aktualisierung:** 2025-10-11
