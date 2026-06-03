# Development Workflow

## Setup

`npm install` then `npm run dev` (requires Node.js )

## Build System

Vite builds: library (core + browser), d3-app, react-app. TypeScript strict mode enabled.

## Commands

`npm run dev:d3` | `npm run dev:react` | `npm test` | `npm run build`

## Code Style

- TypeScript: Explicit types, `interface` over `type`, no `any`
- React: Functional components, typed props
- D3: Clean up in useEffect

## Adding Features

**Calculation:** Add to `src/core/calculator.ts`, export from `index.ts`, write tests
**Chart:** Add D3 function to `charts.ts`, create React component
**Browser API:** Extend `src/browser/index.ts`, test in `browser-demo.html`
