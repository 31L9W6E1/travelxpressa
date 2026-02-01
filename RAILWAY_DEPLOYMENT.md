# Railway Deployment Guide for TravelXpressa

This guide explains how to deploy the TravelXpressa application to Railway.

## Prerequisites

1. A Railway account (https://railway.app)
2. GitHub repository with your code
3. Google OAuth credentials (optional, for Google login)
4. Facebook OAuth credentials (optional, for Facebook login)

## Architecture

The application consists of two services:
- **Backend**: Node.js/Express API with Prisma ORM
- **Frontend**: React/Vite static site

## Step 1: Create Railway Project

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository

## Step 2: Deploy Backend

### 2.1 Create Backend Service

1. In your Railway project, click "New Service"
2. Select "GitHub Repo" and choose your repository
3. Set the root directory to `backend`

### 2.2 Add PostgreSQL Database

1. Click "New Service" → "Database" → "PostgreSQL"
2. Railway will automatically create the `DATABASE_URL` variable

### 2.3 Configure Backend Environment Variables

Add the following environment variables in the Railway dashboard:

```
# Required
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-a-secure-random-32-char-string>
JWT_REFRESH_SECRET=<generate-another-secure-random-string>
ENCRYPTION_KEY=<generate-a-32-byte-hex-string>
CORS_ORIGIN=https://your-frontend-domain.railway.app
FRONTEND_URL=https://your-frontend-domain.railway.app

# Optional - OAuth (leave empty to disable)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Optional - Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@yourdomain.com
```

### 2.4 Generate Secure Secrets

Use these commands to generate secure secrets:

```bash
# JWT Secret (32 characters)
openssl rand -base64 32

# Encryption Key (32 bytes hex)
openssl rand -hex 32
```

## Step 3: Deploy Frontend

### 3.1 Create Frontend Service

1. Click "New Service" → "GitHub Repo"
2. Select your repository
3. Set the root directory to `frontend`

### 3.2 Configure Frontend Environment Variables

```
VITE_API_URL=https://your-backend-domain.railway.app
```

**Important**: Replace `your-backend-domain` with your actual Railway backend URL.

## Step 4: Configure Custom Domains (Optional)

1. Go to each service's Settings
2. Click "Generate Domain" or add your custom domain
3. Update the `CORS_ORIGIN` and `FRONTEND_URL` in backend to match

## Step 5: Verify Deployment

1. Check the deployment logs in Railway
2. Visit your frontend URL
3. Try to register a new user
4. Login and test the application

## Environment Variables Reference

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens |
| `ENCRYPTION_KEY` | Yes | 32-byte hex key for AES encryption |
| `CORS_ORIGIN` | Yes | Frontend URL for CORS |
| `FRONTEND_URL` | Yes | Frontend URL for OAuth redirects |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret |
| `FACEBOOK_APP_ID` | No | Facebook OAuth app ID |
| `FACEBOOK_APP_SECRET` | No | Facebook OAuth secret |

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |

## Setting Up OAuth (Optional)

### Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://your-backend.railway.app/api/auth/google/callback`
4. Copy Client ID and Secret to Railway

### Facebook OAuth

1. Go to https://developers.facebook.com/apps
2. Create a new app
3. Add Facebook Login product
4. Add valid OAuth redirect URI: `https://your-backend.railway.app/api/auth/facebook/callback`
5. Copy App ID and Secret to Railway

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is correctly linked to your PostgreSQL service
- Check that migrations ran: `prisma migrate deploy`

### CORS Errors
- Verify `CORS_ORIGIN` matches your frontend URL exactly (including https://)
- Make sure there's no trailing slash

### OAuth Not Working
- Check that callback URLs in Google/Facebook match your backend URL
- Verify the secrets are correctly set in Railway

### Build Failures
- Check Railway logs for specific error messages
- Ensure all dependencies are in `dependencies` (not `devDependencies`) for production builds

## Database Seeding

To create an admin user, run this after deployment:

```bash
# Connect to your Railway PostgreSQL
railway connect

# Run the seed command
npm run db:seed
```

Or manually insert an admin user via Railway's PostgreSQL console.

## Updating the Application

Push changes to your GitHub repository:

```bash
git add .
git commit -m "Your changes"
git push
```

Railway will automatically redeploy both services.
