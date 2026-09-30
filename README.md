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
- Local demo state storage with browser localStorage

## Architecture

- Frontend: Vite + React application in src/
- State: local in-memory/localStorage simulation of Firebase-like collections
- Auth model: demo role-based login and applicant registration
- AI layer: src/services/aiService.ts abstraction with a local rule-based demo provider

## AI architecture

This prototype intentionally does not hardcode a fake “success” result as if it came from a real LLM. Instead, it exposes a service abstraction with a provider status check and structured screening output. In production, the same interface can be connected to a backend AI API such as OpenAI or Gemini.

## Database design

The project uses localStorage to simulate the expected Firestore collections and records in a demo environment, including:

- users
- applications
- screening_results
- historical_proposals
- audit_logs

The app is designed to be compatible with a Firebase/Firestore migration without breaking the current front-end prototype.

## Authentication

Authentication is currently simulated for demo use:

- admin@raas.rw / Admin2025!
- officer@raas.rw / Officer2025!
- applicant@raas.rw / Applicant2025!

Applicants can also create a local account through the registration screen. This is prototype-only and not a secure production auth flow.

## Security

- secrets are not stored in the repo
- the app does not expose real AI credentials
- role-based route guards are implemented at the front-end level
- real backend security rules are not present because this is a front-end prototype without Firebase backend configuration

## Local setup

1. Install dependencies:
   npm install
2. Start the app:
   npm run dev
3. Open the local Vite URL in the browser.

## Environment variables

Create a .env file with values such as:

```bash
VITE_AI_PROVIDER=local-demo
```

In a live deployment, the provider would be replaced with real backend settings such as Firebase config and LLM API keys stored server-side.

## Sample data

The prototype includes fictional sample applications and historical proposals that reflect Rwanda-focused research themes, but they are clearly demo and not official confidential data.

## Testing

Run:

npm run build

This validates the production build for the current prototype.

## Deployment

This app is configured for Vite static deployment. A production-ready version should be deployed to Vercel or a similar frontend host, with Firebase or another backend for real auth, database, and AI services.

## Live demo URL

No production deployment is configured in this prototype yet.

## Known limitations

- No real Firebase backend, Firestore, or Cloud Functions
- No real AI API integration
- No real PDF generation service or secure document storage
- No production-grade auth or RBAC enforcement beyond front-end route guards
- Data is local to the browser in demo mode

## Future improvements

- Replace local storage with Firebase Auth + Firestore
- Add Cloud Functions for AI analysis and PDF generation
- Integrate an LLM API securely on the server side
- Add real role-based access rules and audit trail persistence
- Add file uploads and secure storage integration
- Add real notification delivery and PDF export workflows

## Disclaimer

This project is a prototype for the RAAS internship practical assessment and is not an official production system for live grant evaluations.
