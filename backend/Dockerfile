# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /app

# Copy solution and project files
COPY InventoryManagement.slnx ./
COPY src/InventoryManagement.Core/InventoryManagement.Core.csproj src/InventoryManagement.Core/
COPY src/InventoryManagement.Infrastructure/InventoryManagement.Infrastructure.csproj src/InventoryManagement.Infrastructure/
COPY src/InventoryManagement.Api/InventoryManagement.Api.csproj src/InventoryManagement.Api/

# Restore dependencies
RUN dotnet restore src/InventoryManagement.Api/InventoryManagement.Api.csproj

# Copy the rest of the source code
COPY . .

# Publish release artifact
WORKDIR /app/src/InventoryManagement.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "InventoryManagement.Api.dll"]
