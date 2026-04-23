FROM node:20-slim

# Dependências do Chrome para Puppeteer
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  fonts-noto \
  fonts-noto-color-emoji \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Diz pro Puppeteer usar o Chrome do sistema (não baixar o próprio)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
