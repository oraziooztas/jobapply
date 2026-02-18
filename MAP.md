# MAP — Project Overview

> Tool B2C SaaS per automatizzare le candidature lavoro: auto-fill form, generazione cover letter con AI, tracking candidature e matching offerte — ancora in fase di spec/scaffolding.

## Struttura

```
jobapply/
├── SPEC-DRAFT.md        # Bozza specifica: concept, features, stack tecnico, domande aperte
└── webapp/              # Scaffold Next.js (vuoto, solo setup iniziale)
    ├── app/
    │   ├── layout.tsx   # (default Next.js)
    │   ├── page.tsx     # (default Next.js)
    │   └── globals.css
    ├── public/          # Asset SVG default Next.js
    ├── next.config.ts
    ├── tsconfig.json
    ├── eslint.config.mjs
    └── postcss.config.mjs
```

## File chiave

| File | Cosa fa |
|------|---------|
| `SPEC-DRAFT.md` | Specifica di progetto: problema da risolvere, 5 features richieste, stack tecnico proposto, domande aperte da decidere |
| `webapp/app/page.tsx` | Entry point app (attualmente pagina default di Next.js — nessuna logica) |

## Entry Points

| Azione | Comando |
|--------|---------|
| Avvia dev server | `cd webapp && npm run dev` |
| Build produzione | `cd webapp && npm run build` |
| Lint | `cd webapp && npm run lint` |
| Installa dipendenze | `cd webapp && npm install` |

## Convenzioni

- **Linguaggio:** TypeScript
- **Stile:** Tailwind CSS v4
- **Database:** Supabase (pianificato, non ancora implementato)
- **Deploy:** Vercel (pianificato)

## Note

- Progetto in fase di spec — nessuna logica applicativa ancora scritta
- Domanda critica aperta: estensione browser (Manifest V3) vs web app — determina l'architettura completa
- Playwright pianificato per browser automation (auto-fill form su LinkedIn e altri siti)
- AI per cover letter: Groq API (piu' economica) o OpenAI come fallback
- Webapp usa Next.js 15 con React 19 e Tailwind v4 — stack molto recente
- Il progetto e' in `learning-experiments/` ma ha potenziale commerciale (B2C SaaS)
