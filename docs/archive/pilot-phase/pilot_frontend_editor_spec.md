# Frontend-Editor-Spezifikation (math.js + CodeMirror/Monaco)

Ziel: UI/UX, Validierung und Governance-Flows für einen Browser‑Editor zur Formelbearbeitung, kompatibel mit der Formula Registry API und dem Backend (FastAPI).

## Architekturüberblick
- Stack: React (vorhanden im Frontend), Editor: CodeMirror 6 (empfohlen) oder Monaco (optional Umschaltbar via Feature-Flag).
- Parser/Evaluator: math.js (AST‑Erzeugung und leichte Vorschau), autoritative Compile/Test/Release laufen im Backend über die Registry‑APIs.
- Datenfluss: UI → (lokale Validierung) → API Calls: /validate, /compile, /test, /release; Versionen via /formulas/{name}; Audit via /audit; Pins via /pins.

## Seiten & Navigationsstruktur
- Route: `/registry/formulas/:name`
- Layout in drei Spalten:
  1) Sidebar (links): Variablen & erlaubte Funktionen, Snippets, Pins‑Info (read‑only)
  2) Editor‑Pane (Mitte): CodeMirror/Monaco mit math.js, Fehler‑Overlays, Live‑Vorschau
  3) Inspector (rechts) mit Tabs: Schema | Tests | Versionen | Audit

ASCII‑Wireframe:
```
+-------------------+-------------------------------+------------------------------+
| Sidebar           | Editor (math.js expression)   | Inspector Tabs               |
| - Formula picker  | ┌───────────────────────────┐ | [Schema] [Tests] [Versionen]|
| - Allowed symbols | |  f(x,y) = ...             | | [Audit]                    |
| - Variables       | |  ... live errors ...      | |                              |
| - Snippets        | └───────────────────────────┘ | [Run Validate][Compile][Test]|
| - Pins (read-only)| Preview: result / warnings    | Role‑gated [Submit Review]   |
+-------------------+-------------------------------+------------------------------+
```

## Komponenten
- `FormulaEditorView`
  - Props: `formulaName`, `userRole` ("editor"|"reviewer"|"approver"|"operator"|"viewer")
  - State: `draft`, `schema`, `expression`, `ast`, `errors`, `preview`, `tests`, `versions`, `audit`, `pins`, `busyFlags`, `lastResults`
  - Effects:
    - Load formula details: GET /formulas/{name}
    - Load pins: GET /pins
    - Load audit (paginated): GET /audit?formula=name
    - Debounced local validation on `expression` change
- `Sidebar`
  - Sections:
    - Formula selector (optional): Dropdown/Suche innerhalb bekannter Formeln
    - Allowed functions: aus GET /registry/health.whitelist
    - Variables: aus Schema (Inputs), klickbare Inserts in den Editor
    - Snippets: vordefinierte Muster (Min/Max/clip, sigmoid etc.)
    - Pins (read‑only): aktuell gepinnte Version für diese Formel
- `MathEditor`
  - Implementation: CodeMirror 6 (default) mit Linter‑Extension; Monaco als Alternative
  - Features: Syntax‑Highlighting, Bracket‑Match, Autocomplete (Variablen/Funktionen), Inline‑Diagnostics (AST‑/Whitelist‑Fehler)
- `InspectorTabs`
  - Tabs:
    - Schema: Tabelle/Forms für Inputs (Name, Typ number|int, min, max, default), Import/Export JSON (kompatibel zu docs/pilot_altruism_update.schema.json)
    - Tests:
      - Golden: Liste mit Rows (Input‑Objekt, Expected, Tolerance)
      - Property: Presets (Range‑Clamp, Monotonie), Parametrisierung möglich
      - [Run Tests] Button → POST /test (autoritative Ausführung); lokale Preview optional
    - Versionen: Liste der Versionen (GET /versions/{name}), Statusbadges (draft/released); Diff (AST/Inputs) zwischen zwei Versionen; Buttons (role‑gated): Validate, Compile, Test, Submit Review, Release
    - Audit: Tabelle der Audit‑Events (GET /audit), Filter/Download

## Validierung (Frontend, live)
- Parsing: math.js parse(expression) → AST
- Checks (lokal):
  - Syntaxfehler: sofortige Fehlermeldung im Editor (unterstreichung/Marker)
  - Unerlaubte Symbole: AST traversieren und gegen Allow‑List prüfen (aus /registry/health.whitelist oder lokal konfiguriert)
  - Unbekannte Variablen: Vergleich AST‑Symbols vs. Schema.inputs[].name
  - Division durch Null: Heuristik (Warnung) bei wörtlichen Divisoren 0
  - Clip‑Hinweise: Falls expected Range [0,1], warnen wenn kein Min/Max/clip im Ausdruck vorkommt
