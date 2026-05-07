FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY apps/backend/bin/Release/net8.0/ ./

EXPOSE ${PORT:-5000}
ENV ASPNETCORE_URLS=http://+:${PORT:-5000}

ENTRYPOINT ["dotnet", "BookingApi.dll"]