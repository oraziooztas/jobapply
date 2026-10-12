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

---

## [2026-02-21] — Wave 1+2 candidature inviate

**Cosa fatto:**
- Ricerca 28+ aziende AI (Italia + internazionali), organizzate in 4 tier
- CV creato in 3 versioni (Tech EN, Tech IT, Research EN), PDF pronti
- 16 cover letter scritte (.md + .pdf) — 3 template: A (AI Agent), B (Foundation Model), C (NLP Italia)
- Wave 1+2: 9/9 candidature inviate (Mistral, DeepL, Translated, Aleph Alpha, DeepMind, Synthesia, Stability, Adept, Onfido)
- LinkedIn: 6 job alert + 7 aziende seguite + headline aggiornata
- Guida operativa `guida_invio_candidature.md` con istruzioni per-azienda

**Problemi incontrati:**
- Playwright non funziona (conflitto Chrome) — tutto fatto via Safari manuale
- CRIF vecchia posizione (602658201) chiusa, trovata nuova (943951201)

---

## [2026-02-22] — Wave 3 email + fix contatti

**Cosa fatto:**
- Preparati 3 testi email copia-incolla per Aindo, Interactive Media, FBK
- Trovato contatto FBK: Dr. Luisa Bentivogli (head HLT-NLP)
- Scoperto che 2/3 email rimbalzate: career@aindo.com e bentivogli@fbk.eu inesistenti
- Ricercati indirizzi corretti: Aindo = careers@aindo.com (con la s) o form su aindo.com/careers; FBK = bentivo@fbk.eu
- Interactive Media inviata con successo a info-web@imnet.com

**Lezioni apprese:**
- Verificare SEMPRE le email prima di preparare i testi (career vs careers, formato cognome FBK abbreviato)
- FBK usa formato abbreviato: bentivo@fbk.eu, non bentivogli@fbk.eu

**Prossimi passi:**
- Re-inviare Aindo (careers@aindo.com) e FBK (bentivo@fbk.eu) con indirizzi corretti
- Completare Wave 3 form: CRIF (SuccessFactors), expert.ai, Domyn (Workable)
- Candidatura LinkedIn: Skillvue
- Scrivere cover letter Tier 2: Cohere, Hugging Face, Sierra AI, Harvey AI (deadline 23-28 Feb)

---

## [2026-02-25] — 7 candidature inviate (sessione serale), md_to_pdf.py creato

**Cosa fatto:**
- Ricerca 15 nuove aziende (italiane + internazionali)
- Scritte 15 cover letter con regole /human-writer, PDF generati
- Creato md_to_pdf.py per PDF ben formattati via HTML+CSS (sostituisce weasyprint diretto)
- Inviate: Musixmatch, Contents.com, NAVER Labs Europe, Domyn, Altilia, Kineton, Thomson Reuters (Applied Scientist NLP/GenAI)
- Skippate 11 aziende per: vincoli location (Anthropic, Rasa), portali rotti (Exprivia, Cy4Gate), niente posizioni (Unbabel, Helsing, Jina), profilo non adatto (Booking, Deda), no spontanea (Textkernel), duplicato (iGenius=Domyn)

**Lezioni apprese:**
- Molte aziende internazionali richiedono work authorization locale — verificare PRIMA di scrivere cover letter
- weasyprint su .md puro rende male — sempre usare md_to_pdf.py via HTML

---

## [2026-02-25] — Musixmatch + Contents.com inviate, skill /human-writer creata

**Cosa fatto:**
- Rimosso progetto "Ralph" da CV Desktop (non era suo) — creati template Typst (CV_desktop_EN.typ, CV_desktop_IT.typ)
- Ricerca 8 aziende italiane NLP-aligned: Musixmatch, Volta, Neodata, Contents.com, Normo.ai, Clearbox AI, ItaliaNLP CNR, MilaNLP Bocconi
- Scritte 8 cover letter con PDF
- Creata skill /human-writer per documenti anti-AI-detection (no bold, no markdown headers, tono naturale)
- Riscritte tutte le 8 cover letter con regole human-writer
- Inviate: Musixmatch (Lever), Contents.com (careers page)
- Scartate dall'utente: Neodata, Clearbox, ItaliaNLP CNR, MilaNLP Bocconi

**Problemi incontrati:**
- Cover letter iniziali troppo "AI-generated" (em dashes, bold, headers markdown) — risolto con skill dedicata

**Prossimi passi:**
- Valutare Normo.ai e Volta Software (cover letter pronte)
- Monitorare risposte Musixmatch e Contents.com

---

## [2026-04-09] — Fork career-ops + setup automazione NLP/Ling

