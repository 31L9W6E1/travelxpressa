# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
DS-160 visa application assistance platform - a production-ready full-stack application with multi-step form wizard, admin dashboard, CMS, and chat support. NOT affiliated with U.S. government agencies.

**Tech Stack:**
- Backend: Node.js 20+ / Express / TypeScript / Prisma ORM / PostgreSQL (SQLite for dev)
- Frontend: React 19 / Vite / TypeScript / TanStack Form / Tailwind CSS / Radix UI
- Infrastructure: Docker Compose / Nginx / Redis / GitHub Actions

## Development Commands

### Backend (`/backend`)
```bash
# Development
npm run dev                    # Start dev server with hot reload (http://localhost:3000)
npm run build                  # Compile TypeScript to /dist
npm start                      # Run production build

# Database (Prisma)
npx prisma generate            # Generate Prisma client (required after schema changes)
npx prisma migrate dev         # Create and apply new migration (dev only)
npx prisma migrate deploy      # Apply migrations (production)
npx prisma db push             # Push schema changes without migration (dev only)
npx prisma studio              # Visual database browser
npx prisma db seed             # Seed database with test data

# Testing
npm test                       # Run all Jest tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Run tests with coverage report
npm test -- auth.test.ts       # Run specific test file

# Linting & Type Checking
npm run lint                   # Run ESLint
npm run lint:fix               # Fix auto-fixable ESLint issues
npm run typecheck              # Run TypeScript compiler without emitting files
```

### Frontend (`/frontend`)
**Note:** README and CI/CD reference `tanstack-form-course` directory, but actual directory is `frontend`.

```bash
# Development
npm run dev                    # Start Vite dev server (http://localhost:5173)
npm run build                  # Build for production (outputs to /dist)
npm run preview                # Preview production build locally

# Linting
npm run lint                   # Run ESLint
npx tsc --noEmit              # Type check without building
```

### Docker Compose (Root)
```bash
# Development - Start only infrastructure
docker-compose up -d postgres redis

# Production - Start all services
docker-compose build           # Build all Docker images
docker-compose up -d           # Start all services in background
docker-compose down            # Stop all services
docker-compose logs -f backend # Follow backend logs

# Individual services
docker-compose restart backend
docker-compose exec postgres psql -U ds160user -d ds160_db
```

## Architecture

### Backend Structure (`/backend/src`)
```
src/
├── config/         # Environment configuration (config/index.ts)
├── lib/            # Shared libraries (prisma.ts - singleton client)
├── middleware/     # Express middleware
│   ├── auth.ts           # JWT authentication, role-based access control (RBAC)
│   ├── errorHandler.ts   # Global error handling, custom error classes
│   ├── rateLimit.ts      # Rate limiting (disabled in dev, enabled in prod)
│   ├── security.ts       # Security headers, suspicious activity detection
│   └── validate.ts       # Zod schema validation, input sanitization
├── routes/         # API route handlers (*.routes.ts)
├── types/          # TypeScript type definitions
├── utils/          # Utilities
│   ├── encryption.ts     # AES-256-GCM encryption for sensitive data
│   └── logger.ts         # Structured logging
├── validation/     # Zod schemas for request validation
└── index.ts        # Express app setup, graceful shutdown handlers
```

**Key Patterns:**
- **Authentication:** JWT access tokens (15m expiry) + refresh tokens (7d expiry stored in database)
- **Authorization:** Role-based with `UserRole` enum (USER, AGENT, ADMIN). Use `requireRole()` middleware
- **Error Handling:** Custom error classes (`UnauthorizedError`, `BadRequestError`, etc.) caught by global `errorHandler`
- **Data Encryption:** Sensitive form data encrypted at rest using `encrypt()`/`decrypt()` from `utils/encryption.ts`
- **Database Access:** Always use the singleton Prisma client from `lib/prisma.ts`, never create new instances
- **Rate Limiting:** Automatically disabled in development, enabled in production via `config.isProduction` check

