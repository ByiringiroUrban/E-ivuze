# Backend-only Dockerfile for E-ivuzeConnect
FROM node:18-alpine

# Set working directory to /app (this will be the backend directory)
WORKDIR /app

# Install system dependencies for potential native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files for better caching
COPY package*.json ./

# Install backend dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the backend directory
COPY . ./

# Create necessary directories for uploads and logs
RUN mkdir -p uploads logs public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S onehealth -u 1001

# Change ownership of app directory to nodejs user
RUN chown -R onehealth:nodejs /app
USER onehealth

# Expose the port the backend runs on
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check - test the backend API
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/api/public/settings || exit 1

# Start the backend application
CMD ["npm", "start"]


