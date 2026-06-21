# United Hotels — Pricing Engine v2 service (port 5050).
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5050
CMD ["node", "src/server.js"]
