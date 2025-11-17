# Use a small, stable Node image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install build deps (for some native modules) then remove them to keep image small
RUN apk add --no-cache python3 make g++

# Copy package manifests and install dependencies first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install --production

# Copy source
COPY . .

# Build step if you have a build; keep here for flexibility
# RUN npm run build

# Expose port
EXPOSE 5000

# Use a non-root user for better security (optional)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

# Default env (can be overridden by docker-compose or env file)
ENV NODE_ENV=production

# Start the app
CMD ["node", "server.js"]
