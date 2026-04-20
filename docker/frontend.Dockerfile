FROM node:22-alpine AS build

WORKDIR /app

COPY apps/frontend/package*.json ./
RUN npm ci

COPY apps/frontend/ ./
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]