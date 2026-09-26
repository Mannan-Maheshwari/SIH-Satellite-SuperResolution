# SRM Vision — Satellite Resolution Enhancement Prototype

A MERN-style prototype for SIH PS 26142 demonstrating the intended user workflow:

Upload Satellite Image → Processing → Enhanced Resolution Output → Before/After Comparison → Download

## Important prototype note

This repository demonstrates the **product workflow and integration prototype**. The computational image-enhancement engine is represented by prepared demonstration outputs. It does not claim to contain a trained super-resolution model or validation/trust layer.

The UI uses satellite-specific language and includes a clearly marked "Prototype Demonstration" label.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB-ready Mongoose model
- Styling: Plain CSS (no external UI dependency)

## Run

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs on the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Demo behavior

The frontend sends the uploaded image to the backend. The backend simulates processing for several seconds and selects a prepared enhanced satellite image from `server/public/demo/`.

The demo is designed to be recorded as a prototype video without requiring a trained enhancement engine.

## Demo images

The repository includes generated synthetic satellite-style demonstration images so the project works immediately without downloading third-party imagery. Replace them with your own properly sourced satellite imagery if needed.

## MongoDB

MongoDB is optional for the visual demo. The backend includes a Mongoose model and will persist analysis metadata when `MONGODB_URI` is configured.

Example `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/srm_vision
CLIENT_URL=http://localhost:5173
```

## Production disclaimer

Do not present the prepared demonstration output as live model inference. For an actual SIH implementation, replace the prototype enhancement service with the intended super-resolution module and add the planned trust/validation layer.
