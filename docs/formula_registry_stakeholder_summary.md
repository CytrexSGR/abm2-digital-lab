# Einführung der Formula Registry – Kurzüberblick für Stakeholder

## Warum wir eine Formula Registry einführen
- Flexibilität: Fachliche Formeln (z. B. Lern‑, Konsum‑ oder Umweltfunktionen) können gezielt geändert werden – ohne großflächige Code‑Eingriffe.
- Transparenz: Jede Formel hat eine Version, eine Beschreibung und Tests. Änderungen sind nachvollziehbar.
- Governance: Änderungen durchlaufen einen klaren Freigabeprozess (Vier‑Augen‑Prinzip). Audit‑Logs dokumentieren, wer was wann freigegeben hat.
- Reproduzierbarkeit: Jede Simulation läuft mit festgelegten Formel‑Versionen (Version‑Pinning). Ergebnisse sind später nachvollziehbar und wiederholbar.

## Erwarteter Mehrwert
- Schnellere fachliche Anpassungen bei gleichbleibender Qualität.
- Geringeres Risiko unbeabsichtigter Nebenwirkungen durch Tests und Freigaben.
- Bessere Nachvollziehbarkeit gegenüber Management, Partnern und Auditoren.
- Grundlage für ein Editor‑UI, in dem Fachteams Formeln verwalten können (mit Kontrolle durch Review/Release).

## Roadmap (kompakt)
- Phase 1 – Pilot (2 Wochen): Eine repräsentative Formel („altruism_update“) wird in die Registry gebracht und produktiv geschaltet. Messgrößen: korrekte Ergebnisse, geringer Overhead, vollständige Audits.
- Phase 2 – Rollout (3–5 Wochen): Die wichtigsten weiteren deterministischen Formeln (Top‑5) werden migriert. Kontinuierliche Tests, Monitoring und schrittweise Aktivierung.
- Phase 3 – RNG‑nahe Formeln (1–2 Wochen): Zufallseinflüsse werden strikt getrennt und als Eingaben geführt. Erhöht Reproduzierbarkeit.
- Phase 4 – Governance & Optimierung (2–3 Wochen): Rollen/Prozesse finalisieren, Audit‑Ansichten, Performance‑Optimierungen (Caching, Batch‑Auswertung), Editor‑MVP.
- Meilensteine: Pilot produktiv → Top‑5 migriert → RNG‑nahe Formeln migriert → Governance auditiert → Optimierungen & Editor live.

(Gesamtrahmen: ca. 8–13 Wochen inkl. Puffer.)

## Risiken und Absicherung (in einfacher Sprache)
- Performance‑Risiko: Zusätzliche „Registry‑Schicht“ darf die Simulation nicht merklich verlangsamen.
  - Absicherung: Messen (Telemetry), Caching, Sammelauswertung. Akzeptanzgrenze: max. ~10% Zusatzzeit.
- Zufallseinflüsse (RNG): Zufall wird von den Formeln getrennt, damit Ergebnisse reproduzierbar bleiben.
  - Absicherung: Zentraler Zufallszahl‑Generator pro Lauf, feste Seeds, klare Eingaben an Formeln.
- Governance‑Risiko: Unkontrollierte Änderungen würden Vertrauen gefährden.
  - Absicherung: Rollenmodell (Editor/Reviewer/Approver/Operator), Freigabe‑Schritte, Audit‑Logs, Version‑Pinning. Ohne Freigabe keine produktive Änderung.

## Governance & Sicherheit
- Rollen und Prozesse:
  - Editor: erstellt/ändert Formeln und Tests.
  - Reviewer: prüft Inhalte und Tests.
  - Approver: gibt für Produktion frei.
  - Operator: steuert das produktive Setzen („Pinning“) der Versionen.
- Audit & Nachvollziehbarkeit:
  - Jede Änderung erzeugt einen Audit‑Eintrag (wer/was/wann/warum).
  - Produktionsläufe dokumentieren die verwendeten Formel‑Versionen.
- Sicherheit:
  - Nur freigegebene Versionen können produktiv gesetzt werden.
  - Fallback jederzeit möglich (vorherige Version oder Abschalten der Registry‑Funktionalität).

## Handlungsempfehlung
- Pilot unterstützen (Ressourcen für 2 Wochen bereitstellen: 1–2 Entwickler, Reviewer aus dem Fachteam).
- Nach dem Pilot auf Basis von Ergebnissen über die Skalierung entscheiden (weiterer Rollout, Editor‑Umfang, Governance‑Vertiefung).
- Parallel Review‑Kapazitäten und Rollen verbindlich benennen, damit Freigaben zeitnah erfolgen.

— Ende —
