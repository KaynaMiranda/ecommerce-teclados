FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build

RUN npm ci --production

EXPOSE 3333

CMD ["node", "dist/server.js"]
