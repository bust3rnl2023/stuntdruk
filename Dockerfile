# Multi-stage Dockerfile for Production
# Optimized for Node.js 20 on Easypanel, Coolify, or any VPS

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

# Add standard packages for compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

# Leverage Docker cache layers by copying package files first
COPY package.json package-lock.json* ./

# Install all node dependencies (including devDependencies required for typescript, esbuild, and vite compilation)
RUN npm ci

# Copy the remaining project files
COPY . .

# Set environment to production during compile time
ENV NODE_ENV=production

# Build React client and compile/bundle Express backend
RUN npm run build


# --- Stage 2: Production Run ---
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Force production environment
ENV NODE_ENV=production
# Bind to standard production Web port
ENV PORT=3000

# Copy package manifests only
COPY package.json package-lock.json* ./

# Install only production-level dependencies to keep the image slim
RUN npm ci --omit=dev

# Copy built server bundle & client static assets from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy Firebase applet metadata in case of runtime reference fallback
COPY --from=builder /usr/src/app/firebase-applet-config.json ./firebase-applet-config.json

# Expose port 3000 to the container network
EXPOSE 3000

# Execute server.cjs using Node CJS runner (mapped via npm start)
CMD ["npm", "run", "start"]