- Vorschau: Evaluate mit Dummy‑Inputs (aus Schema defaults oder generiert), Anzeige Ergebnis/Warnungen; niemals `eval`, ausschließlich math.js Evaluate
- Autoritativ: Buttons rufen POST /validate, /compile, /test; Backend‑Fehler/Messages werden im UI prominent gezeigt

## Tests (Frontend‑Integration)
- Golden Tests:
  - Editor für Testzeilen mit JSON‑Inputs + Expected + Tolerance
  - Lokal: „Trockenlauf“ via math.js (informativ), Backend: POST /test (maßgeblich)
- Property Tests (UI Presets):
  - Range Clamp (Output ∈ [min,max])
  - Nullsignal‑Invarianz
  - Monotonie (+/‑) über gewählten Parameterbereich
  - UI erlaubt Parametrisierung von Start/Ende/Steps; Ausführung delegiert an Backend /test
- Ergebnisse:
  - Zusammenfassung (passed/failed), Details‑Accordion je Test
  - Persistenz: Tests als Teil des Drafts (PUT /formulas/{name})

## Versionierung & Workflow
- Laden: GET /formulas/{name} zeigt aktive „released“ und aktuellen Draft
- Aktionen (role‑gated):
  - Validate → POST /validate
  - Compile → POST /compile
  - Test → POST /test
  - Submit Review → erzeugt Audit „review_requested“ (optional Endpoint) oder UI‑Flag; Reviewer sieht Review‑Buttons
  - Release (Approver) → POST /release
- Pins (Operator): Ansicht /pins read‑only im Editor; Änderungen erfolgen in dedizierter Admin‑Ansicht (PUT /pins), nicht im Editor
- Rollback: Versionen‑Tab zeigt welche Version aktuell gepinnt ist; Hinweis „Rollback erfolgt über Pins“

## Governance‑Hooks
- Rollensteuerung:
  - Editor: Bearbeiten von Expression/Schema/Tests, darf Validate/Compile/Test, darf Review anstoßen
  - Reviewer: sieht Review‑Diff, darf approve/reject (Audit‑Events)
  - Approver: darf Release auslösen
  - Operator: darf Pins ändern (separate Admin‑Seite)
- Audit‑Sicht:
  - Audit‑Tab zeigt Events (ts, user, action, version, reason, artifact_hash)
  - Jede mutierende Aktion im UI triggert einen API‑Call, der serverseitig Audit schreibt

## Fehler- und Nutzerführung
- Inline‑Errors im Editor (Syntax/Symbol), Panel‑Errors für Backend (422/400/500)
- Disabled‑Buttons während laufender Actions (busy state), Retry‑Optionen
- Confirm‑Modals für Release/Pin‑Änderungen

## Telemetrie (UI)
- Metriken (optional):
  - `ui_validate_ms`, `ui_compile_ms`, `ui_test_ms` (Roundtrip)
  - `editor_lint_errors_count`
  - Gesendet als Browser‑Events (optional) oder nur in Dev‑Console; serverseitig maßgebliche Telemetrie in `run_info.telemetry`

## Datenmodelle (UI‑lokal)
- Draft: { name, version, inputs, expression(ast|string), allowed_symbols, tests, metadata }
- TestCase: { name, input: object, expected: number, tolerance: number }
- PropertyCase: { name, type, params }
- Version: { version, status, created_at, created_by }
- AuditItem: { ts, user, action, formula, version, reason, artifact_hash }

## Flows
- Neuer Draft:
  1) Nutzer wählt Formel → Klick „Neuer Draft“ (oder lädt Draft)
  2) Editor schreibt, Sidebar nutzt Snippets/Variablen
  3) Live‑Validation grün → Validate/Compile/Test → Submit Review
  4) Reviewer Approve → Approver Release
- Änderung bestehender Drafts: Gleich wie oben, Diff gegen aktive Version im Versionen‑Tab

## Zugänglichkeit & DX
- Tastaturshortcuts (Save Draft, Validate, Test)
- Farbcodierung für Status (Draft/Released), Fehler, Warnungen
- JSON Import/Export für Schema und Tests

## Sicherheitsaspekte
- Keine clientseitigen `eval`. math.js nur für Parsing/Evaluierung der reinen mathematischen Ausdrücke mit begrenzter Symboltabelle
- Server als „Single Source of Truth“ für Compile/Test/Release

## Akzeptanzkriterien (Erfüllung)
- Editor‑UI vollständig beschrieben: Struktur, Komponenten, Rollen
- Validierungs‑ & Testmechanismen in UI skizziert und an Backend gekoppelt
- Governance‑Fluss (Review → Release → Pinning) sichtbar und rollengesteuert

