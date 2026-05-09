FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY apps/backend/*.csproj apps/backend/
RUN dotnet restore apps/backend/BookingApi.csproj
COPY apps/backend/ apps/backend/
RUN dotnet publish apps/backend/BookingApi.csproj -c Release -o /src/publish

FROM node:20 AS frontend-build
WORKDIR /src
COPY package*.json ./
COPY packages/typespec/package.json packages/typespec/
COPY apps/frontend/package.json apps/frontend/
RUN npm config set registry https://registry.npmmirror.com && npm install
COPY packages/typespec packages/typespec
COPY apps/frontend apps/frontend
COPY apps/backend apps/backend
RUN npm install && \
    npm install @rolldown/binding-linux-x64-gnu && \
    npm install lightningcss-linux-x64-gnu && \
    cd packages/typespec && /src/node_modules/.bin/tsp compile . --emit @typespec/openapi3 && \
    cp tsp-output/@typespec/openapi3/openapi.yaml /src/apps/backend/openapi.yaml && \
    cd /src && /src/node_modules/.bin/openapi-typescript apps/backend/openapi.yaml --output apps/frontend/src/api/schema.ts --enum && \
    cd /src/apps/frontend && /src/node_modules/.bin/vite build

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=backend-build /src/publish /app
COPY --from=frontend-build /src/apps/frontend/dist /app/wwwroot
ENV PORT=8080
ENV ASPNETCORE_URLS=http://+:${PORT}
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost:${PORT}/health || exit 1
ENTRYPOINT ["/app/BookingApi"]
