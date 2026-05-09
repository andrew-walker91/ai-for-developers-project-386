FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY apps/backend/*.csproj ./
RUN dotnet restore

COPY apps/backend/ ./
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE ${PORT:-5000}
ENV ASPNETCORE_URLS=http://+:${PORT:-5000}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-5000}/health || exit 1

ENTRYPOINT ["dotnet", "BookingApi.dll"]