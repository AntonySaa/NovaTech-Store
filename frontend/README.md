# Ecommerce Final Frontend

Frontend React para el proyecto final e-commerce.

## Ejecutar local

```bash
npm install
cp .env.example .env
npm run dev
```

## Variables de entorno

- `VITE_API_URL`: URL del backend (local o Render).
- `VITE_GOOGLE_CLIENT_ID`: Client ID de Google OAuth para login Gmail.

## Build para produccion

```bash
npm run build
```

## Deploy en Render (Static Site)

- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable:
  - `VITE_API_URL=https://TU-BACKEND.onrender.com`
  - `VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com`
