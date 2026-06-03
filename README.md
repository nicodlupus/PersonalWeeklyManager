# Personal Weekly Manager

A full-stack personal productivity app with a weekly calendar view, meal tracking, notes, and yearly goals.

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials and JWT secrets
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables (backend/.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/pwm
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Migrations run automatically on startup.
