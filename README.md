# FSCE Case Digitization Dashboard

React + Vite + TypeScript frontend starter for the Federal Supreme Court scanning/editing workflow.

## Included

- Responsive light dashboard with collapsible icon sidebar
- Role-based navigation preview for Archive, Scanning, Editing, QC, DSpace, Department Head, and ICT
- Work queues for physical allocation, scanning, editing, quality control, DSpace submission, final approval, reports, and users
- Case metadata, judge/other PDF page counts, statuses, queue search, workflow action buttons
- API adapter with demo data and configurable FastAPI base URL
- CCMS lookup adapter intended to call the backend endpoint that invokes SQL Server 2000 `sp_getdetals`
- DSpace workflow stages and final publication approval step

## Run locally

Requirements: Node.js 20+ recommended.

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

The default `.env.example` uses demo data. To use the backend, set:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USE_DEMO_DATA=false
```

Then restart Vite.

## Expected backend API contract

The frontend API adapter currently expects these endpoints in live mode:

- `GET /api/cases` -> array or `{ "items": [...] }`
- `GET /api/dashboard/summary` -> `{ allocated, scanning, editing, qcPending, returned, approved, published, exceptions }`
- `GET /api/ccms/cases/{caseNo}` -> case details fetched server-side from legacy SQL Server 2000 using `sp_getdetals`
- `POST /api/cases/{id}/workflow` with `{ "action": "...", ...payload }`

Workflow actions used by the UI:

- `start_scanning`
- `finish_scanning`
- `start_editing`
- `submit_qc`
- `approve_qc`
- `return_for_correction`
- `submit_dspace`
- `forward_for_approval`
- `publish`

### Important integration notes

This frontend does **not** directly connect to SQL Server 2000 or DSpace. Keep credentials and integration logic on the backend. The FastAPI backend should:
1. Call `sp_getdetals` with a single case number and normalize its result to JSON.
2. Store workflow stages, operator assignments, page counts, file paths, and audit events in the workflow database.
3. Validate every transition against the authenticated user's server-side role.
4. Confirm `judge.pdf` and `other.pdf` exist, are readable, and have recorded page counts before QC submission.
5. Submit QC-approved PDFs and metadata to DSpace as private/unpublished.
6. Permit public publication only after the Archive Department Head approves.
7. Write immutable audit events for allocation, file changes, QC, repository actions, and publication.

## Current limitations / production checklist

- Demo role switch is for preview only; it is not authentication or security.
- Demo transitions update in-memory browser data only.
- DSpace upload and CCMS calls need backend implementation and credentials.
- Add real login/session handling, server-side RBAC, CSRF/CORS policy, validation, audit logging, tests, and deployment configuration before production.
- Map `WorkflowStage` values and field names to the existing backend contract as needed.

## Suggested workflow

Archive release and registration -> manual scanner allocation -> scan `judge.pdf` and `other.pdf` -> edit -> QC (full checks plus risk-based sample checks according to policy) -> DSpace private submission -> Archive Department Head final approval -> publication.
