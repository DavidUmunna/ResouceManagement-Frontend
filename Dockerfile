# Use Node.js image to build the app
FROM node:18 as builder
RUN useradd -ms /bin/sh -u 1001 app

# Create working directory and set ownership
RUN mkdir -p /app && chown -R app:app /app


USER app

WORKDIR /app
COPY --chown=app:app . .
RUN npm install
RUN npm run build

# Use nginx to serve the frontend
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
