# Stage 1: Build the React application
FROM node:22-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# We use 'build' here because that's what is in your package.json
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Vite outputs to the 'dist' folder, so we copy from there
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80 (Standard Web Port inside the container)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]