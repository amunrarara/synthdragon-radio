FROM node:20-alpine

WORKDIR /app

COPY backend-api/package.json backend-api/package-lock.json ./
RUN npm install --production

COPY backend-api/src ./src
COPY frontend ./frontend

EXPOSE 4000

CMD ["node", "src/index.js"]
