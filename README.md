# Vyra-X Admin Dashboard

Premium full-stack dashboard for real-time emotion detection, snapshot intelligence, behavioral analytics, and Cloudflare-backed media delivery.

## Stack

- Frontend: React functional components, TanStack Query polling, Recharts analytics, modern CSS glassmorphism styling
- Backend: Express, MongoDB/Mongoose, Cloudflare R2 upload pipeline

## Run

```bash
npm install
npm install --prefix backend
npm run dev
npm run dev:backend
```

The frontend runs on Vite and proxies `/api` and `/uploads` to the backend during development.

If you deploy the frontend separately from the backend, set `VITE_API_BASE_URL` to your backend API base, for example `https://your-backend-url/api`.

## Build

```bash
npm run build
```

For production, run the backend after building the frontend. The backend serves the compiled `dist` output when it exists.

```bash
npm run start:backend
```

## Notes

- A persistent `sessionId` is generated with `crypto.randomUUID()` and stored in `localStorage`.
- The dashboard polls these session-scoped endpoints every 2 seconds: `/api/emotions?sessionId=`, `/api/snapshots?sessionId=`, and `/api/summary?sessionId=`.
- Snapshot uploads are compressed to WebP on the backend, stored in Azure Blob Storage when configured, and persisted in MongoDB as public image URLs plus metadata.
- MongoDB stores sessions, emotion events, and snapshots. The dashboard no longer uses mock data.
- The backend also exposes ingest routes for upstream emotion detection and snapshot uploads.

## Deployment

- Vercel frontend: set `VITE_API_BASE_URL` to the Railway backend API URL and deploy the repo root.
- Railway backend: set `MONGODB_URI`, `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER_NAME`, `AZURE_STORAGE_PUBLIC_URL`, `STORAGE_PROVIDER=azure`, and `HOST=0.0.0.0`.
