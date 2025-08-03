FROM node:18-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files for workspace dependencies
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/web-dashboard/package.json ./apps/web-dashboard/

# Install all workspace dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Copy only the web-dashboard app and required packages (not the Go service or cloudflare)
COPY packages/config/ ./packages/config/
COPY packages/database/ ./packages/database/
COPY packages/shared-types/ ./packages/shared-types/
COPY apps/web-dashboard/ ./apps/web-dashboard/

# Environment variables will be provided by docker-compose.yml

# Change to the web-dashboard directory
WORKDIR /workspace/apps/web-dashboard

# Expose port
EXPOSE 3000

# Set environment for development
ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start development server (only for web-dashboard, not monorepo)
CMD ["pnpm", "dev"]