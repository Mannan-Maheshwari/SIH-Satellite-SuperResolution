# SRM VISION Frontend

Frontend-only upgrade for the SRM VISION SIH 2026 PS 26142 prototype.

## Pages

- `/` — Home
- `/demo` — Existing satellite enhancement prototype workflow
- `/how-it-works` — Proposed final CNN + Transformer system
- `/applications` — Intended application areas

## Visual updates

- Dark green / mint satellite-tech theme retained
- CSS-built 3D Earth/globe visual with orbit animation
- Smooth route-level page entrance transition
- Responsive mobile navigation
- Existing backend API remains unchanged

## Run

```bash
npm install
npm run dev
```

The frontend expects the existing Node backend at:

`http://localhost:5000`

To use another backend:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Create `client/.env` with that value before starting Vite if needed.

## Demo

The Demo page calls:

`POST /api/enhance`

with form field:

`image`

No backend code is included or modified in this package.
