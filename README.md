# Gift Catalog (MERN + MUI v5) Setup

This workspace is scaffolded as a split frontend/backend project:

- `frontend/`: React + MUI + Zustand
- `backend/`: Node.js + Express + MongoDB + JWT auth

## 1) Prerequisites

- Node.js 18+ and npm
- MongoDB running locally on `mongodb://localhost:27017`
- Database: `GiftCatalog`
- Existing `users` collection with bcrypt-hashed passwords

## 2) Environment Files

Environment files are already created.

Use the existing `backend/.env` and `frontend/.env` files in this repo.  
All port configuration is defined there.

## 3) Install Dependencies

From project root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

## 4) Run in Development

Run both frontend and backend:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## 5) Auth API Baseline

- `POST /api/auth/login`
- `GET /api/health`
- `GET /api/me` (protected, requires `Authorization: Bearer <token>`)

### Login payload

```json
{
  "email": "admin@giftcatalog.com",
  "password": "Admin@12345"
}
```

## 6) Optional Admin Seed

If you need a default admin:

```bash
npm run seed:admin --prefix backend
```

You can override seed values with:

- `SEED_ADMIN_NAME`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## 7) Current Scope

Implemented in this setup phase:

- Frontend + backend split structure
- MongoDB connection to `GiftCatalog`
- JWT login flow using existing `users` collection
- Protected route baseline in frontend
- Corporate-style login screen and admin shell layout
- Dashboard scaffold + module placeholders

Next implementation phase will fill full CRUD modules for categories/sub-categories/items and PDF-generation workflow.
