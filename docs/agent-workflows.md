# Agent Workflow Examples

Step-by-step workflows for common development tasks.

## Example 1: Adding a New Calculation Function

```
1. Read docs/index.md (identify relevant docs)
2. Read docs/architecture.md > "Core Module" section
3. Read src/core/calculator.ts (understand current structure)
4. Add new function to src/core/calculator.ts
5. Export from src/core/index.ts
6. Write tests in src/core/calculator.test.ts
7. Run npm test to verify
8. Update type definitions in src/core/types.ts if needed
```

**Documents needed:**
- docs/architecture.md
- docs/development-workflow.md (for testing guidelines)

## Example 2: Fixing a Build Error

```
1. Read docs/index.md (identify debugging resources)
2. Read docs/testing-deployment.md > "Debugging" > "Build Errors"
3. Check relevant configuration files (vite.config.ts, tsconfig.json)
4. Clear dist/ folders if needed
5. Verify all dependencies installed (npm install)
6. Apply fix
7. Run npm run type-check to verify
```

**Documents needed:**
- docs/testing-deployment.md

## Example 3: Understanding Project Structure

```
1. Read docs/index.md (overview)
2. Read docs/project-structure.md > "Structure Created"
3. Explore specific directories as needed
4. Check docs/architecture.md for component details
```

**Documents needed:**
- docs/project-structure.md
- docs/architecture.md

## Example 4: Adding a New Chart Type

```
1. Read docs/index.md (identify relevant docs)
2. Read docs/architecture.md > "D3 App" and "React App" sections
3. Add D3 function to src/d3-app/charts.ts
4. Create React component in src/react-app/components/
5. Integrate into both apps (main.ts and App.tsx)
6. Test visually in both apps (npm run dev:d3, npm run dev:react)
7. Update docs/architecture.md if significant change
```

**Documents needed:**
- docs/architecture.md
- docs/development-workflow.md

## Example 5: Deploying Apps to Production

```
1. Read docs/testing-deployment.md > "Deployment" section
2. Run npm test to ensure all tests pass
3. Run npm run build to build all targets
4. For D3 app: Deploy dist-d3/ folder to static hosting
5. For React app: Deploy dist-react/ folder to static hosting
6. Verify deployed apps work correctly
```

**Documents needed:**
- docs/testing-deployment.md

## Example 6: Understanding LM2596 Efficiency Model

```
1. Read docs/index.md (identify relevant docs)
2. Read docs/technical-specs.md > "LM2596 Efficiency Model"
3. Review src/core/calculator.ts for implementation details
4. Check src/core/types.ts for constants and ranges
```

**Documents needed:**
- docs/technical-specs.md

## Tips for Efficient Workflows

- **Always start with docs/index.md** - It's your navigation hub
- **Load only what you need** - Don't read entire files if you need one section
- **Use grep/search** - Find specific code or config quickly
- **Verify changes** - Run tests and type-check after modifications
- **Update docs** - If you add significant features, update relevant docs
