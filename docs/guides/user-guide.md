# Benutzerhandbuch

## Einführung

ABM² ist eine interaktive Plattform für Agent-Based Modeling im politischen Kontext. Dieses Handbuch führt Sie durch die wichtigsten Funktionen und deren Verwendung.

## Benutzeroberfläche Übersicht

### Hauptbereiche

1. **Control Panel** - Simulationssteuerung mit erweiterten Schritt-Controls
2. **Live Dashboard** - Echtzeit-Visualisierung der Simulationsdaten
3. **Agent Map** - Geografische Verteilung auf Biome-Flächen
4. **Configuration Panels** - Biomes, Milieus und Parameter-Einstellungen
5. **Metrics Dashboard** - Kennzahlen und Statistiken
6. **Agent Inspector** - Detailanalyse einzelner Agenten

## Erste Schritte

### 1. Anwendung starten

1. Backend und Frontend gemäß [Installation Guide](installation.md) starten
2. Browser öffnen und zu `http://localhost:3000` navigieren
3. Warten bis die Verbindung zum Backend hergestellt ist (grüner Status-Indikator)

### 2. Simulation initialisieren

1. **Control Panel** öffnen
2. Parameter einstellen:
   - **Anzahl Agenten**: Standard 100
   - **Netzwerk-Verbindungen**: Standard 5
3. **"⟳ Reset"** klicken - Erstellt neue Simulation mit 6 politischen Milieus

### 3. Simulation ausführen

- **"▶ Start"** - Kontinuierliche Simulation (alle 500ms)
- **"⏭ 1 Step"** - Führt genau einen Simulationsschritt aus
- **"⏭⏭ 10 Steps"** - Führt 10 Simulationsschritte hintereinander aus
- **"■ Stop"** - Stoppt kontinuierliche Simulation
- **"⟳ Reset"** - Setzt Simulation zurück

## Funktionen im Detail

### Control Panel (Erweitert)

#### Neue Simulation Controls
Die Simulationssteuerung wurde um schrittweise Ausführung erweitert:

- **Start/Stop**: Kontinuierliche Simulation starten/stoppen
- **1 Step**: Einzelner präziser Simulationsschritt für detaillierte Analyse
- **10 Steps**: Schnelle Progression durch 10 aufeinanderfolgende Schritte
- **Reset**: Neue Simulation mit aktueller Konfiguration

#### Parameter Einstellungen
- **Agent Count**: Anzahl der Agenten (1-1000)
- **Network Connections**: Durchschnittliche Verbindungen pro Agent
- **Biome Distribution**: Automatische Verteilung basierend auf population_percentage

### Agent Map (Biome-basiert)

