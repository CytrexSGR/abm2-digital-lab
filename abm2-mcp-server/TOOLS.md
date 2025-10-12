# ABM² MCP Tools Reference

Vollständige Übersicht aller 40+ verfügbaren MCP Tools für ABM² Digital Lab.

## Simulation Control (4 Tools)

### `abm2_reset_simulation`
Reset die Simulation und erstellt ein neues Modell mit den angegebenen Parametern.

**Parameter:**
- `num_agents` (number, optional): Anzahl der Agenten (default: 100)
- `network_connections` (number, optional): Netzwerkverbindungen pro Agent (default: 5)

**Beispiel:**
```json
{
  "num_agents": 150,
  "network_connections": 8
}
```

### `abm2_step_simulation`
Führt einen Simulationsschritt aus.

**Parameter:** Keine

### `abm2_get_simulation_data`
Ruft den aktuellen Simulationszustand ab ohne die Simulation fortzuführen. Enthält alle Metriken, Agentendaten, Biom-Informationen.

**Parameter:** Keine

### `abm2_health_check`
Überprüft den Systemstatus der ABM2 API.

**Parameter:** Keine

---

## Configuration Management (3 Tools)

### `abm2_get_config`
Ruft die vollständige Simulationskonfiguration ab (Biomes, Agent Dynamics, Simulation Parameters).

**Parameter:** Keine

### `abm2_set_config`
Setzt eine vollständige neue Konfiguration. **Requires authentication.**

**Parameter:**
- `config` (object, required): Vollständiges FullConfig-Objekt

### `abm2_patch_config`
Aktualisiert Teile der Konfiguration mit Deep Merge. **Requires authentication.**

**Parameter:**
- `config_patch` (object, required): Partielle Konfiguration zum Mergen

**Beispiel:**
```json
{
  "config_patch": {
    "agent_dynamics": {
      "learning_rate": 0.15
    }
  }
}
```

---

## Preset Management (4 Tools)

### `abm2_list_presets`
Listet alle verfügbaren Presets für eine Konfigurationssektion auf.

**Parameter:**
- `section_name` (string, required): Section name
  - Mögliche Werte: `biomes`, `milieus`, `media_sources`, `output_schablonen`, `agent_dynamics`

### `abm2_get_preset`
Lädt ein spezifisches Preset.

**Parameter:**
- `section_name` (string, required): Section name
- `preset_name` (string, required): Preset name

### `abm2_save_preset`
Speichert oder überschreibt ein Preset. **Requires authentication.**

**Parameter:**
- `section_name` (string, required): Section name
- `preset_name` (string, required): Preset name
- `data` (object, required): Preset-Konfigurationsdaten

### `abm2_delete_preset`
Löscht ein Preset. **Requires authentication.**

**Parameter:**
- `section_name` (string, required): Section name
- `preset_name` (string, required): Preset name

---

## Media Sources (2 Tools)

### `abm2_get_media_sources`
Ruft alle konfigurierten Medienquellen ab.

**Parameter:** Keine

### `abm2_set_media_sources`
Setzt die Medienquellen-Konfiguration. **Requires authentication.**

**Parameter:**
- `media_sources` (array, required): Array von MediaSourceConfig-Objekten

**Beispiel:**
```json
{
  "media_sources": [
    {
      "name": "Progressive Daily",
      "influence_factor": 0.8,
      "ideological_position": {
        "economic_axis": -0.6,
        "social_axis": 0.7
      }
    }
  ]
}
```

---

## Milieus (4 Tools)

### `abm2_get_milieus`
Ruft die Milieu-Konfiguration ab.

**Parameter:** Keine

### `abm2_set_milieus`
Setzt die Milieu-Konfiguration. **Requires authentication.**

**Parameter:**
- `milieus` (array, required): Array von MilieuConfig-Objekten

### `abm2_get_initial_milieus`
Ruft die initiale Milieu-Verteilung ab.

**Parameter:** Keine

### `abm2_set_initial_milieus`
Setzt die initiale Milieu-Verteilung. **Requires authentication.**

**Parameter:**
- `initial_milieus` (array, required): Array von InitialMilieuConfig-Objekten

---

## Output Schablonen (2 Tools)

### `abm2_get_output_schablonen`
Ruft Output-Klassifizierungs-Templates ab.

**Parameter:** Keine

### `abm2_set_output_schablonen`
Setzt Output-Klassifizierungs-Templates. **Requires authentication.**

**Parameter:**
- `schablonen` (array, required): Array von OutputSchabloneConfig-Objekten

---

## Recording & Export (4 Tools)

### `abm2_start_recording`
Startet die CSV-Aufzeichnung der Simulationsdaten.

**Parameter:**
- `preset_name` (string, required): Name für die Aufzeichnung (wird Teil des Dateinamens)

### `abm2_stop_recording`
Stoppt die laufende CSV-Aufzeichnung.

**Parameter:** Keine

### `abm2_list_recordings`
Listet alle verfügbaren CSV-Aufzeichnungen auf.

**Parameter:** Keine

### `abm2_get_recording`
Lädt eine spezifische CSV-Aufzeichnungsdatei herunter.

**Parameter:**
- `filename` (string, required): Aufzeichnungs-Dateiname

---

## Formula Registry (10 Tools)

### `abm2_list_formulas`
Listet alle verfügbaren Formeln in der Registry auf.

**Parameter:** Keine

### `abm2_get_formula`
Ruft Details über eine spezifische Formel ab (alle Versionen).

**Parameter:**
- `formula_name` (string, required): Formel-Name (z.B. `altruism_update`)