### Frontend Structure (`/frontend/src`)
```
src/
├── api/            # API client layer
│   ├── client.ts         # Axios instance with token refresh interceptor
│   └── *.ts              # API service modules (auth.ts, applications.ts, etc.)
├── components/     # React components
│   ├── ui/               # Radix UI + shadcn components (reusable)
│   ├── ds160/steps/      # Multi-step DS-160 form components
│   └── home/             # Landing page sections
├── contexts/       # React Context providers
│   ├── AuthContext.tsx   # Global auth state, login/logout/register
│   ├── LanguageContext.tsx  # i18n support (6 languages)
│   └── ThemeContext.tsx     # Dark/light mode
├── pages/          # Page components (route-level)
├── hooks/          # Custom React hooks
├── lib/            # Utilities (form helpers, validators)
├── config/         # Static config (countries data, form steps)
└── styles/         # Global CSS, Tailwind base
```

**Key Patterns:**
- **API Calls:** Always use API services from `/api/*`, never call axios directly. Token refresh is automatic via interceptor
- **Authentication:** Use `useAuth()` hook for auth state/actions. Token stored in localStorage + httpOnly cookies (production)
- **Forms:** TanStack Form + Zod validation. See `components/ds160/steps/` for examples
- **Protected Routes:** Wrap with auth check using `AuthContext.isAuthenticated`
- **Styling:** Tailwind CSS with custom theme in `tailwind.config.js`. Use `cn()` utility for conditional classes

### Database Schema (Prisma)
**Core Models:**
- `User` - User accounts with roles, 2FA support, account lockout (failedLogins, lockedUntil)
- `RefreshToken` - JWT refresh tokens with rotation tracking
- `Application` - DS-160 visa applications. Sensitive fields (personalInfo, passportInfo, etc.) stored as **encrypted JSON strings**
- `Inquiry` - Contact form submissions with status tracking
- `Post` - CMS content (blog/news) with SEO fields
- `ChatThread` / `ChatMessage` - Support chat with Telegram integration
- `AuditLog` - Security audit trail (login attempts, data changes)
- `Session` - Session data (currently unused, using JWT)
- `Payment` - Payment tracking (future monetization)

**Important:** 
- When querying/updating Application model, use `encrypt(JSON.stringify(data))` for sensitive fields and `JSON.parse(decrypt(field))` when reading
- Default database is SQLite (`dev.db`) for development, PostgreSQL for production (via `DATABASE_URL` env var)

## Security & Compliance

### Data Encryption
Sensitive application data is encrypted at rest using AES-256-GCM:
```typescript
import { encrypt, decrypt } from './utils/encryption';

// Storing
const encrypted = encrypt(JSON.stringify(personalInfo));
await prisma.application.update({ data: { personalInfo: encrypted } });

// Reading
const decrypted = JSON.parse(decrypt(application.personalInfo));
```

### Authentication Flow
1. User logs in → receives access token (JWT, 15m) + refresh token (7d)
2. Access token sent in `Authorization: Bearer <token>` header
3. On 401 error, frontend automatically calls `/api/auth/refresh` with refresh token
4. New tokens issued, old refresh token revoked (rotation)
5. On refresh failure, user redirected to `/login`

**Middleware Chain:**
- `authenticateToken` - Verifies JWT, attaches `req.user`
- `requireRole(UserRole.ADMIN)` - Checks user role (use after `authenticateToken`)
- `isAdmin` / `isAgentOrAdmin` - Convenience aliases

### Rate Limiting
**Automatically disabled in development** (check `config.isProduction` in `index.ts`).
- Auth endpoints: 5 requests per 15min window (stricter)
- API endpoints: 100 requests per 15min window
- Configured via `RATE_LIMIT_*` env vars

## Environment Setup

### Required Environment Variables
Backend `.env` (see `backend/.env.example`):
```bash
# Database
DATABASE_URL="file:./dev.db"  # Dev: SQLite, Prod: postgresql://...

# JWT (MUST change in production)
JWT_SECRET="<32+ char random string>"
JWT_REFRESH_SECRET="<different 32+ char random string>"

# Encryption (MUST set in production)
ENCRYPTION_KEY="<64 char hex string>"  # Generate: openssl rand -hex 32

# CORS
CORS_ORIGIN="http://localhost:5173"  # Prod: your domain

# Optional: Redis for sessions/caching
REDIS_URL="redis://localhost:6379"
```

