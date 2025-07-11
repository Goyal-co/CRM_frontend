# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage (using nginx)
FROM nginx:alpine

# Copy built frontend from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the frontend port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
