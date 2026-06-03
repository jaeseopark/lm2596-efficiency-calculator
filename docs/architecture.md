# Project Architecture

## Project Overview

A complete TypeScript-based LM2596 efficiency calculator with multiple implementations.

## Core Module (`src/core/`)

The core module contains pure TypeScript calculation logic with no dependencies on DOM or React.

**Key Files:**
- `types.ts` - Type definitions and constants
- `calculator.ts` - Calculation functions
- `calculator.test.ts` - Unit tests
- `index.ts` - Module exports

**Design Principles:**
- Pure functions with no side effects
- Comprehensive input validation
- Type-safe with strict TypeScript
- Extensively tested (16 tests)

**Key Functions:**
- `calculate()` - Main calculation with full results
- `calculateDutyCycle()` - Duty cycle calculation
- `estimateEfficiency()` - Efficiency estimation
- `analyzeSweetSpot()` - Operating point analysis

## Browser Module (`src/browser/`)

Provides browser-friendly exports for use in `<script>` tags.

**Features:**
- UMD module format
- Direct function calls
- DOM element binding
- Auto-update on input changes

**Usage Example:**
```html
<script src="dist/browser.umd.js"></script>
<script>
  const result = LM2596Calculator.calculate({...});
  // or
  LM2596Calculator.bindToElements({...});
</script>
```

## D3 Visualization App (`src/d3-app/`)

Standalone vanilla TypeScript + D3 visualization app.

**Components:**
- `main.ts` - App initialization and controls
- `charts.ts` - D3 chart components
- `style.css` - Application styling

**Charts:**
- Efficiency vs Current (with sweet spot highlighting)
- Power Loss vs Current (with thermal thresholds)
- Real-time updates with current point marker

**Run:** `npm run dev:d3`

## React App (`src/react-app/`)

Full React implementation with D3 integration.

**Component Structure:**
```
App
├── CalculatorControls (input sliders)
├── ResultsDisplay (metrics and recommendations)
└── Charts
    ├── EfficiencyChart
    └── PowerLossChart
```

**Key Patterns:**
- Controlled components with React state
- useEffect for D3 chart lifecycle
- CSS modules for styling
- Type-safe props

**Run:** `npm run dev:react`

## Configuration

Key configs: `package.json`, `tsconfig.json`, `vite.config.ts`, `.nvmrc` (Node 24.16.0)
