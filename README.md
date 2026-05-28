# Proyecto Final Ecommerce

Implementacion fullstack para proyecto final universitario.

## Estructura

- `backend/`: API Node.js + Express + Prisma + PostgreSQL
- `frontend/`: React + Vite
- `render.yaml`: blueprint de despliegue para Render

## Funcionalidades implementadas

- Registro y login con JWT.
- Roles `USER` y `ADMIN`.
- CRUD de productos (create/update/delete para admin).
- Catalogo organizado por categorias.
- Productos con descuentos y cupones.
- Carrito por usuario.
- Checkout que crea orden y descuenta stock.
- Historial de compras por usuario.

## Levantar local

### 0) Base de datos (Docker PostgreSQL)

```bash
docker compose up -d --build
docker compose ps
```

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Validacion automatizada del flujo:

```bash
npm run validate:e2e
npm run validate:3x
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Entrega en Render

1. Crear la base PostgreSQL en Render.
2. Desplegar backend (Web Service).
   - Build: `npm install && npm run prisma:generate && npm run prisma:deploy`
   - Start: `npm start`
   - Health check: `/health`
3. Desplegar frontend (Static Site).
4. Configurar variables:
   - backend: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `GOOGLE_CLIENT_ID`
   - frontend: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`
5. Ejecutar seed en backend:
   - Shell de Render: `npm run prisma:seed`

## Campos para Excel de entrega

- `GITHUB`: URL del repositorio.
- `TRELLO`: URL del tablero con tareas reales.
- `URL PUBLICA`: URL del frontend desplegado en Render.
- `Postman URL`: URL compartida de la coleccion Postman.
