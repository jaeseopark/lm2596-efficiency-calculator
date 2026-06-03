# Project Structure

Complete file structure and component overview.

## Directory Structure

```
lm2596-efficiency-calculator/
├── src/
│   ├── core/                    # Pure TypeScript calculator
│   │   ├── types.ts            # Type definitions & constants
│   │   ├── calculator.ts       # Core calculation logic
│   │   ├── calculator.test.ts  # Unit tests (16 tests, all passing)
│   │   └── index.ts            # Module exports
│   │
│   ├── browser/                 # Browser headless API
│   │   └── index.ts            # DOM binding & UMD exports
│   │
│   ├── d3-app/                  # D3 visualization app
│   │   ├── main.ts             # App entry point
│   │   ├── charts.ts           # D3 chart components
│   │   └── style.css           # Styling
│   │
│   ├── react-app/               # React + D3 app
│   │   ├── main.tsx            # React entry point
│   │   ├── App.tsx             # Main component
│   │   ├── App.css
│   │   ├── index.css
│   │   └── components/
│   │       ├── CalculatorControls.tsx/.css
│   │       ├── ResultsDisplay.tsx/.css
│   │       ├── EfficiencyChart.tsx
│   │       ├── PowerLossChart.tsx
│   │       └── Chart.css
│   │
│   ├── test/
│   │   └── setup.ts            # Vitest setup
│   │
│   └── vite-env.d.ts           # Vite type definitions
│
├── docs/                        # Documentation
│   ├── index.md                # Table of contents
│   ├── architecture.md         # Project architecture
│   ├── development-workflow.md # Development guide
│   ├── testing-deployment.md   # Testing & deployment
│   ├── project-structure.md    # This file
│   ├── technical-specs.md      # Technical specifications
│   └── agent-workflows.md      # Agent workflow examples
│
├── Configuration Files
│   ├── package.json            # Dependencies & scripts
│   ├── tsconfig.json          # TypeScript config (strict mode)
│   ├── tsconfig.node.json     # Node config
│   ├── vite.config.ts         # Vite build config
│   ├── .nvmrc                 # Node.js version (24.16.0)
│   └── .gitignore             # Git ignore rules
│
├── HTML Entry Points
│   ├── index.html             # D3 app entry
│   ├── react.html             # React app entry
│   └── browser-demo.html      # Browser API demo
│
├── README.md                   # Main documentation
└── AGENTS.md                   # AI agent instructions

Total: 21 TypeScript/TSX files, 6 CSS files, 3 HTML files
```