Frontend `.env`:
```bash
VITE_API_URL="http://localhost:3000"
```

### First-Time Setup
```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Setup database
cd backend
npx prisma generate
npx prisma migrate dev  # or: npx prisma db push for quick dev setup

# 3. Seed database (optional)
npx prisma db seed

# 4. Start services
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## Testing

### Backend Tests
- Framework: Jest + Supertest
- Config: `jest.config.js`
- Test files: `tests/**/*.test.ts` or `src/**/*.test.ts`
- Setup file: `tests/setup.ts` (DB initialization, mocks)

**Run specific test:**
```bash
npm test -- validation.test.ts
npm test -- --testNamePattern="should validate email"
```

**Coverage thresholds:** 70% (branches, functions, lines, statements) enforced

### Frontend Tests
Currently minimal test setup. To add tests:
1. Install: `npm install --save-dev vitest @testing-library/react`
2. Configure: Create `vitest.config.ts`
3. Add test scripts to `package.json`

## Common Workflows

### Adding a New API Endpoint
1. Define Zod validation schema in `backend/src/validation/schemas.ts`
2. Create route handler in `backend/src/routes/*.routes.ts`
   - Use `validate()` middleware for request validation
   - Use `asyncHandler()` to auto-catch errors
   - Use `authenticateToken` and/or `requireRole()` for auth
3. Add corresponding API service function in `frontend/src/api/*.ts`
4. Update TypeScript types if needed

Example:
```typescript
// backend/src/routes/example.routes.ts
router.post(
  '/example',
  authenticateToken,
  validate({ body: exampleSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    // ... implementation
    res.json({ success: true, data: result });
  })
);
```

### Adding a Database Model
1. Update `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration_name>`
3. Prisma Client auto-regenerated
4. Add TypeScript types in `backend/src/types/index.ts`
5. Update `seed.ts` if needed for test data

### Deploying
- CI/CD configured in `.github/workflows/ci.yml`
- Builds Docker images on push to `main`
- **Important:** Update README/CI references from `tanstack-form-course` → `frontend` if needed
- Production checklist: Set strong JWT secrets, enable HTTPS, configure PostgreSQL DATABASE_URL, set ENCRYPTION_KEY

## Troubleshooting

### Database Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Fix Prisma client out of sync
npx prisma generate

# View database
npx prisma studio
```

### Port Conflicts
- Backend: 3000 (change via `PORT` env var)
- Frontend: 5173 (change in `vite.config.ts`)
- PostgreSQL: 5432 (Docker)
- Redis: 6379 (Docker)

### Build Errors
```bash
# Backend: Ensure Prisma client is generated
cd backend && npx prisma generate && npm run build

# Frontend: Clear cache and rebuild
cd frontend && rm -rf node_modules dist && npm install && npm run build
```

### Token/Auth Issues
- Check `JWT_SECRET` matches between `.env` and app
- Clear localStorage in browser DevTools
- Verify backend `/health` endpoint returns 200
- Check browser Network tab for 401/403 errors

## Important Notes
- **Directory Naming:** README and CI/CD reference `tanstack-form-course` but actual frontend directory is `frontend`
- **Rate Limiting:** Disabled in development by default (see `index.ts`)
- **Encryption:** All Application model sensitive fields are encrypted - always use `encrypt()`/`decrypt()` helpers
- **Migrations:** Use `prisma migrate dev` in development, `prisma migrate deploy` in production
- **Refresh Tokens:** Stored in DB, not just JWT - always check `RefreshToken` table for validity
- **Account Lockout:** 100 failed login attempts locks account for 1 minute (configurable in `auth.routes.ts`)
- **CORS:** Must whitelist frontend domain in production via `CORS_ORIGIN`
