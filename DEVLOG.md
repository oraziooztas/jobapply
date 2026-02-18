# DEVLOG

Log cronologico di decisioni, problemi e lezioni per questo progetto.

---

## [2026-02-18] — Sync docs iniziale

**Cosa fatto:**
- Progetto in fase di ideazione/scaffolding: SPEC-DRAFT.md scritto con concept e features richieste, webapp Next.js scaffoldata ma vuota (solo layout di default)
- Lo scopo e' automatizzare le candidature lavoro: auto-fill form, generazione cover letter con AI, tracking candidature, matching offerte con profilo
- Webapp in `webapp/` e' un Next.js 15 + TypeScript + Tailwind bootstrap vuoto con un solo commit iniziale

**Decisioni prese:**
- Target: B2C SaaS per job seekers (uso personale + vendita)
- Stack tecnico proposto: Next.js + TypeScript + Tailwind (frontend), FastAPI o Node.js (backend), Groq/OpenAI (AI cover letter), Playwright (browser automation), Supabase (database), Clerk/NextAuth (auth)
- Input utente: CV in formato PDF come base per generare cover letter personalizzate
- Domande aperte ancora da decidere: modello monetizzazione, formato (estensione browser vs web app), approccio ToS, budget API

**Problemi incontrati:**
- Nessuno (sync iniziale)

**Lezioni apprese:**
- Il progetto e' ancora in fase di spec — la webapp scaffoldata non ha ancora logica applicativa
- L'uso di Playwright sia come tool di automazione browser (per auto-fill form) sia come dipendenza del progetto betwise-social mostra la versatilita' del tool
- La domanda critica non ancora risolta: estensione browser (Manifest V3) vs web app — determina completamente l'architettura

**Prossimi passi:**
- Completare l'intervista di spec (SPEC-DRAFT.md ha domande aperte segnate con TODO)
- Decidere il formato: estensione browser o app web
- Definire il modello di monetizzazione (freemium/subscription/lifetime)
- Scrivere SPEC.md completo prima di iniziare lo sviluppo
