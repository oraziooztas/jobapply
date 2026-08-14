# JobApply - Setup Instructions

Prima di eseguire l'applicazione, completa i seguenti passi di configurazione.

## 1. Creare un progetto Supabase

1. Vai su [https://supabase.com](https://supabase.com) e crea un account gratuito
2. Crea un nuovo progetto
3. Vai a Settings > API e copia:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

## 2. Configurare il Database Supabase

1. Vai a SQL Editor nel dashboard Supabase
2. Copia e incolla il contenuto del file `supabase/migrations/001_initial_schema.sql`
3. Esegui lo script SQL

Questo creerà tutte le tabelle necessarie:
- users
- cvs
- applications
- cover_letters
- job_offers
- job_matches

## 3. Creare Storage Bucket per CV

1. Vai a Storage nel dashboard Supabase
2. Crea un nuovo bucket chiamato `cvs`
3. Imposta come **Public** (per ora, per test)
4. Abilita il caricamento file per i file PDF

## 4. Configurare Clerk Authentication

1. Vai su [https://dashboard.clerk.com](https://dashboard.clerk.com) e crea un account
2. Crea una nuova applicazione
3. Copia le chiavi:
   - `Publishable Key` (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
   - `Secret Key` (CLERK_SECRET_KEY)

## 5. Configurare OpenAI API

1. Vai su [https://platform.openai.com](https://platform.openai.com)
2. Crea un account
3. Vai a API keys
4. Crea una nuova chiave API
5. Copia la chiave (OPENAI_API_KEY)

## 6. Configurare le Variabili d'Ambiente

Copia il file `.env.local.example` rinominalo in `.env.local`:

```bash
cp .env.local.example .env.local
```

Apri `.env.local` e compila tutte le variabili:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_LA_TUA_CHIAVE
CLERK_SECRET_KEY=sk_test_LA_TUA_CHIAVE

NEXT_PUBLIC_SUPABASE_URL=https://IL_TUO_PROGETTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=LA_TUA_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=IL_TUO_SERVICE_ROLE_KEY

OPENAI_API_KEY=sk-OPENAI_KEY

# Playwright
PLAYWRIGHT_BROWSE_DATA_DIR=/tmp/playwright-data

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 7. Installare Playwright Browsers

Dopo aver installato le dipendenze npm, installa i browser di Playwright:

```bash
npx playwright install chromium
```

## 8. Avviare l'Applicazione

```bash
npm run dev
```

L'applicazione sarà disponibile su: http://localhost:3000

## 9. Primo Utilizzo

1. Vai a http://localhost:3000
2. Fai login o registrati con Clerk
3. Vai alla tab "CV" e carica il tuo CV in PDF
4. Le skills verranno estratte automaticamente
5. Vai a "Cover Letter" per generare cover letter personalizzate
6. Vai a "Candidature" per tracciare le tue applicazioni
7. Vai a "Job Match" per calcolare quanto sei adatto alle offerte

## Troubleshooting

### Errore "Unauthorized"
- Assicurati di aver configurato Clerk correttamente
- Verifica che le chiavi API siano corrette

### CV upload fallisce
- Verifica che il bucket `cvs` esista in Supabase Storage
- Assicurati che sia pubblico o che le policy RLS siano configurate correttamente

### Cover letter non si genera
- Verifica che OPENAI_API_KEY sia corretta
- Controlla il credito disponibile sul tuo account OpenAI

### Auto-fill non funziona
- Installa i browser di Playwright: `npx playwright install chromium`
- Verifica che l'URL dell'offerta sia valido

### LinkedIn scraping non funziona
- Lo scraping di LinkedIn richiede un login
- Per produzione, considera l'uso di LinkedIn API o job aggregatori specializzati

## Funzionalità Implementate

✅ **Authentication**: Login/Registrazione con Clerk
✅ **CV Upload**: Caricamento e estrazione skills da PDF
✅ **Cover Letter Generation**: Generazione AI con OpenAI GPT-4o
✅ **Applications Tracking**: CRUD completo per candidature
✅ **Job Matching**: Algoritmo di matching tra CV e job offers
✅ **Auto-fill Forms**: Riempimento automatico forms con Playwright
✅ **LinkedIn Scraping**: Scraping job listings (semplificato)
✅ **Dashboard**: Statistiche e tracking real-time

## Note di Produzione

Per deploy in produzione:

1. Cambia le variabili d'ambiente per produzione
2. Imposta policy RLS appropriate per Supabase
3. Usa bucket privato per CV con signed URLs
4. Implementa rate limiting per API
5. Aggiungi logging e monitoring
6. Considera l'uso di queue jobs per operazioni lunghe
7. Implementa test e CI/CD
8. Backup regolare del database

## Costi Stimati

- **Supabase**: Free tier (500MB database, 1GB storage)
- **Clerk**: Free tier (5,000 active users)
- **OpenAI**: ~$0.01 per cover letter (GPT-4o)
- **Vercel/Hosting**: Gratis per MVP

## Monetizzazione (Futuro)

Per implementare il modello Freemium:

1. Implementare piano con limitazioni:
   - Free: 5 candidature/mese, 3 cover letter
   - Pro: €9.99/mese, illimitate
2. Integrazione Stripe per payments
3. Dashboard admin per analytics
4. Email notifications per engagement

## Supporto

Per problemi o domande, controlla:
- Console del browser per errori frontend
- Terminal per errori backend
- Dashboard Supabase per database
- Dashboard Clerk per auth
- Dashboard OpenAI per API usage