### `abm2_create_formula`
Erstellt oder aktualisiert eine Formel-Version. **Requires editor role.**

**Parameter:**
- `formula_name` (string, required): Formel-Name
- `formula_data` (object, required): Formel-Definition
  - `version` (string): Version (z.B. "1.0.0")
  - `expression` (string): Sympy-Ausdruck
  - `inputs` (array): Input-Parameter
  - `tests` (object): Test-Definitionen

**Beispiel:**
```json
{
  "formula_name": "altruism_update",
  "formula_data": {
    "version": "1.0.0",
    "expression": "prev_altruism + eta * (delta_u_sozial - delta_u_ego)",
    "inputs": [
      {"name": "prev_altruism", "type": "float"},
      {"name": "eta", "type": "float"},
      {"name": "delta_u_sozial", "type": "float"},
      {"name": "delta_u_ego", "type": "float"}
    ],
    "tests": {
      "golden": [
        {
          "name": "baseline",
          "input": {
            "prev_altruism": 0.5,
            "eta": 0.1,
            "delta_u_sozial": 1.0,
            "delta_u_ego": 0.5
          },
          "expected": 0.55
        }
      ]
    }
  }
}
```

### `abm2_validate_formula`
Validiert eine Formel-Version.

**Parameter:**
- `formula_name` (string, required): Formel-Name
- `version` (string, required): Zu validierende Version

### `abm2_compile_formula`
Kompiliert eine Formel-Version zu ausführbarem Code.

**Parameter:**
- `formula_name` (string, required): Formel-Name
- `version` (string, required): Zu kompilierende Version

### `abm2_test_formula`
Führt Tests für eine Formel-Version aus.

**Parameter:**
- `formula_name` (string, required): Formel-Name
- `version` (string, required): Zu testende Version

### `abm2_release_formula`
Markiert eine Formel-Version als "released". **Requires approver role.**

**Parameter:**
- `formula_name` (string, required): Formel-Name
- `version` (string, required): Zu releasende Version
- `released_by` (string, required): Name der Person, die released

### `abm2_get_pins`
Ruft die aktuelle Formel-Pin-Konfiguration ab.

**Parameter:** Keine

### `abm2_set_pins`
Setzt die Formel-Pin-Konfiguration. **Requires operator role.**

**Parameter:**
- `pins` (object, required): Pin-Konfigurationsobjekt (formula_name: version)

**Beispiel:**
```json
{
  "pins": {
    "altruism_update": "1.0.0",
    "consumption_rate": "2.1.0"
  }
}
```

### `abm2_get_formula_versions`
Listet alle Versionen einer spezifischen Formel auf.

**Parameter:**
- `formula_name` (string, required): Formel-Name

---

## Audit System (2 Tools)

### `abm2_get_audit_logs`
Ruft Audit-Logs mit optionalen Filtern ab.

**Parameter (alle optional):**
- `limit` (number): Maximale Anzahl von Einträgen
- `offset` (number): Start-Offset
- `action` (string): Filter nach Aktion
- `formula` (string): Filter nach Formel-Name
- `version` (string): Filter nach Version
- `since` (string): Filter nach Startzeit (ISO datetime)
- `until` (string): Filter nach Endzeit (ISO datetime)

**Beispiel:**
```json
{
  "limit": 100,
  "action": "compile",
  "since": "2025-10-01T00:00:00Z"
}
```

### `abm2_add_audit_mark`
Fügt einen benutzerdefinierten Audit-Log-Eintrag hinzu. **Requires operator/approver role.**

**Parameter:**
- `action` (string, required): Aktionsbeschreibung
- `details` (object, optional): Zusätzliche Details

---

## Authentifizierung

Tools, die **Requires authentication** oder eine spezifische Rolle erfordern, benötigen korrekte Umgebungsvariablen:

```bash
ABM2_USERNAME=admin
ABM2_PASSWORD=your_password
```

### Rollen (für Formula Registry):
- **editor**: Kann Formeln erstellen/bearbeiten
- **operator**: Kann Pins setzen und Custom Audits erstellen
- **approver**: Kann Formeln releasen
- **auditor**: Kann Audit-Logs einsehen

Rollen werden über den `X-User-Role` Header gesetzt (automatisch im Backend).

---

## Workflow-Beispiele

### Simulation starten und aufzeichnen

1. `abm2_reset_simulation` mit gewünschten Parametern
2. `abm2_start_recording` mit Experiment-Name
3. `abm2_step_simulation` mehrfach ausführen
4. `abm2_get_simulation_data` für aktuelle Metriken
5. `abm2_stop_recording` wenn fertig
6. `abm2_list_recordings` um Dateien zu sehen

### Konfiguration anpassen

1. `abm2_get_config` - Aktuelle Config laden
2. Werte modifizieren
3. `abm2_patch_config` - Nur geänderte Teile updaten

### Formel entwickeln

1. `abm2_create_formula` - Neue Version erstellen
2. `abm2_validate_formula` - Syntax prüfen
3. `abm2_compile_formula` - Zu Code kompilieren
4. `abm2_test_formula` - Tests ausführen
5. `abm2_release_formula` - Als stable markieren
6. `abm2_set_pins` - Version aktivieren

---

**Total: 39 Tools**
- Simulation Control: 4
- Configuration: 3
- Presets: 4
- Media Sources: 2
- Milieus: 4
- Output Schablonen: 2
- Recording: 4
- Formula Registry: 10
- Audit: 2

**Version:** 1.0.0
**Letzte Aktualisierung:** 2025-10-11
