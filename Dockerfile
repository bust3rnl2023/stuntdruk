# ==========================================
# Stage 1: Build & Install Dependencies
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package descriptors first to optimize caching
COPY package*.json ./

# Install dependencies (including devDependencies if building/testing is needed)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Prune development dependencies (leaves only production dependencies)
RUN npm prune --production

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy production dependencies and source files from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/src ./src

# Use a non-root node user for security
USER node

# Expose the port (Coolify will route through Traefik)
EXPOSE 8080

# Run the app
CMD ["node", "src/server.js"]
