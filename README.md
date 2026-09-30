# RAAS GrantScreen AI

RAAS GrantScreen AI is a prototype for an AI-assisted grant proposal screening workflow tailored to Rwanda-focused NRIF-type grant calls. It is designed for assessment and demonstration purposes and is not an official integration with RIGMS or any live government grant system.

## Problem statement

Grant officers reviewing large numbers of proposals often need to triage applications quickly while checking eligibility, completeness, duplication risk, and textual overlap. The workflow requires technology that can:

- assess rule-based eligibility deterministically
- identify missing required information
- compare proposals against historical work
- surface potential overlap without claiming plagiarism
- support a human-in-the-loop decision process
- produce a draft conclusion and applicant-facing notification

## Proposed solution

This prototype combines a React front end with a local-state application data model to simulate the core grant screening workflow:

- applicant registration and application submission
- role-based access for applicant, officer, and admin
- screening queue and application detail views
- deterministic eligibility and completeness checks
- AI advisory analysis through a clean abstraction layer
- historical proposal comparison and overlap warnings
- audit logging and human review flow
- localized demo content for Rwanda-specific grant scenarios

## User roles

- ADMIN: manages the system and sees the broader dashboard/statistics
- GRANT_OFFICER: runs screening and makes final decisions
- APPLICANT: creates and submits an application only for their own record

## Tech stack

- React 19 + Vite
- TypeScript
- Tailwind CSS v4
- React Router
- Recharts
- Lucide React
- Express API server
- SQLite database for persistence
- bcrypt hashing for password storage

## Architecture

- Frontend: Vite + React application in src/
- Backend: Express API in server/index.js
- Database: SQLite file in data/raas.db
- Auth model: real password validation with bcrypt and role-based access
- AI layer: src/services/aiService.ts abstraction with a local rule-based demo provider

## AI architecture

This prototype intentionally does not hardcode a fake “success” result as if it came from a real LLM. Instead, it exposes a service abstraction with a provider status check and structured screening output. In production, the same interface can be connected to a backend AI API such as OpenAI or Gemini.

## Database design

The application now persists data using SQLite with the following tables:

- users
- applications
- screening_results
- audit_logs

These tables support the full user lifecycle, application intake, screening outcomes, and review trail. The schema is intentionally simple and can be migrated to PostgreSQL or Firestore in a production environment.

## Authentication

Authentication is backed by the Express API and SQLite database.

Demo credentials:

- admin@raas.rw / Admin2025!
- officer@raas.rw / Officer2025!
- applicant@raas.rw / Applicant2025!

Applicants can also create a new account through the registration screen. Passwords are hashed with bcrypt before storage.

## Security

- secrets are not stored in the repo
- the app does not expose real AI credentials
- role-based route guards are implemented in the frontend and backed by the server-side user model
- production-grade RBAC and audit enforcement should be upgraded with a managed auth provider before deployment to production

## Local setup

1. Install dependencies:
   npm install
2. Start the backend API:
   npm run server
3. Start the frontend:
   npm run dev -- --host 0.0.0.0
4. Open the Vite URL in the browser, typically http://localhost:8444/

The API runs locally on http://localhost:4000.

## Environment variables

Create a .env file with values such as:

```bash
VITE_AI_PROVIDER=local-demo
VITE_API_BASE=/api
```

In a live deployment, the provider would be replaced with real backend settings such as Firebase config and LLM API keys stored server-side.

## Sample data

The prototype includes fictional sample applications and historical proposals that reflect Rwanda-focused research themes, but they are clearly demo and not official confidential data.

## Testing

Run:

npm run build

This validates the production build for the current prototype.

## Deployment

This app is configured for a frontend + backend workflow. The frontend can be deployed to Vercel, while the API can be hosted on a Node-compatible service such as Render or Railway. For a production deployment, put the database and environment variables on the backend host and keep the frontend talking through a configured API base URL.

## Live demo URL

Frontend: https://build-raas-grant-screen-bu215o8qc-clesab.vercel.app
API: http://localhost:4000 while running locally

## Known limitations

- AI analysis remains a local demo/provider abstraction rather than a fully live external LLM call
- No production-managed auth provider or enterprise RBAC layer
- No file storage or PDF generation service yet
- Database is SQLite for the prototype and should be upgraded for multi-user production workloads

## Future improvements

- Replace SQLite with PostgreSQL or Firestore for production-scale workloads
- Add a secure server-side LLM call and API key management
- Add file upload, PDF generation, and notification workflows
- Integrate a managed auth provider such as Clerk, Supabase Auth, or Firebase Auth
- Add backend validation and authorization checks for all sensitive actions

## Disclaimer

This project is a prototype for the RAAS internship practical assessment and is not an official production system for live grant evaluations.
