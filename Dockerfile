FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production DB_PATH=/data/app.db
COPY --from=build /app ./
VOLUME ["/data"]
EXPOSE 3000
CMD ["npm", "start"]
