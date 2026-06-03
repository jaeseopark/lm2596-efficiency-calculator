# Testing, Debugging & Deployment

## Testing

Unit tests in `src/core/calculator.test.ts` using Vitest. Run: `npm test`

Coverage: duty cycle, efficiency, sweet spot, edge cases

## Debugging

- TypeScript errors: Check tsconfig paths, run `npm run type-check`
- Build errors: Clear `dist/`, verify dependencies
- Test failures: Use `npm run test:ui`



## Deployment

Library: `npm run build:lib && npm publish`
Static apps: Build (`npm run build:d3` or `npm run build:react`) then deploy `dist-*/` folder
