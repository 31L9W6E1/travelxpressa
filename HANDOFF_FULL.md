# TravelXpressa - Full Project Handoff Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Project Structure](#project-structure)
4. [Features & Functionality](#features--functionality)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Security](#authentication--security)
8. [Frontend Components](#frontend-components)
9. [Configuration & Environment](#configuration--environment)
10. [Development Setup](#development-setup)
11. [Deployment Guide](#deployment-guide)
12. [Known Issues & Future Improvements](#known-issues--future-improvements)

---

## 1. Project Overview

**TravelXpressa** is a full-stack visa application platform that streamlines the DS-160 visa application process. The platform provides:

- Multi-step visa application forms with real-time validation
- Admin dashboard for managing users and applications
- Content Management System (CMS) for blog/news
- Real-time chat support system
- Multi-language support (6 languages)
- Dark/Light theme toggle
- Role-based access control (User, Agent, Admin)

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui |
| Backend | Node.js, Express.js, TypeScript |
| Database | SQLite (Prisma ORM) |
| Authentication | JWT (Access + Refresh Tokens) |
| Validation | Zod (backend), React Hook Form (frontend) |
| State Management | React Context API |
| Charts | Recharts |
| HTTP Client | Axios |

---

## 2. Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    React + TypeScript                        ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    ││
│  │  │ AuthCtx  │  │ ThemeCtx │  │ LangCtx  │  │ Pages    │    ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    ││
│  │  ┌──────────────────────────────────────────────────────┐  ││
│  │  │              shadcn/ui Components                     │  ││
│  │  └──────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js)                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Express.js + TypeScript                   ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    ││
│  │  │ Routes   │  │Middleware│  │ Services │  │ Utils    │    ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    ││
│  │  ┌──────────────────────────────────────────────────────┐  ││
│  │  │              Prisma ORM + Zod Validation              │  ││
│  │  └──────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma Client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (SQLite)                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │  User   │ │  App    │ │ Inquiry │ │  Post   │ │  Chat   │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Project Structure

```
/Form/
├── tanstack-form-course/          # Frontend (Vite + React)
│   ├── src/
│   │   ├── api/                   # API client modules
│   │   │   ├── client.ts          # Axios instance + token management
│   │   │   ├── applications.ts    # Application API
│   │   │   └── posts.ts           # CMS API
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── GlobalHeader.tsx   # Main navigation header
│   │   │   └── ChatWidget.tsx     # Floating chat widget
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx    # Authentication state
│   │   │   ├── ThemeContext.tsx   # Dark/Light mode
│   │   │   └── LanguageContext.tsx# i18n (6 languages)
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Landing page
│   │   │   ├── Login.tsx          # Auth page
│   │   │   ├── Application.tsx    # DS-160 form (5 steps)
│   │   │   ├── AdminDashboard.tsx # Admin panel
│   │   │   ├── UserProfile.tsx    # User profile
│   │   │   ├── Blog.tsx           # Blog listing
│   │   │   ├── BlogPost.tsx       # Single blog post
│   │   │   ├── News.tsx           # News listing
│   │   │   └── NewsArticle.tsx    # Single news article
│   │   ├── utils/
│   │   │   └── avatar.ts          # DiceBear avatar generation
│   │   ├── config/
│   │   │   └── countries.ts       # Country configurations
│   │   ├── lib/
│   │   │   └── utils.ts           # Utility functions (cn)
│   │   ├── App.tsx                # Main app + routing
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Tailwind + theme variables
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
└── backend/                       # Backend (Express + Prisma)
    ├── src/
    │   ├── routes/
    │   │   ├── auth.routes.ts     # Authentication endpoints
    │   │   ├── admin.routes.ts    # Admin-only endpoints
    │   │   ├── application.routes.ts # Application CRUD
    │   │   ├── user.routes.ts     # User management
    │   │   ├── inquiry.routes.ts  # Contact inquiries
    │   │   ├── posts.routes.ts    # CMS endpoints
    │   │   └── chat.routes.ts     # Chat system
    │   ├── middleware/
    │   │   ├── auth.ts            # JWT verification
    │   │   ├── validate.ts        # Zod validation
    │   │   ├── errorHandler.ts    # Global error handling
    │   │   ├── rateLimit.ts       # Rate limiting
    │   │   └── security.ts        # Security headers
    │   ├── validation/
    │   │   └── schemas.ts         # Zod schemas
    │   ├── utils/
    │   │   ├── encryption.ts      # AES-256-GCM encryption
    │   │   └── logger.ts          # Winston logger
    │   ├── lib/
    │   │   └── prisma.ts          # Prisma client
    │   ├── types/
    │   │   └── index.ts           # TypeScript types
    │   ├── config/
    │   │   └── index.ts           # Environment config
    │   └── index.ts               # Express app entry
    ├── prisma/
    │   ├── schema.prisma          # Database schema
    │   └── dev.db                 # SQLite database file
    └── package.json
```

---

## 4. Features & Functionality

### 4.1 User Features
- **Registration & Login**: Email/password with JWT authentication
- **Multi-step Application Form**: 5-step DS-160 visa application
  - Step 1: Personal Information
  - Step 2: Contact Information
  - Step 3: Passport Information
  - Step 4: Travel Plans
  - Step 5: Review & Submit
- **Save Draft**: Save progress at any step
- **Profile Management**: View applications, update profile
- **Chat Support**: Real-time chat with support agents
- **Multi-language**: EN, MN, RU, ZH, FR, DE

### 4.2 Admin Features
- **Dashboard Overview**: Real-time stats with charts
  - Total users, applications, approval rates
  - Monthly trends (applications, user registrations)
  - Status distribution pie chart
- **User Management**: View, update roles, delete users
- **Application Management**: View, approve/reject applications
- **CMS**: Create, edit, publish blog posts and news articles
- **Chat Management**: View and respond to user chats

### 4.3 Security Features
- JWT access tokens (15min) + refresh tokens (7 days)
- AES-256-GCM encryption for sensitive application data
- Rate limiting (100 req/15min for API, 5 req/15min for auth)
- CORS protection
- Helmet security headers
- Input sanitization
- Audit logging

---

## 5. Database Schema

### Core Models

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  password        String
  name            String?
  role            UserRole  @default(USER)  // USER, AGENT, ADMIN
  phone           String?
  country         String?
  avatarUrl       String?
  emailVerified   Boolean   @default(false)
  twoFactorEnabled Boolean  @default(false)
  failedLogins    Int       @default(0)
  lockedUntil     DateTime?
  lastLoginAt     DateTime?
  lastLoginIp     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  applications    Application[]
  inquiries       Inquiry[]
  refreshTokens   RefreshToken[]
  auditLogs       AuditLog[]
  chatThreads     ChatThread[]
}

model Application {
  id                String            @id @default(cuid())
  userId            String
  visaType          VisaType          // B1_B2, F1, J1, H1B, etc.
  status            ApplicationStatus // DRAFT, IN_PROGRESS, SUBMITTED, etc.
  currentStep       Int               @default(1)

  // Encrypted JSON fields
  personalInfo      String?
  contactInfo       String?
  passportInfo      String?
  travelInfo        String?

  photoUrl          String?
  confirmationNumber String?
  adminNotes        String?
  reviewedBy        String?
  reviewedAt        DateTime?
  submittedAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  user              User      @relation(fields: [userId], references: [id])
}

model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  imageUrl    String?
  category    String   // 'blog' or 'news'
  tags        String?
  status      String   @default("draft")  // 'draft' or 'published'
  authorId    String
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ChatThread {
  id              String    @id @default(cuid())
  userId          String
  applicationId   String?
  subject         String
  status          String    @default("OPEN")  // OPEN, CLOSED
  telegramChatId  String?
  closedAt        DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id])
  messages        ChatMessage[]
}

model ChatMessage {
  id          String   @id @default(cuid())
  threadId    String
  content     String
  messageType String   @default("TEXT")
  senderType  String   // USER, ADMIN, SYSTEM, TELEGRAM
  senderId    String?
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  thread      ChatThread @relation(fields: [threadId], references: [id])
}
```

### Enums

```prisma
enum UserRole {
  USER
  AGENT
  ADMIN
}

enum VisaType {
  B1_B2
  F1
  J1
  H1B
  L1
  O1
  K1
  OTHER
}

enum ApplicationStatus {
  DRAFT
  IN_PROGRESS
  SUBMITTED
  UNDER_REVIEW
  COMPLETED
  REJECTED
}
```

---

## 6. API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login, returns tokens |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Invalidate refresh token |
| GET | `/me` | Get current user |

### Applications (`/api/applications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new application |
| GET | `/` | Get user's applications |
| GET | `/:id` | Get single application |
| PATCH | `/:id` | Update application (save draft) |
| POST | `/:id/submit` | Submit application |
| DELETE | `/:id` | Delete draft application |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard statistics |
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user details |
| PUT | `/users/:id/role` | Update user role |
| DELETE | `/users/:id` | Delete user |
| GET | `/applications` | List all applications |
| PATCH | `/applications/:id/status` | Update application status |
| GET | `/inquiries` | List all inquiries |

### CMS (`/api/posts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Public posts (published) |
| GET | `/admin` | All posts (admin) |
| GET | `/:slug` | Get post by slug |
| POST | `/` | Create post (admin) |
| PATCH | `/:id` | Update post (admin) |
| DELETE | `/:id` | Delete post (admin) |
| PATCH | `/:id/toggle-publish` | Toggle publish status |

### Chat (`/api/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/threads` | Create chat thread |
| GET | `/threads` | Get user's threads |
| GET | `/threads/:id` | Get thread with messages |
| POST | `/threads/:id/messages` | Send message |
| PATCH | `/threads/:id/close` | Close thread |
| GET | `/admin/threads` | All threads (admin) |
| GET | `/admin/stats` | Chat statistics (admin) |

---

## 7. Authentication & Security

### JWT Token Flow
```
1. User logs in → Server returns { accessToken, refreshToken }
2. Client stores tokens in localStorage
3. Every API request includes: Authorization: Bearer {accessToken}
4. When accessToken expires (15min):
   - Axios interceptor catches 401
   - Sends refreshToken to /api/auth/refresh
   - Gets new tokens
   - Retries original request
5. If refreshToken invalid → Redirect to login
```

### Data Encryption
Sensitive application data (personalInfo, contactInfo, passportInfo, travelInfo) is encrypted using AES-256-GCM before storage:

```typescript
// Encryption format: iv:authTag:encryptedData
const encrypted = encrypt(JSON.stringify(data));
// Decryption
const decrypted = JSON.parse(decrypt(encrypted));
```

### Role-Based Access Control
```typescript
// Middleware chain
router.use(authenticateToken);  // Verify JWT
router.use(isAdmin);            // Check role === 'ADMIN'
// or
router.use(isAgentOrAdmin);     // Check role in ['AGENT', 'ADMIN']
```

---

## 8. Frontend Components

### Context Providers (in App.tsx)
```tsx
<ThemeProvider>      // Dark/Light mode
  <LanguageProvider> // i18n translations
    <AuthProvider>   // User state + login/logout
      <BrowserRouter>
        <GlobalHeader />
        <ChatWidget />
        <Routes>...</Routes>
      </BrowserRouter>
    </AuthProvider>
  </LanguageProvider>
</ThemeProvider>
```

### Theme System
CSS variables defined in `index.css`:
- Light theme: `:root { ... }`
- Dark theme: `.dark { ... }`

Toggle applies `.dark` class to `<html>` element.

### Language System
6 supported languages with translations for:
- Navigation labels
- Form labels
- Button text
- Error messages
- Admin dashboard text

---

## 9. Configuration & Environment

### Frontend Environment (`.env`)
```env
VITE_API_URL=http://localhost:3000
```

### Backend Environment (`.env`)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
ENCRYPTION_KEY=your-32-char-encryption-key-here

# CORS
CORS_ORIGIN=http://localhost:5173

# Session
SESSION_SECRET=your-session-secret

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 10. Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Form

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure environment
npx prisma generate
npx prisma db push
npm run dev

# Frontend setup (new terminal)
cd tanstack-form-course
npm install
npm run dev
```

### Development URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Health: http://localhost:3000/health

### Creating Admin User
```bash
# Use Prisma Studio
cd backend
npx prisma studio
# Navigate to User table, change role to "ADMIN"
```

---

## 11. Deployment Guide

### Recommended Deployment Options

#### Option 1: Railway (Recommended for MVP)
**Pros**: Easy setup, automatic deployments, PostgreSQL included
**Cost**: ~$5-20/month

```bash
# Backend
railway init
railway add --database postgresql
railway up

# Frontend
# Deploy to Vercel (see below)
```

#### Option 2: Vercel + PlanetScale
**Frontend**: Vercel (free tier available)
**Backend**: Vercel Serverless Functions
**Database**: PlanetScale MySQL (free tier)

```bash
# Frontend deployment
cd tanstack-form-course
vercel

# Backend - Convert to Vercel functions
# or deploy separately
```

#### Option 3: DigitalOcean App Platform
**Pros**: Full control, good scaling
**Cost**: ~$12-25/month

#### Option 4: AWS (Production Scale)
- **Frontend**: S3 + CloudFront
- **Backend**: ECS Fargate or Lambda
- **Database**: RDS PostgreSQL
- **Cost**: Variable, ~$30-100/month

### Production Checklist

1. **Database Migration**
   ```bash
   # Change from SQLite to PostgreSQL
   # Update prisma/schema.prisma:
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Environment Variables**
   - Set strong JWT secrets (32+ chars)
   - Set unique encryption key
   - Configure production CORS origins

3. **Security**
   - Enable HTTPS only
   - Set secure cookie flags
   - Configure rate limiting
   - Enable audit logging

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure logging (LogDNA, Papertrail)
   - Set up uptime monitoring

5. **Backups**
   - Configure automated database backups
   - Test restore procedures

---

## 12. Known Issues & Future Improvements

### Known Issues
1. Bundle size warning (>500KB) - Consider code splitting
2. No email verification flow implemented
3. No password reset functionality
4. Chat system lacks real-time WebSocket support

### Recommended Improvements
1. **Add WebSocket for real-time chat** (Socket.io)
2. **Implement email service** (SendGrid, AWS SES)
3. **Add file upload for documents** (S3, Cloudinary)
4. **Implement 2FA** (TOTP with authenticator apps)
5. **Add payment integration** (Stripe)
6. **Implement application PDF export**
7. **Add Telegram bot integration** for chat
8. **Implement code splitting** for smaller bundles
9. **Add comprehensive test suite** (Jest, Cypress)
10. **Add CI/CD pipeline** (GitHub Actions)

---

## Contact & Support

For questions or issues, contact the development team.

**Last Updated**: February 2026
**Version**: 1.0.0
