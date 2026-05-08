# --- Stage 1: Build ---
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copiar solo archivos de dependencias para aprovechar la cache
COPY package*.json ./
RUN npm ci

# Copiar el resto del código y compilar
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM nginx:stable-alpine AS production-stage

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde el stage anterior (Vite genera la carpeta 'dist')
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Crear usuario no root para Nginx (Seguridad)
# Nota: Nginx Alpine ya usa el usuario 'nginx', pero aseguramos permisos
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]