# Technical Specifications

## LM2596 Efficiency Model

Based on TI datasheet and empirical measurements. Factors: duty cycle, load current, voltage differential, thermal.

### Sweet Spot

Current: 0.5-1.5A | Voltage gap: 2-8V | Stability min: 1.5V

### Efficiency Ranges

88% (optimal) | 85% (good) | 77% (fair) | 73% (poor)

### Thermal

<0.5W (cool) | 0.5-1.0W (warm) | 1.0-1.5W (hot) | >1.5W (critical - heatsink required)

## Build Outputs

Library: ES + UMD → `dist/` | Apps: `dist-d3/`, `dist-react/`

## Verification Status

- ✅ TypeScript strict mode enabled
- ✅ All unit tests passing (16/16)
- ✅ No TypeScript errors
- ✅ Core calculator implemented
- ✅ Browser headless API complete
- ✅ D3 visualization app functional
- ✅ React app with components
- ✅ Build scripts configured
- ✅ Documentation complete
- ✅ Git ignore configured
