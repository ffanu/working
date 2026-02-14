# Working

Inventory management platform with an ASP.NET Core API and a Next.js web app.

## Overview
This repository contains two primary apps:
- `backend/InventoryAPI`: REST API built on ASP.NET Core 9, MongoDB, and JWT auth
- `frontend`: Next.js (App Router) web interface

Additional docs are available in `documentation.html`.

## Features
- Product, customer, and supplier management
- Sales, purchases, and refunds
- Installment plans and modifications
- Warehouses, stock levels, and transfer orders
- Backups and exports
- Authentication and user management

## Tech Stack
- Backend: ASP.NET Core 9, MongoDB, JWT
- Frontend: Next.js, TypeScript, Tailwind CSS

## Project Structure
```text
.
├── backend/
│   └── InventoryAPI/
├── frontend/
└── documentation.html
```

## Quick Start
Prerequisites:
- .NET SDK 9
- Node.js 18+ (recommended) and npm
- MongoDB running locally or accessible via connection string

Backend:
```bash
cd backend/InventoryAPI

dotnet restore
dotnet run
```
The API listens on `http://localhost:5236` in the default profile.

Frontend:
```bash
cd frontend

npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

## Configuration
Backend config is in `backend/InventoryAPI/appsettings.json`:
- `ConnectionStrings:MongoDB` for the MongoDB URI
- `Jwt` section for token settings

Frontend config is in `frontend/src/lib/config.ts`:
- `NEXT_PUBLIC_API_URL` overrides the API base URL
- Defaults to `http://localhost:5236/api` for local dev
- Defaults to `https://inventory.appzone.info/api` for production

## API Notes
- Example HTTP requests: `backend/InventoryAPI/InventoryAPI.http`
- Additional documentation: `documentation.html`

## License
No license file is included yet.
