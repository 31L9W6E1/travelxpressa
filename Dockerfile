# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Change Prisma provider to PostgreSQL for production
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# Install all dependencies (including dev for build)
RUN npm ci

# Generate Prisma client for PostgreSQL
RUN npx prisma generate

# Copy backend source code
COPY backend/src ./src/
COPY backend/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-slim

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Change Prisma provider to PostgreSQL for production
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Generate Prisma client for PostgreSQL
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Remove any .env file that might have been copied
RUN rm -f .env

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Start the application
# Run migrate and continue even if it fails (allows app to start and show health check)
CMD ["sh", "-c", "npx prisma migrate deploy || echo 'Migration failed - database may not be configured' && node dist/index.js"]
