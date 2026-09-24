# GeoAIData Tech

Production-ready multilingual corporate website built with Next.js App Router, TypeScript, Framer Motion, React Three Fiber, GSAP, Lenis, React Hook Form, and Zod.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000. Locale routes: `/uz`, `/ru`, `/en`.

## Production

```bash
npm run build
npm start
```

## Content

Reusable company content lives in `src/data/site.ts`. Replace placeholder contact details, testimonials, metrics, project visuals, and organization identifiers before production. Set environment values from `.env.example`.

## Architecture

- `src/app/[locale]` localized App Router pages
- `src/components` shared layout, animation, map, globe, and form UI
- `src/data` CMS-ready content models
- `src/lib` locale and utility helpers

