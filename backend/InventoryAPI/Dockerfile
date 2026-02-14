FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5236

FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["InventoryAPI.csproj", "./"]
RUN dotnet restore "InventoryAPI.csproj"
COPY . .
RUN dotnet build "InventoryAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "InventoryAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "InventoryAPI.dll"] 