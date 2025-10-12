# Risiko- und Abmilderungsplan – Formel‑Migration (Registry)

Ziel: Relevante Risiken (technisch, organisatorisch, Governance/Compliance) für die Migration in eine Formula‑Registry benennen, bewerten und konkrete Mitigationsmaßnahmen inkl. Frühwarnindikatoren festlegen.

Legende: Wkt. = Eintrittswahrscheinlichkeit, Ausw. = Auswirkung. Stufen: niedrig/mittel/hoch.

## Risikotabelle

| Kategorie | Risiko | Wkt. | Ausw. | Mitigation (konkret) | Frühwarnindikatoren | Abhängigkeiten/Vorarbeiten |
|---|---|---:|---:|---|---|---|
| Technisch | Performance‑Overhead durch Registry‑Eval | mittel | hoch | LRU‑Cache für kompilierte Funktionen; Batch/Vectorize mit numpy; Nur einmalige Symbolbindung; Telemetrie aktivieren | `registry_eval_ms_total`, `registry_call_count`, `cache_hit_ratio`, Step‑Latenzen | Telemetrie‑Plumbing; Batch‑API im Registry‑Executor |
| Technisch | Häufige Cache‑Misses/Compile‑Zeit | mittel | mittel | Version‑Pins fixieren; Pre‑Warm beim Start; Artefakt‑Hashing + persistenter Cache | `cache_miss`, `compile_ms_total`, Kaltstartdauer | Pins geladen; Compiler‑Artefakt‑Persistenz |
| Technisch | RNG‑Kopplung in Formeln bleibt bestehen | mittel | hoch | RNG‑Zentralisierung umsetzen (ein Generator/Run); formelnahe RNG als Input (u∈[0,1], success:bool) | Code‑Scan ohne verbleibende `random/np.random` in Formeln; Tests stabil mit fixem Seed | RNG‑Zentralisierung (Auftrag 1) |
| Technisch | Numerische Abweichungen vs. Altlogik | mittel | mittel | Golden‑Tests + Property‑Tests je Formel; Toleranzen definieren; Regression‑CI | Testfailures; Metrik‑Drift (Gini, Mittelwerte) jenseits Toleranz | Testartefakte vorhanden (Specs/JSON) |
| Technisch | Vektorisierung inkonsistent (Skalar/Array) | niedrig | mittel | Lambdify mit `modules=['numpy']`; klare Spezifikation (Batch‑Fähigkeit) und Adapterfunktionen | Fehler in Batch‑Runs; unterschiedliche Ergebnisse zwischen Scalar/Vector | Batch‑Spez in Specs (erledigt), Executor‑Pfad |
| Technisch | SymPy/lambdify‑Inkompatibilitäten (Sonderfunktionen) | niedrig | mittel | Whitelist nur getestete Funktionen; Custom‑Mappings (sigmoid/softplus); Fallback‑Module (`math`) | Compile‑Fehler in /compile; Validierungswarnungen | Mapping‑Tabelle; Validierungs‑Whitelist |
| Technisch | Schema‑Drift (Inputs ändern sich) | mittel | mittel | Schema versionieren; Schema im Draft pflegen; Breaking‑Changes nur mit Major‑Bump; Validierung strikt | 422 in /validate; Häufige Client‑Fehler | JSON‑Schema pro Formel; Review‑Pflicht |
| Technisch | Fehlende Pins → nicht reproduzierbare Runs | niedrig | hoch | `FORMULA_REGISTRY_PINS_FILE` verpflichtend in PROD; Run‑Report enthält Pins/Hash; Start verweigern ohne Pins | `run_info.registry.pins` leer; Audit‑Warnungen | Feature‑Flag & Pinning (Dokumente umgesetzt) |
| Technisch | Sicherheitslücke in Validator (Symbol‑Bypass) | niedrig | hoch | Strikte AST‑Whitelist (keine Attribute/Calls); Negativ‑Tests; Fuzz‑Tests | 422‑Missbrauchsfälle; Security‑Review Findings | Validator‑Implementierung + Tests |
| Organisatorisch | Unzureichende Review‑Kapazität | mittel | mittel | Rollen & SLAs definieren; Reviewer‑Pool; asynchrone Review‑Slots | Lange Time‑to‑Release; offene PR‑/Draft‑Zahlen | Governance‑Prozess live |
| Organisatorisch | Wissenssilos/Onboarding | mittel | mittel | Living Docs (Specs), Pairing Sessions, Checklisten; Beispiel‑Formeln | Wiederkehrende Review‑Mängel; Onboarding‑Dauer | Dokumentationspflege (aktualisiert) |
| Organisatorisch | Scope‑Creep (zu viele Formeln gleichzeitig) | mittel | mittel | Migrationssequenz einhalten; WIP‑Limits; Priorisierung (Pilot → kleine, risikoarme) | Wachsende offene Drafts; Kontextwechselkosten | Verbindlicher Migrationsplan |
| Organisatorisch | Unklare Toleranzen/Abnahmekriterien | mittel | mittel | Toleranz‑Richtlinie per Formeltyp; Akzeptanzkriterien in Specs & Tests | Häufige Diskussionen; instabile Releases | Test‑Konventionen, Spec‑Vorlagen |
| Governance | Fehlende/inkonsistente Audit‑Einträge | niedrig | hoch | Zentrale Audit‑Middleware; jede mutierende Aktion triggert Audit; Append‑only Storage | Lücken in `GET /audit`; divergierende Event‑Zahlen | Audit‑Plumbing in API |
| Governance | Unautorisierte Releases/Pins | niedrig | hoch | Role‑Based Access Control (Editor/Reviewer/Approver/Operator); 4‑Augen‑Prinzip; PR‑Pflicht für Pins | 403/401‑Fehler; ungewöhnliche Aktionen im Audit | RBAC‑Durchsetzung, Secrets/SSO |
| Governance | Rollback fehlschlägt (fehlende Altversion) | niedrig | hoch | Release‑Prozedur (keine Draft‑Löschung); Historie/Artefakte behalten; Rollback‑Runbook | 409 bei PUT /pins; fehlende Versionen | Release‑Policy, Retention |
| Governance | Retention/Compliance nicht erfüllt | niedrig | mittel | Aufbewahrungsfristen definieren (Audit 12–36M; Artefakte ≥6M); Rotation/Archiv | Fehlende Logs; Prüfungsergebnisse | Storage/Backup‑Strategie |

## Handlungsempfehlungen (kompakt)
- Technischer Fokus zuerst: RNG‑Zentralisierung fertigstellen, Telemetrie einbauen, Cache/Vectorization aktivieren.
- Jede migrierte Formel erhält: Spec (Schema), Golden‑/Property‑Tests, Governance‑Review.
- Pins verpflichtend in Produktionsläufen; Run‑Report immer mit `run_info.registry` inkl. Hash.
- CI‑Gates: /validate → /compile → /test müssen grün sein, bevor „review_approved“ möglich ist.
- Beobachten: `registry_eval_ms_total`, `cache_hit_ratio`, Metrik‑Drifts (Gini/Mittelwerte) → Alerts bei Schwellwerten.

