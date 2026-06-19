# F1 Dashboard

A modern Formula 1 dashboard built with Next.js. It brings together race calendar data, standings, circuit visuals, driver profiles, constructor profiles, and race-session insights in one responsive web app.

Live demo: [f1-dashboard-tau-seven.vercel.app](https://f1-dashboard-tau-seven.vercel.app)

## Features

- Next race landing view with countdown, event metadata, and circuit preview
- Full race calendar with race status, schedule context, and detail pages
- Interactive race center pages with circuit maps, sectors, DRS zones, weather, starting grid, results, fastest laps, stints, race control messages, and recent winners
- Driver standings, driver profile pages, season history charts, and driver imagery
- Constructor standings, team profile pages, team colors, logos, and driver lineups
- OpenF1 API integration with in-memory caching and optional Redis caching
- Local GeoJSON circuit data for track rendering and map-style overlays
- Responsive UI built with the Next.js App Router, React, Tailwind CSS, Framer Motion, Lucide icons, Recharts, and Turf.js

## Tech Stack

- Framework: Next.js 15, React 19, TypeScript
- Styling: Tailwind CSS 4
- Data and charts: OpenF1 API, Recharts, date-fns
- Maps and geometry: GeoJSON, Turf.js, Leaflet, React Leaflet
- UI utilities: Lucide React, Framer Motion, clsx, tailwind-merge
- Optional cache: Redis through `REDIS_URL`

## Project Structure

```text
src/
  app/                      App Router pages and API routes
  components/               Dashboard, navigation, chart, and UI components
  lib/                      OpenF1 data access, caching, and utilities
public/
  assets/                   Driver photos and constructor logos
  data/                     F1 circuit GeoJSON and location metadata
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

The app runs without required environment variables. For shared server-side caching, you can optionally add:

```bash
REDIS_URL=your_redis_connection_string
```

Without `REDIS_URL`, the app uses an in-memory cache during runtime.

## Scripts

```bash
npm run dev      # Start the local development server
npm run build    # Create a production build
npm run start    # Run the production build locally
npm run lint     # Run ESLint
```

## Deployment

This project is ready for Vercel deployment.

```bash
npm run build
npx vercel --prod
```

The deployed production build is available at:

[https://f1-dashboard-tau-seven.vercel.app](https://f1-dashboard-tau-seven.vercel.app)

## Data Sources

Race, session, standings, weather, timing, and race-control data are fetched from the [OpenF1 API](https://openf1.org/). Static circuit geometry and local visual assets are stored under `public/`.

## Repository

GitHub: [neevj2006/f1-dashboard](https://github.com/neevj2006/f1-dashboard)
