# Multi-stage build for React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Runtime stage with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/index.html || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
