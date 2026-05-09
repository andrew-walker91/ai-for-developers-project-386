FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY apps/backend/*.csproj apps/backend/
RUN dotnet restore apps/backend/BookingApi.csproj
COPY apps/backend/ apps/backend/
RUN dotnet publish apps/backend/BookingApi.csproj -c Release -o /src/publish

FROM node:20 AS frontend-build
WORKDIR /src
COPY package*.json ./
COPY packages/typespec packages/typespec
COPY apps/frontend apps/frontend
COPY apps/backend apps/backend
RUN rm -rf node_modules package-lock.json && npm install && \
    cd packages/typespec && npx tsp compile . --emit @typespec/openapi3 && \
    cp tsp-output/@typespec/openapi3/openapi.yaml /src/apps/backend/openapi.yaml && \
    cd /src && npx openapi-typescript apps/backend/openapi.yaml --output apps/frontend/src/api/schema.ts --enum && \
    cd /src/apps/frontend && npx vite build

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=backend-build /src/publish /app
COPY --from=frontend-build /src/apps/frontend/dist /app/wwwroot
ENV PORT=8080
ENV ASPNETCORE_URLS=http://+:${PORT}
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost:${PORT}/health || exit 1
ENTRYPOINT ["dotnet", "/app/BookingApi.dll"]
