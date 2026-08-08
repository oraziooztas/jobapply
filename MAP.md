# MAP — Project Overview

> Hub operativo per candidature lavoro AI/NLP: ricerca aziende, CV, cover letter, tracking. **Motore automazione: `career-ops/`** (fork di santifer/career-ops, customizzato per profilo NLP/Ling non-CS).

## Struttura

```
jobapply/
├── career-ops/                    ⭐ MOTORE PRINCIPALE (fork santifer/career-ops)
│   ├── cv.md                      # CV canonico (copia di CV_Orazio_Oztas_Tech_EN.md)
│   ├── config/profile.yml         # Profilo custom NLP/Ling, archetype anti-CS
│   ├── modes/_profile.md          # Override archetype + framing + scoring weights
│   ├── modes/cover-letter.md      # Mode custom human-writer (anti-AI-detection)
│   ├── portals.yml                # 40+ aziende IT/EU NLP-friendly
│   ├── data/applications.md       # Tracker candidature (44 entry legacy)
│   ├── data/scan-history.tsv      # Dedup ledger (44 URL già provati)
│   └── [resto del repo vanilla]
├── SESSION_CHECKPOINT.md          # Checkpoint sessione corrente
├── SPEC-DRAFT.md                  # Bozza specifica webapp SaaS (DEPRECATED)
├── guida_invio_candidature.md     # Guida operativa pre-career-ops (storica)
├── guida_wave6.md                 # Guida Wave 6 (storica)
├── ricerca_aziende_ai_italia.md   # Ricerca aziende (ora in portals.yml)
├── linkedin_job_alerts_guide.md   # Guida alert LinkedIn
├── CV_Orazio_Oztas_Tech_EN.pdf    # CV copia locale
├── cover_letters/                 # 16 cover letter storiche (.md + .pdf)
│   ├── *_cover_letter.md          # Sorgenti Markdown
│   └── *_cover_letter.pdf         # PDF pronti (manuali, pre-career-ops)
└── webapp/                        # Scaffold Next.js (DEPRECATED - uso career-ops)
```

## Tracker path
**Single source of truth:** `career-ops/data/applications.md`
**Legacy path (symlink):** `~/Desktop/Claude Code/04_DOCUMENTI/CV/application_tracker.md` → punta al file sopra.
Backup legacy: `~/Desktop/Claude Code/04_DOCUMENTI/CV/application_tracker.md.legacy-2026-02-27.bak`

## File chiave

| File | Cosa fa |
|------|---------|
| `career-ops/config/profile.yml` | Profilo candidato + archetype NLP + exclusions anti-CS |
| `career-ops/modes/_profile.md` | Override archetype career-ops per profilo non-CS |
| `career-ops/modes/cover-letter.md` | Mode custom human-writer bilingue IT/EN |
| `career-ops/portals.yml` | 40+ aziende tracked (Italia/EU NLP-friendly) |
| `career-ops/data/applications.md` | Tracker canonico — 44 entry legacy + nuove da career-ops |
| `career-ops/data/scan-history.tsv` | Dedup ledger per scan automatico |
| `cover_letters/` | 16 cover letter storiche pre-career-ops |
| `SESSION_CHECKPOINT.md` | Stato sessione per ripresa rapida |

## Stato candidature

| Wave | Aziende | Stato |
|------|---------|-------|
| Wave 1+2 | 9 (Mistral, DeepL, Translated, etc.) | 9/9 inviate |
| Wave 3 | 7 (CRIF, FBK, Aindo, IM, expert.ai, Domyn, Skillvue) | 3/7 inviate |
| Wave 4 | 5 (Heres, Bytek, Amazon, Max Mara, Accenture) | 5/5 inviate |
| Skip | Leonardo (0 posizioni), Wellnet (404), Prometeia (404) | — |
| Risposte | Lexroom: RIFIUTATA 2026-02-24 | 1 rifiuto |

## Tracker principale

`career-ops/data/applications.md` (symlink da `04_DOCUMENTI/CV/application_tracker.md`)

## Workflow career-ops

1. **Setup one-time**: `cd career-ops && claude` → onboarding wizard automatico
2. **Paste JD**: incolla URL o testo di un JD → `/career-ops auto-pipeline <URL>`
3. **Scan aziende**: `/career-ops scan` (cerca nuove posizioni nelle 40+ aziende tracked)
4. **Genera cover letter**: `/career-ops cover-letter <company> <role>` (usa regole human-writer)
5. **Tracker**: `/career-ops tracker` per overview stato candidature
6. **Interview prep**: `/career-ops interview-prep <company>` per prep mirato

## Note

- **Playwright FIXED 2026-04-09**: `npx playwright install chromium` ha risolto il conflitto Chrome. Ora usa Chromium headless isolato in `~/Library/Caches/ms-playwright/`.
- CV principale: `04_DOCUMENTI/CV/CV_Orazio_Oztas_Tech_EN.pdf`
- Webapp SaaS (`webapp/`) DEPRECATED — sostituito da career-ops fork
- Orazio NON è Software Engineer CS → archetype custom NLP/Ling/Applied AI (vedi `modes/_profile.md`)
- Cover letter bilingue con auto-detect lingua JD