**Cosa fatto:**
- Fork di `santifer/career-ops` → `oraziooztas/career-ops` clonato in `jobapply/career-ops/`
- **Playwright FIXED**: `npx playwright install chromium` risolve il conflitto Chrome storico (ora usa Chromium headless isolato in `~/Library/Caches/ms-playwright/`)
- Import asset esistenti: CV copiato in `cv.md`, 44 candidature legacy (Wave 1-6) migrate in `data/applications.md`, dedup ledger `scan-history.tsv` seedato
- `config/profile.yml` custom: archetype NLP/Ling (NON CS), exclusions anti-CS-degree, bilingue IT/EN con auto-detect JD, scoring weights custom (linguistic_fit +5, hard_cs_requirement -5)
- `modes/_profile.md` custom: 7 archetype Orazio-specific (NLP Engineer, Computational Linguist, Applied AI/Claude, Research Assistant, Prompt Engineer, MT/Voice, Digital Humanities) con framing + proof point mapping
- `modes/cover-letter.md` nuovo mode custom bilingue con regole human-writer (anti-AI-detection)
- `portals.yml` riscritto: 40+ aziende IT/EU NLP-friendly (Babelscape, Almawave, FBK, CNR-ILC, IIT, MilaNLP, Translated, Musixmatch, DeepL, Aleph Alpha, Mistral, Hugging Face, Speechmatics, Causaly ecc.). US/UK/CH disabilitate di default per vincolo visa.
- Spostato tracker: `04_DOCUMENTI/CV/application_tracker.md` → symlink verso `career-ops/data/applications.md`. Backup legacy salvato come `.legacy-2026-02-27.bak`.
- Aggiornato MAP.md con nuova struttura career-ops

**Decisioni prese:**
- Fork invece di clone → customizzazioni restano upstreamabili come PR
- Bilingue IT+EN con auto-detect dalla lingua JD (non hardcoded)
- Archetype completamente riscritti (quelli default di Career Ops sono US tech-heavy, sbagliati per profilo linguistico)
- Hard exclusions: Pure SWE, DevOps, SRE, Mobile Dev, Embedded, Blockchain
- Tracker single-source-of-truth in `career-ops/data/applications.md`, vecchio path diventa symlink retrocompat
- Webapp Next.js (`webapp/`) DEPRECATED — career-ops copre tutti i use case della spec

**Problemi risolti:**
- Playwright/Chrome conflict storico → Chromium headless isolato
- Archetype generici Career Ops → riscritti per profilo NLP/Ling

**Rischi aperti:**
- Mode `modes/it/` non tradotti completamente (solo cover-letter è bilingue) → se arriva un update upstream potrebbe esserci merge conflict
- Scoring weights custom non testati E2E ancora (serve prima run reale)
- Aziende US/UK/CH hardcoded come disabled: perdiamo remote EU legit da aziende con HQ lì (es. Cohere ha remote EU)

**Prossimi passi:**
1. **Test E2E**: eseguire `claude` dalla cartella `career-ops/` → onboarding wizard → paste 1 URL reale
2. Far girare `/career-ops scan` sulle aziende tracked per trovare nuove posizioni
3. Valutare se tradurre `modes/` in italiano (modes/it/) o lasciare solo EN
4. Re-inviare Aindo (careers@aindo.com) e FBK (bentivo@fbk.eu) via career-ops con cover letter nuove

---

## [2026-02-25] — Accenture inviata + Leonardo/Wellnet skip + Lexroom rifiutata

**Cosa fatto:**
- Lexroom: prima risposta negativa ricevuta — tracking aggiornato
- Generati PDF cover letter (pandoc+weasyprint) per Leonardo, Wellnet, Accenture
- Leonardo Workday: 0 posizioni AI/NLP internship allineate — SKIP
- Wellnet: link posizione 404, anche /job-opportunities/ morto — SKIP
- Accenture: cover letter riadattata da "Stage Data & AI" a "Prompt Engineer", PDF rigenerato, candidatura inviata via accenture.com/it-it/careers

**Problemi incontrati:**
- Workday links diretti (Leonardo, Accenture) non aprono in Safari — usato portale principale
- Wellnet: posizione rimossa senza preavviso

**Prossimi passi:**
- Valutare nuove posizioni: G-Research (Londra), Fraunhofer Italia (Bolzano), PwC (Milano)
- Riprovare CRIF, expert.ai, Domyn, Skillvue se tempo disponibile

## [2026-07-18] — CV ATS/AIEvals v2 (airesume) + asset web