#### Neue geografische Visualisierung
- **Biome-Flächen**: Agenten werden auf 4 geografische Biomes verteilt
- **Milieu-Farben**: Agenten werden nach ihren politischen Milieus eingefärbt:
  - **Linksradikal**: Dunkelrot (#8B0000)
  - **Links**: Rot (#DC143C) 
  - **Mitte**: Schwarz (#000000)
  - **Liberal**: Gelb (#FFD700)
  - **Rechts**: Blau (#0000FF)
  - **Rechtsextrem**: Braun (#8B4513)

#### Interaktive Features
- **Agent Details**: Klick auf Agent zeigt umfassende Informationen
- **Biome Labels**: Klar beschriftete geografische Bereiche
- **Echtzeit-Updates**: Live-Aktualisierung während Simulation

### Konfiguration

#### Biome Editor (Erweitert)
Neue Population Distribution Features:
- **Population Percentage**: Prozentualer Anteil der Gesamtbevölkerung pro Biome
- **Validierung**: Automatische Überprüfung dass Summe = 100%
- **Visual Feedback**: Grün bei korrekter Verteilung, Rot bei Abweichungen

Biome Parameter:
- **Grundparameter**: Name, Bevölkerungsanteil, Sozialleistungen
- **Wirtschaftsverteilungen**: Einkommen und Vermögen (Beta, Lognormal, Pareto)
- **Gefahren**: Wahrscheinlichkeit und Auswirkungsfaktor
- **Ökologische Parameter**: Kapazität, Qualität, Regenerationsrate, Produktivitätsfaktor
- **Verhaltensschwellen**: Knappheits- und Risiko-Vermögensschwellen

#### Initial Population Editor (Milieus)
Umfassendes Milieu-Management:
- **6 vordefinierte Archetypen**: Automatische Initialisierung mit politischen Archetypen
- **Attributverteilungen**: Individuelle Konfiguration für jeden Milieu:
  - Bildung, Alter, Kognitive Kapazität
  - Verträglichkeit, Freiheitspräferenz, Altruismus
- **Einklappbare Sektionen**: Übersichtliche Organisation großer Konfigurationen
- **Preset-System**: Laden politischer Archetypen als Bausteine
- **Proportionen-Normalisierung**: Automatische Anpassung auf 100%

#### Media Sources Configuration
- **Ideologische Positionierung**: Economic-Axis und Social-Axis für jede Quelle
- **Einflussmodelle**: Konfigurierbare Medieneinfluss-Faktoren

#### Templates & Output Classification
- **Template-Bereiche**: Definierte politische Kategorien im 2D-Raum
- **Farbkodierung**: Visuelle Zuordnung verschiedener politischer Positionen
- **Automatische Klassifizierung**: Agenten werden basierend auf politischer Position kategorisiert

### Erweiterte Analytics

#### Model Report Dashboard
Umfassende Metriken:
- **Politische Metriken**: Mean Freedom, Mean Altruism, Polarization
- **Wirtschaftsmetriken**: 
  - Durchschnitts-Vermögen und Einkommen
  - Gini-Koeffizienten für Vermögens- und Einkommensverteilung
- **Regionale Verteilung**: Agent-Counts pro Biome
- **Event-Tracking**: Hazard Events, Gini-Schwellenwert-Überschreitungen

#### Population Reports
- **Milieu-Verteilung**: Anfangs-Milieu-Zugehörigkeiten
- **Template-Verteilung**: Aktuelle politische Kategorisierung
- **Schlüssel-Durchschnitte**: Vermögen, Einkommen, Altruismus, Kognition, Risikoaversion

#### Agent Inspector (Erweitert)
Detaillierte Agent-Analyse:
- **Grundinformationen**: ID, Position, Region, Milieu, Template
- **Demografische Daten**: Alter, Bildung, kognitive Kapazitäten
- **Wirtschaftsdaten**: Einkommen, Vermögen, Sozialleistungen
- **Politische Position**: 2D-Koordinaten im politischen Raum
- **Verhaltensindikatoren**: Risikoaversion, politische Wirksamkeit, Sozialkapital

### Preset Management (Erweitert)

#### Politische Archetype Presets
6 vorgefertigte Milieu-Presets verfügbar:
- **linksradikal**: Hoher Altruismus, starke Freiheitspräferenz
- **links**: Moderate linke Werte mit sozialer Orientierung
- **mitte**: Ausgewogene politische Positionen
- **liberal**: Wirtschaftsliberale mit individueller Freiheit
- **rechts**: Konservative Werte mit traditioneller Orientierung
- **rechtsextrem**: Extreme rechte Positionen

#### Preset-Funktionen
- **Automatisches Laden**: Alle 6 Archetypen werden bei Initialisierung geladen
- **Hinzufügen statt Ersetzen**: Neue Presets erweitern bestehende Konfiguration
- **Namenskonflikte**: Automatische Umbenennung bei Duplikaten
- **Proportions-Normalisierung**: Automatische Anpassung nach Preset-Addition

## Neue Features im Detail

### Biome-basierte Agent-Verteilung

#### Konzept
Statt politischer Raumverteilung werden Agenten nun geografisch auf Biomes verteilt:
- **4 Biome-Flächen**: Vertikal aufgeteilte geografische Bereiche
- **Konfigurierbare Population**: Jedes Biome hat `population_percentage` (muss 100% ergeben)
- **Berechnete Verteilung**: Agenten = Milieu-Proportion × Biome-Prozentsatz
- **Visuelle Darstellung**: Biome-Hintergründe mit Milieu-Farbkodierung

#### Implementation
- **Backend**: `_calculate_agent_distribution()` in model.py:712
- **Frontend**: Validierung in BiomeEditor mit visueller Feedback
- **Konfiguration**: population_percentage in config.yml

### Erweiterte Simulation Controls

#### Schrittweise Ausführung
Präzise Kontrolle über Simulationsfortschritt:
- **Kontinuierlich**: Start/Stop für automatische Progression
- **Einzelschritt**: Exakte Kontrolle für detaillierte Analyse
- **Multi-Step**: Effiziente Progression durch mehrere Schritte
- **Sicherheit**: Step-Buttons deaktiviert während kontinuierlicher Simulation

## Datenanalyse

### Echtzeit-Monitoring

#### Key Performance Indicators (KPIs)
- **Simulationsschritt**: Aktueller Zeitschritt mit Echtzeit-Updates
- **Regionale Verteilung**: Live-Counts pro Biome
- **Wirtschaftsindikatoren**: Durchschnittswerte und Gini-Koeffizienten
- **Event-Counts**: Hazard-Events und Schwellenwert-Überschreitungen
- **Template-Verteilung**: Aktuelle politische Kategorisierung

#### Live-Events
- **Hazard Events**: "HAZARD_EVENT|{Biome}: {Beschreibung}"
- **Gini-Threshold Events**: "GINI_WEALTH_THRESHOLD_CROSSED|{DIRECTION}|{Wert}"
- **WebSocket-Updates**: Echtzeit-Übertragung aller Simulationsdaten

### Export-Funktionen

#### Daten Export
- **JSON Export**: Vollständige Simulationszustände mit allen Metriken
- **Agent Data**: Detaillierte Agent-Informationen für externe Analyse
- **Configuration Export**: Aktuelle Konfiguration für Reproduzierbarkeit

## Erweiterte Funktionen

### Event Log
Umfassendes Event-Tracking:
- **Hazard Events**: Umweltereignisse mit Biome-spezifischen Auswirkungen
- **Economic Events**: Gini-Koeffizient Schwellenwert-Überschreitungen
- **System Events**: Simulation Resets, Konfigurationsänderungen
- **WebSocket Events**: Verbindungsstatus und Datenübertragung

### Agent Inspector (Detailliert)
Vollständige Agent-Analyse:
- **Identifikation**: Unique ID, Position, Region
- **Sozio-demografisch**: Alter, Bildung, Milieu-Zugehörigkeit
- **Politisch**: Position im 2D-Raum, Template-Kategorisierung
- **Wirtschaftlich**: Einkommen, Vermögen, Sozialleistungen
- **Psychologisch**: Kognitive Kapazität, Risikoaversion, Sozialkapital
- **Verhalten**: Politische Wirksamkeit, Zeitpräferenz

### Population Monitor
- **Milieu-Tracking**: Entwicklung der Milieu-Verteilungen
- **Template-Evolution**: Veränderungen in politischen Kategorien
- **Economic Dynamics**: Vermögens- und Einkommensentwicklung
- **Spatial Patterns**: Bewegungsmuster zwischen Biomes

## Tipps und Best Practices

### Performance-Optimierung

#### Große Simulationen
- **Schrittweise Skalierung**: Agenten-Anzahl graduell erhöhen
- **Step-Control nutzen**: 1-Step für detaillierte Analyse, 10-Steps für Progression
- **Biome-Balance**: Ausgewogene Population-Percentages für Performance

#### Konfiguration-Management
- **Presets verwenden**: Standardisierte politische Archetypen als Basis
- **Validierung beachten**: Biome-Prozentsätze müssen 100% ergeben
- **Backup-Konfigurationen**: Wichtige Konfigurationen als Presets speichern

### Datenqualität

#### Milieu-Konfiguration
- **Realistische Proportionen**: Milieu-Verteilungen an reale Bevölkerung anpassen
- **Attribut-Balance**: Extreme Werte in Attributverteilungen vermeiden
- **Biome-Charakteristika**: Biome-spezifische Parameter an geografische Realitäten anpassen

#### Reproduzierbarkeit
- **Konfiguration dokumentieren**: Aktuelle Einstellungen regelmäßig exportieren
- **Preset-Versionierung**: Verschiedene Konfigurationen als benannte Presets
- **Parameter-Protokoll**: Änderungen an kritischen Parametern dokumentieren

## Fehlerbehebung

### Häufige Probleme

#### Konfigurationsfehler
- **Population-Percentage nicht 100%**: BiomeEditor zeigt rote Warnung
- **Milieu-Proportionen > 1**: Normalisierung verwenden
- **Validation Errors**: Pydantic-Fehlermeldungen in Browser-Console prüfen

#### Simulation-Probleme
- **Agenten erscheinen grau**: Initial-Milieus-Konfiguration prüfen
- **Ungleiche Verteilung**: population_percentage in config.yml validieren
- **Step-Buttons deaktiviert**: Kontinuierliche Simulation erst stoppen

#### WebSocket-Verbindung
- **Verbindungsabbrüche**: Backend-Status unter `/api/health` prüfen
- **Fehlende Updates**: Browser Developer Tools → Network → WS prüfen
- **CORS-Probleme**: URLs in Frontend-Konfiguration validieren

### Error Codes (Erweitert)

| Code | Beschreibung | Lösung |
|------|-------------|---------|
| 422 | Validation Error | Pydantic-Model Anforderungen prüfen |
| 500 | Server Error | Backend-Logs für Simulationsfehler prüfen |
| 404 | Not Found | API-Endpoint oder Konfigurationsdatei prüfen |
| 400 | Bad Request | JSON-Struktur und Parameter validieren |
| CORS | Cross-Origin | CORS-Konfiguration für Localhost:3000 prüfen |

## Keyboard Shortcuts

| Shortcut | Funktion |
|----------|----------|
| `Space` | Start/Stop Simulation |
| `1` | Single Step |
| `0` | 10 Steps |
| `R` | Reset Simulation |
| `C` | Open Configuration |
| `M` | Toggle Map View |
| `D` | Toggle Dashboard |
| `I` | Toggle Agent Inspector |
| `H` | Show/Hide Help |

## API Integration

### Direkte API-Nutzung
Für erweiterte Anwendungsfälle können Sie direkt mit der API interagieren:

```bash
# Simulation starten
curl -X POST http://localhost:8000/api/simulation/reset

# Einzelnen Schritt ausführen
curl -X POST http://localhost:8000/api/simulation/step

# Aktuelle Daten abrufen
curl http://localhost:8000/api/simulation/data

# Biome-Konfiguration laden
curl http://localhost:8000/api/config

# Milieus-Konfiguration abrufen
curl http://localhost:8000/api/initial_milieus
```

### WebSocket-Integration
Für Echtzeit-Updates können externe Anwendungen die WebSocket-Verbindung nutzen:
- **Endpoint**: `ws://localhost:8000/ws`
- **Message Format**: JSON mit step, model_report, agent_visuals
- **Ping-Nachrichten**: Alle 5 Sekunden zur Verbindungsüberwachung

## Support

### Hilfe erhalten
- **Event Log**: System → Event Log für Simulation-Events
- **Browser Console**: Developer Tools für Frontend-Debugging
- **API Documentation**: `http://localhost:8000/docs` für vollständige API-Referenz
- **Konfigurationsdateien**: YAML-Dateien in `backend/political_abm/`

### Debugging-Tipps
- **Backend-Logs**: Terminal-Output während `python main.py`
- **Frontend-Logs**: Browser Developer Tools → Console
- **WebSocket-Status**: Network Tab → WS für Verbindungsmonitoring
- **Configuration-Validation**: Pydantic-Fehlermeldungen beachten

### Feedback
- **Performance-Issues**: System-Spezifikationen und Agent-Anzahl angeben
- **Konfigurationsprobleme**: Aktuelle YAML-Konfigurationen beifügen
- **UI-Probleme**: Screenshots und Browser-Information
- **Feature-Requests**: Detaillierte Beschreibung der gewünschten Funktionalität

## Ressourcen

### Weitere Dokumentation
- [Installation Guide](installation.md) - Setup und Deployment
- [API Referenz](../api/README.md) - Vollständige API-Dokumentation
- [Architektur](../architecture/README.md) - System-Design und Komponenten
- [Konfiguration](configuration.md) - Detaillierte Konfigurationsoptionen

### Externe Links
- [Agent-Based Modeling Grundlagen](https://en.wikipedia.org/wiki/Agent-based_model)
- [Political Compass](https://www.politicalcompass.org/) - Politische 2D-Raumkonzepte
- [FastAPI Dokumentation](https://fastapi.tiangolo.com/)
- [React Dokumentation](https://reactjs.org/)
- [Deck.gl Dokumentation](https://deck.gl/) - Für Map-Visualisierung
- [Zustand State Management](https://github.com/pmndrs/zustand)

### Beispiel-Konfigurationen
- **Standard-Setup**: 100 Agenten, 6 Milieus, 4 Biomes
- **Performance-Test**: 1000 Agenten, reduzierte Visualisierung
- **Detailanalyse**: 50 Agenten, einzelschrittweise Ausführung
- **Politische Archetypen**: Vorgefertigte 6-Milieu-Konfiguration