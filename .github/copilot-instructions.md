# Copilot Instructions for Tambvrini Web

## Project Overview

Tambvrini is a luxury e-commerce marketplace with a Roman Classical / Mediterranean Riviera aesthetic. It is a full-stack application with a React frontend and a FastAPI (Python) backend, using MongoDB for persistence and Stripe for payments.

## Tech Stack

### Frontend (`/frontend`)
- **React 19** with React Router v7 for routing
- **Tailwind CSS** for styling with custom design tokens
- **Radix UI** for accessible component primitives
- **shadcn/ui** pattern: reusable components live in `frontend/src/components/ui/`
- **React Hook Form** + **Zod** for form handling and validation
- **Axios** for HTTP requests
- **Framer Motion** for animations
- **Recharts** for charts
- **Lucide React** for icons
- **Build tool**: CRACO (Create React App Configuration Override)

### Backend (`/backend`)
- **Python 3.11** with **FastAPI**
- **Uvicorn** as the ASGI server
- **Motor** (async MongoDB driver) for database access
- **PyJWT** / **python-jose** for authentication
- **bcrypt** / **passlib** for password hashing
- **Stripe** SDK for payment processing
- **Linting/formatting**: Black, Flake8, mypy, isort

## Project Structure

```
frontend/           → React SPA
  src/
    components/     → Reusable React components
      ui/           → shadcn/ui primitives (Button, Card, Input, etc.)
    contexts/       → React context providers
    hooks/          → Custom React hooks
    lib/            → Utility functions (e.g., cn() for class merging)
    pages/          → Page-level components (route targets)
backend/
  server.py         → FastAPI application (routes, models, middleware)
  requirements.txt  → Python dependencies
.github/
  workflows/        → CI/CD pipelines
tests/              → End-to-end Playwright tests
scripts/            → Utility scripts
design_guidelines.json → Brand identity, typography, colors, component specs
```

## Build, Run & Test

### Frontend
```bash
cd frontend
yarn install       # Install dependencies
yarn start         # Start dev server (CRACO)
yarn build         # Production build
yarn test          # Run tests (CRA test runner)
```

### Backend
```bash
pip install -r backend/requirements.txt    # Install dependencies
python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000  # Run server
```

### Full Stack (from repo root)
```bash
./start.sh         # Starts the backend server
```

### CI
- **Backend validation** runs on push/PR to `backend/` via `.github/workflows/backend-validation.yml`
- Validates Python compilation and module imports

## Environment Variables

See `.env.example` for required variables:
- `MONGO_URL` – MongoDB connection string
- `DB_NAME` – Database name
- `JWT_SECRET` – Secret for JWT token signing
- `STRIPE_API_KEY` – Stripe secret key
- `STRIPE_WEBHOOK_SECRET` – Stripe webhook signing secret
- `CORS_ORIGINS` – Allowed CORS origins

Never hardcode secrets. Always use environment variables.

## Coding Standards

### Frontend
- Use **functional components** and **hooks** — no class components.
- Components **must** use named exports: `export const ComponentName = ...`
- Pages **must** use default exports: `export default function PageName() {...}`
- Use existing UI primitives from `frontend/src/components/ui/` before creating new ones.
- Use `sonner` for toast notifications.
- Use `cn()` from `frontend/src/lib/utils` for conditional class merging (clsx + tailwind-merge).
- Follow ESLint rules configured in the project.

### Backend
- Format code with **Black**.
- Sort imports with **isort**.
- Lint with **Flake8**.
- Type-check with **mypy**.

### General
- Do not commit `.env` files or secrets.
- Do not add or modify CI workflows unless specifically required.

## Design Guidelines

The brand aesthetic is defined in `design_guidelines.json`. Key rules:

- **Typography**: Cinzel for headings, Playfair Display for subheadings, Montserrat for body text.
- **Colors**: Dark primary (`#0A0A0A`), light marble (`#F5F5F0`), accent gold (`#C5A059`), emerald (`#1B4D3E`).
- **Buttons**: Sharp-edged (`rounded-none`), uppercase, wide tracking.
- **Cards**: Minimalist, no shadows, no border-radius.
- **Inputs**: Underlined style, transparent background.
- **Layout**: Mobile-first, generous spacing (`py-24 md:py-32`), max-width 1920px.
- **Animations**: Use Framer Motion for scroll and entrance animations. Every interactive element should have micro-animations.
- **Do not** use `transition: all` — add transitions only for specific properties.
- **Do not** center-align the `.App` container.
- **Do not** use dark color gradients.
- **Do not** use emoji characters as icons — use Lucide React.
