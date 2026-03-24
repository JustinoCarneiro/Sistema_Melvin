# Etapa 1: Build do Frontend com Node
FROM node:18-alpine AS build

WORKDIR /app

# Argumentos de build para o Vite
ARG VITE_REACT_APP_FETCH_URL
ENV VITE_REACT_APP_FETCH_URL=$VITE_REACT_APP_FETCH_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor Web de Produção (Nginx)
FROM nginx:alpine

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos do build para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80 (padrão do Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
