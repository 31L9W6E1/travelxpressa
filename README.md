# DS-160 Form Application

A production-ready DS-160 visa application form assistance platform built with React, Node.js, PostgreSQL, and modern security practices.

## Features

### Core Features
- Multi-step DS-160 form wizard with auto-save
- Real-time validation with helpful error messages
- Field-by-field explanations and tips
- Progress tracking and resume functionality
- PDF generation for confirmation
- User dashboard with application management

### Security Features
- AES-256 encryption for sensitive data at rest
- TLS 1.3 encryption in transit
- JWT authentication with secure token rotation
- httpOnly cookies for refresh tokens
- Rate limiting on all endpoints
- CSRF protection
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- Security headers (Helmet.js)
- Audit logging

### User Management
- Email signup/login
- Password reset flow
- Account lockout after failed attempts
- Role-based access control (User/Admin/Agent)
- 2FA support (optional)

### Admin Features
- User management dashboard
- Application statistics
- Inquiry management
- Audit logs viewer
- System health monitoring

## Tech Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js 5
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Cache/Sessions:** Redis
- **Validation:** Zod
- **Testing:** Jest, Supertest

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Forms:** TanStack Form + Zod
- **State:** React Context
- **Routing:** React Router 7
- **UI Components:** Custom + Radix UI

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Reverse Proxy:** Nginx
- **Monitoring:** Health checks, logging

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Development Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd Form
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../tanstack-form-course
   npm install
   \`\`\`

3. **Configure environment**
   \`\`\`bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit .env with your configuration

   # Frontend
   cp tanstack-form-course/.env.example tanstack-form-course/.env
   \`\`\`

4. **Start database (Docker)**
   \`\`\`bash
   docker-compose up -d postgres redis
   \`\`\`

5. **Run database migrations**
   \`\`\`bash
   cd backend
   npx prisma migrate dev
   \`\`\`

6. **Start development servers**
   \`\`\`bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd tanstack-form-course
   npm run dev
   \`\`\`

### Production Deployment

1. **Build Docker images**
   \`\`\`bash
   docker-compose build
   \`\`\`

2. **Configure production environment**
   - Set all required environment variables
   - Configure SSL certificates
   - Update CORS origins

3. **Deploy**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

## Environment Variables

### Backend (.env)

\`\`\`env
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=<secure-random-string>
JWT_REFRESH_SECRET=<another-secure-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=<32-byte-hex-string>

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Redis
REDIS_URL=redis://localhost:6379
\`\`\`

### Frontend (.env)

\`\`\`env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
\`\`\`

## API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login
- \`POST /api/auth/logout\` - Logout
- \`POST /api/auth/refresh\` - Refresh token
- \`GET /api/auth/me\` - Get current user
- \`PATCH /api/auth/me\` - Update profile
- \`POST /api/auth/change-password\` - Change password

### Applications
- \`POST /api/applications\` - Create application
- \`GET /api/applications\` - List user's applications
- \`GET /api/applications/:id\` - Get application
- \`PATCH /api/applications/:id\` - Update application
- \`POST /api/applications/:id/submit\` - Submit application
- \`DELETE /api/applications/:id\` - Delete draft

### Inquiries
- \`POST /api/inquiry\` - Submit inquiry

### Admin
- \`GET /api/admin/stats\` - Dashboard statistics
- \`GET /api/admin/users\` - List users
- \`PUT /api/admin/users/:id/role\` - Update user role
- \`DELETE /api/admin/users/:id\` - Delete user
- \`GET /api/admin/inquiries\` - List inquiries
- \`PUT /api/admin/inquiries/:id/status\` - Update inquiry status
- \`GET /api/admin/audit-logs\` - View audit logs

### Health
- \`GET /health\` - Health check
- \`GET /ready\` - Readiness check

## Testing

\`\`\`bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- validation.test.ts
\`\`\`

## Security Considerations

1. **Never commit secrets** - Use environment variables
2. **Enable HTTPS** - Required for production
3. **Regular updates** - Keep dependencies updated
4. **Audit logging** - Monitor for suspicious activity
5. **Backups** - Regular database backups
6. **Rate limiting** - Already configured but adjust as needed

## Legal Notice

This application is NOT affiliated with, endorsed by, or connected to the U.S. Department of State, U.S. Embassy, or any U.S. government agency. It is an independent third-party service that helps users prepare their DS-160 forms.

## License

[Your License Here]

## Support

For support, email support@ds160helper.com
