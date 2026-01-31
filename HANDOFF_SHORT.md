# TravelXpressa - Quick Handoff Guide

## What is this?
A visa application platform (DS-160) with admin dashboard, CMS, and chat support.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: SQLite (dev) → PostgreSQL (prod)
- **Auth**: JWT tokens

## Quick Start

```bash
# Backend (Terminal 1)
cd backend
npm install
npx prisma generate && npx prisma db push
npm run dev  # → http://localhost:3000

# Frontend (Terminal 2)
cd tanstack-form-course
npm install
npm run dev  # → http://localhost:5173
```

## Project Structure
```
/Form
├── tanstack-form-course/   # React frontend
│   ├── src/pages/          # Page components
│   ├── src/components/     # UI components
│   ├── src/contexts/       # Auth, Theme, Language
│   └── src/api/            # API client
│
└── backend/                # Express backend
    ├── src/routes/         # API endpoints
    ├── src/middleware/     # Auth, validation
    └── prisma/schema.prisma # Database schema
```

## Key Features
| Feature | Status |
|---------|--------|
| User registration/login | ✅ |
| 5-step visa application form | ✅ |
| Admin dashboard with stats | ✅ |
| User management | ✅ |
| Application review/approve | ✅ |
| CMS (blog/news) | ✅ |
| Chat support | ✅ |
| 6-language support | ✅ |
| Dark/Light theme | ✅ |

## Main Routes

### Frontend
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Authentication |
| `/application` | Visa form (auth required) |
| `/profile` | User profile |
| `/admin` | Admin dashboard (admin only) |
| `/blog` | Blog listing |
| `/news` | News listing |

### Backend API
| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | Login |
| `POST /api/auth/register` | Register |
| `GET /api/applications` | User's applications |
| `POST /api/applications/:id/submit` | Submit application |
| `GET /api/admin/stats` | Dashboard stats |
| `GET /api/admin/users` | All users |
| `GET /api/admin/applications` | All applications |

## Environment Variables

### Backend `.env`
```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-refresh-secret
ENCRYPTION_KEY=your-encryption-key
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3000
```

## Database
- Uses Prisma ORM
- SQLite for development
- Switch to PostgreSQL for production

### Key Models
- `User` - User accounts with roles (USER, AGENT, ADMIN)
- `Application` - Visa applications (encrypted data)
- `Post` - Blog/news articles
- `ChatThread` / `ChatMessage` - Support chat

## Deployment Recommendations

### Best for MVP/Startups:
**Railway** ($5-20/mo)
- Easy setup, PostgreSQL included
- Auto-deploy from GitHub

### Best for Scale:
**Vercel (frontend) + Railway (backend)**
- Frontend: Free tier on Vercel
- Backend: Railway with PostgreSQL

### Production Checklist:
1. ☐ Switch SQLite → PostgreSQL
2. ☐ Set strong JWT secrets
3. ☐ Configure HTTPS
4. ☐ Set up error monitoring (Sentry)
5. ☐ Configure backups
6. ☐ Enable rate limiting

## Common Commands

```bash
# Database
npx prisma studio          # Visual DB browser
npx prisma db push         # Sync schema
npx prisma generate        # Generate client

# Build
npm run build              # Production build
npm run dev                # Development server

# Type check
npx tsc --noEmit           # Check types
```

## Need Help?
1. Check `/health` endpoint for API status
2. Check browser console for frontend errors
3. Check terminal for backend errors
4. Review `HANDOFF_FULL.md` for detailed docs

---
**Version**: 1.0.0 | **Last Updated**: February 2026
