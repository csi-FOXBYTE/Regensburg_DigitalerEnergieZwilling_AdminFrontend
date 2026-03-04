# ==========================================
# Stage 1: Build-Umgebung (Node.js)
# ==========================================
FROM node:20-alpine AS builder

# 1. WICHTIG: pnpm aktivieren! 
# (Node.js bringt pnpm über "corepack" bereits mit, es muss nur aktiviert werden)
RUN corepack enable pnpm

# Arbeitsverzeichnis im Container festlegen
WORKDIR /app

# 2. WICHTIG: package.json UND pnpm-lock.yaml kopieren
COPY package.json pnpm-lock.yaml ./

# 3. WICHTIG: Abhängigkeiten installieren
# (--frozen-lockfile ist das pnpm-Äquivalent zu npm ci. Es garantiert, 
# dass exakt die Versionen aus der Lockfile installiert werden).
RUN pnpm install --frozen-lockfile

# Restlichen Quellcode kopieren
COPY . .

# Astro SSG Build ausführen (erstellt standardmäßig den /dist Ordner)
RUN pnpm run build

# ==========================================
# Stage 2: Produktions-Umgebung (Nginx)
# ==========================================
FROM nginx:alpine

# Unsere optimierte Nginx-Config kopieren (falls du die Datei nginx.conf angelegt hast)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiere nur das fertige statische Artefakt aus Stage 1 in den Nginx-Ordner
COPY --from=builder /app/dist /usr/share/nginx/html

# Port 80 nach außen dokumentieren
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]