# Private Wire Solar Calculator

## Overview
A financial modeling application for solar assets with private wire integration. Built with React (Vite) frontend and Express/tRPC backend.

## Project Structure
- `client/` - React frontend with Vite
- `server/` - Express backend with tRPC API
- `drizzle/` - Database schema (MySQL/Drizzle ORM)
- `shared/` - Shared types and constants

## Tech Stack
- **Frontend**: React 19, Vite 7, TailwindCSS 4, Radix UI
- **Backend**: Express, tRPC, MySQL2, Drizzle ORM
- **Package Manager**: pnpm

## Running the Application
The application runs on port 5000 with both frontend and backend served from the same server.

```bash
pnpm dev
```

## Environment Variables (Optional)
The app can work without these, but for full functionality:
- `VITE_OAUTH_PORTAL_URL` - OAuth portal URL for authentication
- `VITE_APP_ID` - Application ID for OAuth
- `DATABASE_URL` - MySQL database connection string
- `JWT_SECRET` - Secret for cookie signing
- `OAUTH_SERVER_URL` - Server-side OAuth URL

## Features
- Solar financial modeling calculator
- IRR, NPV, LCOE calculations
- Sensitivity analysis
- PDF/CSV export
- Grid connection cost breakdown