**Cosa fatto:**
- `resume/CV_Orazio_Oztas_AIEvals_ATS_EN.pdf` (1 pagina A4, Helvetica, legature OFF per parsing ATS) generato via HTML + Chrome headless; sorgente autorevole in `_source.md` (il `.md` senza suffisso e' l'estrazione automatica pdf2md, puo' essere stale)
- Contenuto: resume Notion AIEvals aggiornato con agent-failure-eval-bench (claim safe: eval design + benchmark hygiene), vault 2.300+, contatti reali, tutor Compiti@Casa come voce separata (2026, non sotto BA)
- Stile AI-ese intenzionale (skill airesume, self-preference bias); per lettori umani/startup piccole usare l'approccio human-writer
- Contesto: web CV live su oraziooztas.github.io/cv (repo oraziooztas/cv, sorgente in 01_PROGETTI/landing-portfolio/web-cv)

---

## [2026-08-14] — webapp esce dal gitlink orfano, il repo pubblico contiene finalmente l'app

**Il difetto.** `webapp/` era un gitlink (mode 160000) senza `.gitmodules`, e
il repo interno non aveva remote: chi clonava `oraziooztas/jobapply` trovava
una directory che git non poteva risolvere e nessun modo di recuperarla. In più
il puntatore era *stale* — il gitlink stava a `8a66377` mentre il repo interno
era già a `a231971`, da cui il ` M webapp` permanente in `git status`. Sul lato
pubblico: 5 KB, `language: null`, mentre il README prometteva Next.js 16,
Supabase, Clerk, OpenAI e Playwright. Segnalato dall'audit dell'08/08, che per
questo aveva **sospeso jobapply dalla CV-safe list**.

**Cosa è stato fatto, e perché non è un semplice `rm -rf webapp/.git`.** La
storia interna (2 commit) è stata trasferita nel repo esterno con un
subtree-merge fatto a mano, non buttata via:

```bash
git rm --cached webapp && git commit          # via il gitlink
git remote add webapp-src "$PWD/webapp" && git fetch webapp-src
git merge -s ours --no-commit --allow-unrelated-histories webapp-src/main
git read-tree --prefix=webapp/                 webapp-src/main   # niente -u
git commit && git remote remove webapp-src
```

`read-tree` **senza `-u`** è il punto: i file erano già sul disco e identici
all'albero committato, quindi si aggiorna solo l'indice e il working tree non
viene toccato. Con `-u` git si sarebbe fermato su «untracked working tree file
would be overwritten». Il merge `e32d9c1` ha due genitori: `46ae2e6` e
`a231971`, quindi `8a66377` e `a231971` restano raggiungibili per sempre. Il
`.git` interno non è stato cancellato ma spostato, e ne esiste un
`git bundle --all` di backup.

**Verifica, fatta come la fa un recruiter e non come la fa l'autore.** Clone
anonimo da GitHub: 41 file sotto `webapp/`, 800 KB totali, ~2.300 righe fra
TS/TSX/SQL/CSS, 7 API route implementate (78-166 righe l'una), `page.tsx` da
790. Le dipendenze coprono tutto quello che il README dichiara — `openai`,
`pdf-parse`, `playwright`, `react-hook-form`, `@supabase/supabase-js`,
`@clerk/nextjs`. Scan segreti sul diff pushato: 0 match, `.env.local.example`
porta solo placeholder.

⚠️ **Il campo `.size` dell'API GitHub è rimasto a 5 KB anche dopo il push**
(`language` invece è passato a `TypeScript`): si aggiorna con ritardo. Vale il
clone, non il campo — l'audit dell'08/08 aveva usato proprio quel campo come
prova.

**Stato CV.** Riammesso in CV-safe list il 14/08. Claim consentito: app
full-stack Next.js/Supabase/Clerk. Non è deployata e non ha utenti: non si cita
come prodotto in uso.


## [2026-10-12] — `main` non compilava: tre fix e build verde (AFK)

**Trovato** clonando il repo pubblico da anonimo e facendo `npm ci` + `next build`: `main` falliva (exit 1). Il 14/08 il riammesso in CV-safe list aveva verificato che i file c'erano, non che compilassero.

**Fix:**
- `app/api/cvs/route.ts`: il lockfile installa `pdf-parse` 2.4.5, ma il codice usava l'API v1 (`import pdf from 'pdf-parse'`, che in v2 non ha default export). Ora `new PDFParse({ data })` + `getText()` + `destroy()`.
- `app/api/applications/[id]/route.ts`: da Next 15 `params` è una `Promise`; gli handler PATCH e DELETE la dichiaravano come oggetto e il type-check di `next build` falliva.
- `components/providers.tsx`: un componente client chiamava l'API backend di Clerk con `CLERK_SECRET_KEY`, che nel browser non esiste (e renderla pubblica avrebbe esposto il segreto). La sync passa a `app/api/users/sync/route.ts` lato server, con `currentUser()` e upsert su `clerk_id` (UNIQUE nello schema).
- `app/api/job-matches/route.ts`: tipo esplicito al posto di `any`.

**Verifica:** `tsc --noEmit` exit 0; ESLint 0 errori (da 2), 11 warning (da 14); `next build` exit 0 nel clone pulito, con variabili d'ambiente fittizie. Il comportamento a runtime (upload PDF, sync utente) **non è verificato**: serve un progetto Supabase e Clerk veri.

**Nota locale:** in questa copia `node_modules/pdf-parse` è incompleto (manca `ScreenshotResult.js`, presente con `npm ci`): prima di un build locale serve `npm ci`.
