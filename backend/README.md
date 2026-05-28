# Ecommerce Final Backend

API REST para el proyecto final de e-commerce.

## Stack

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT + bcrypt

## Requisitos

- Node.js 20+
- PostgreSQL (local o Docker)

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

```bash
cp .env.example .env
```

Si usas Docker Compose local:

```env
DATABASE_URL=postgresql://ecommerce_user:ecommerce_pass@localhost:5435/ecommerce_final?schema=public
```

## Instalacion

Primero, desde el directorio raiz del proyecto:

```bash
docker compose up -d --build
```

Luego, en `backend/`:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Validacion automatizada:

```bash
npm run validate:e2e
npm run validate:3x
```

## Credenciales demo (seed)

- Admin:
  - email: `admin@ecommercefinal.com`
  - password: `Admin123*`

## Login con Google (Gmail)

Configurar `GOOGLE_CLIENT_ID` en backend y el mismo valor en frontend como
`VITE_GOOGLE_CLIENT_ID`.

Endpoint usado:

- `POST /api/auth/google` con body `{ "idToken": "..." }`

## Endpoints principales

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `POST /api/products` (ADMIN)
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `POST /api/orders/checkout`
- `GET /api/orders/my`
- `GET /api/orders` (ADMIN)

## Deploy en Render (Web Service)

- Build Command: `npm install && npm run prisma:generate && npm run prisma:deploy`
- Start Command: `npm start`
- Health Check Path: `/health`
- Variables:
  - `DATABASE_URL` (desde Render Postgres)
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `CORS_ORIGIN` (URL del frontend en Render)
  - `GOOGLE_CLIENT_ID`
  - `NODE_ENV=production`
