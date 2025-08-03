FROM node:18-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i

# Copy source code and env
COPY . .
COPY .env.docker .env.local

# Expose port
EXPOSE 3000

# Set environment for development
ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start development server
CMD ["pnpm", "dev", "--turbopack"]