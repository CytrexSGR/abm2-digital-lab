# RNG Audit — Trennung von Zufall und Formelraum

Ziel: Alle RNG-Stellen identifizieren, bewerten und die Grundlage schaffen, um Formeln deterministisch zu halten (RNG nur als Input).

Scan-Befehl (ausgeführt im Repo-Root):

```
rg -n --hidden -S -g '!venv' -e '\\brandom\\.(random|randrange|choices)\\b' -e '\\bnp\\.random\\b' -e '\\brng\\.' .
```

Zusätzlich (Vollständigkeit):

```
rg -n --hidden -S -g '!venv' -e '\\brandom\\.(choice|choices|randint|uniform|random|randrange)\\b' digital-lab/backend
```

## Tabelle: RNG-Fundstellen (Backend)

| Datei:Zeile | Funktion | Zweck | Formel-nah? | Als Input ersetzbar? (Vorschlag) | Häufigkeit / Step |
|---|---|---|---|---|---|
| political_abm/agents.py:45 | decide_and_act | Investitions-Erfolg (Bernoulli p=success_probability) | Ja (Entscheidungsformel) | Ja: `investment_success_u: float ∈ [0,1]` (oder `investment_success: bool`) | ≈ N_agents |
| political_abm/managers/hazard_manager.py:25 | trigger_events | Hazard-Ereignis je Agent (Bernoulli p=hazard_prob) | Nein (Ereignislogik) | Nein (außer man will Ereignisse deterministisch einspeisen) | ≈ N_agents |
| political_abm/managers/media_manager.py:49 | select_source_for_agent | Medienquellen-Auswahl (gewichtete Ziehung) | Nein (Auswahl-Logik) | Nein (Auswahl bleibt RNG, Ergebnis wird an Formel übergeben) | ≈ N_agents |
| political_abm/agent_initializer.py:40 | create_agents | Initiale Milieu-Zuweisung (gewichtete Ziehung) | Nein (Initialisierung) | Nein (aber zentraler RNG nutzen) | einmalig pro Agent |
| political_abm/agent_initializer.py:51 | create_agents | Biome-Zuweisung (Zufall) | Nein (Initialisierung) | Nein (aber zentraler RNG nutzen) | einmalig pro Agent |
| political_abm/agent_initializer.py:77-78 | create_agents | Zufallsposition (uniform) | Nein (Initialisierung) | Nein (aber zentraler RNG nutzen) | einmalig pro Agent |
| political_abm/agent_initializer.py:90 | create_agents | Alters-Fallback (randint) | Nein (Initialisierung) | Nein (aber zentraler RNG nutzen) | einmalig |
| political_abm/utils.py:11 | generate_attribute_value | Beta-Verteilung | Nein (Attribut-Gen.) | Nein (als generative Quelle) | initial + je Bedarf |
| political_abm/utils.py:13 | generate_attribute_value | randint (uniform_int) | Nein (Attribut-Gen.) | Nein | initial + je Bedarf |
| political_abm/utils.py:15 | generate_attribute_value | uniform_float | Nein (Attribut-Gen.) | Nein | initial + je Bedarf |
| political_abm/utils.py:19 | generate_attribute_value | normal (geclippt) | Nein (Attribut-Gen.) | Nein | initial + je Bedarf |
| political_abm/utils.py:24 | generate_attribute_value | lognormal | Nein (Attribut-Gen.) | Nein | initial + je Bedarf |
| political_abm/utils.py:27 | generate_attribute_value | pareto | Nein (Attribut-Gen.) | Nein | initial + je Bedarf |
| political_abm/utils.py:29 | generate_attribute_value | random() in [0,1] | Nein (Fallback) | Nein | je Bedarf |

Hinweise:
- `resource_manager.update_agent_resources()` ruft `generate_attribute_value` je Agent pro Step auf (Einkommen) → RNG, aber nicht formel-nah (Formeln konsumieren deterministische Inputs).
- Frontend/Docs-Referenzen wurden ignoriert; relevant ist das Backend.

## Bewertung (Formel-Nähe)
- Formel-nahe RNG: ausschließlich `decide_and_act` (Investitions-Erfolg). → In die Eingaben der Formel überführen.
- Ereignis-/Auswahl-RNG: Hazard-Trigger, Medienauswahl, Initialisierungen → bleiben RNG, aber zentralisiert und auditierbar.

