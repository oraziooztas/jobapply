# JobApply

A full-stack web application that automates the job application process. Upload your CV, generate AI-powered cover letters, track application statuses, and get job-matching scores -- all from a single dashboard.

## Features

- **CV Management:** Upload and parse PDF resumes with automatic skill extraction
- **AI Cover Letter Generation:** Generate tailored cover letters for each job posting using OpenAI
- **Application Tracking:** Full CRUD for job applications with status pipeline (Applied, In Review, Interview, Offered, Rejected)
- **Job Matching:** AI-powered match scoring between your profile and job descriptions
- **Auto-Fill:** Automated form filling for job application URLs via Playwright
- **Dashboard Analytics:** Overview of total applications, response rates, interview counts, and estimated time saved
- **Authentication:** Secure user sessions with Clerk

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI (Dialog, Tabs, Select, Alert Dialog, Toast, Label)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **AI:** OpenAI API (cover letter generation, job matching)
- **PDF Parsing:** pdf-parse
- **Browser Automation:** Playwright
- **Forms:** React Hook Form + Zod validation
- **Animations:** Motion (Framer Motion)

## Getting Started

### Prerequisites

- Node.js >= 18
- Supabase project with configured tables
- Clerk application for authentication
- OpenAI API key

### Installation

```bash
git clone <repository-url>
cd jobapply/webapp
npm install
```

### Configuration

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

### Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Project Structure

```
jobapply/
├── webapp/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with Clerk provider
│   │   ├── page.tsx             # Main dashboard (tabs: Dashboard, CV, Cover Letter, Applications, Job Match)
│   │   ├── api/                 # API routes (applications, cvs, cover-letters, job-matches, autofill)
│   │   ├── sign-in/             # Clerk sign-in page
│   │   └── sign-up/             # Clerk sign-up page
│   ├── components/
│   │   ├── ui/                  # Reusable UI components (Button, Card, Input, etc.)
│   │   └── providers.tsx        # Clerk provider wrapper
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
└── SPEC-DRAFT.md                # Project specification document
```

## Notes

- The application uses a tabbed interface with five sections: Dashboard, CV, Cover Letter, Applications, and Job Match.
- Cover letters are generated based on the user's uploaded CV skills and the target job description.
- The auto-fill feature uses Playwright to programmatically fill out job application forms from a provided URL.
- All data is persisted in Supabase and scoped to the authenticated user via Clerk.
