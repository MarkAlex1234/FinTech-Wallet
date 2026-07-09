# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy only package files first (better caching)
COPY package*.json ./

# Install dependencies (including dev for building)
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS project
RUN npm run build

# Stage 2: Production image
FROM node:24-alpine AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy only the package files
COPY package*.json ./

# Install only production deps
RUN npm ci --only=production && npm cache clean --force

# Copy built dist from builder
COPY --from=builder /app/dist ./dist

# Copy proto files into the dist folder
COPY src/transaction/*.proto ./dist/transaction/

# Start the app
CMD ["npm", "run", "start:prod"]
