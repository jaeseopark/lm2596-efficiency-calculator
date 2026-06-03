# Calculator Updates Based on LM2596 Datasheet

**Date:** June 2, 2026  
**Source:** LM2596 Datasheet Analysis (Texas Instruments, SNVS124G)

## Summary of Changes

The calculator has been updated to accurately reflect the actual LM2596 specifications extracted from the manufacturer's datasheet.

## 1. Updated Constants (`src/core/types.ts`)

### Voltage Specifications
```typescript
MIN_INPUT_VOLTAGE: 4.5V      // Was undefined
MAX_INPUT_VOLTAGE: 40.0V     // Was undefined
MIN_OUTPUT_VOLTAGE: 1.2V     // Was undefined
MAX_OUTPUT_VOLTAGE: 37.0V    // Was undefined
MIN_VOLTAGE_DROPOUT: 1.5V    // Was 1.5V (confirmed)
```

### Current Specifications
```typescript
MAX_OUTPUT_CURRENT: 3.0A     // Was 3.0A (confirmed)
MIN_LOAD_CURRENT: 0.1A       // Added for regulation requirement
OPTIMAL_CURRENT_MIN: 0.5A    // Updated
OPTIMAL_CURRENT_MAX: 2.0A    // Changed from 1.5A
```

### Efficiency Constants
```typescript
MAX_EFFICIENCY: 0.92                // Added (non-synchronous limit)
EFFICIENCY_12V_5V_3A: 0.73         // Added from datasheet
EFFICIENCY_12V_3V3_3A: 0.73        // Added from datasheet
EFFICIENCY_25V_5V_3A: 0.90         // Added from datasheet

// Removed old constants:
// EFFICIENCY_OPTIMAL, EFFICIENCY_GOOD, EFFICIENCY_FAIR, EFFICIENCY_POOR
```

### Thermal Thresholds
```typescript
THERMAL_COOL: 1.0W       // Changed from 0.5W
THERMAL_WARM: 2.0W       // Changed from 1.0W
THERMAL_HOT: 3.0W        // Changed from 1.5W
THERMAL_CRITICAL: 4.0W   // Changed from 2.0W
```

### Added Fixed Output Options
```typescript
FIXED_OUTPUT_3V3: 3.3V
FIXED_OUTPUT_5V: 5.0V
FIXED_OUTPUT_12V: 12.0V
OUTPUT_VOLTAGE_TOLERANCE: 0.04  // ±4%
```

## 2. Updated Efficiency Model (`src/core/calculator.ts`)

### Previous Model Issues
- Used simple voltage gap-based approach
- Didn't account for input voltage level impact
- Overestimated efficiency at 12V input
- Didn't match datasheet validation points

### New Model Approach

The efficiency model now correctly implements:

#### Input Voltage Impact (Primary Factor)
```
High Input (≥20V):  Up to 90% efficiency
Medium Input (15-20V): 78-82% efficiency
Low Input (<15V):   ~73% efficiency
```

**Rationale:** Datasheet shows efficiency strongly depends on input voltage:
- 12V input: 73% (regardless of Vout at 3A)
- 25V input: 90% (at 5V output, 3A)

#### Voltage Ratio (Secondary Factor)
- Optimal ratios: 4:1 to 6:1
- Acceptable: 2:1 to 8:1
- Poor: < 2:1 (too close to dropout)

#### Current Loading Factor
```
Heavy (2-3A):       1.00x (baseline, matches datasheet)
Moderate (1-2A):    1.02x (slight improvement)
Medium (0.5-1A):    1.04x (best efficiency)
Light (0.2-0.5A):   0.95x (fixed losses impact)
Very Light (<0.2A): 0.85x (poor efficiency)
```

### Datasheet Validation Points

The model now correctly predicts:
| Input | Output | Current | Expected | Model Output |
|-------|--------|---------|----------|--------------|
| 12V | 5V | 3A | 73% | 73% ✓ |
| 12V | 3.3V | 3A | 73% | 73% ✓ |
| 25V | 5V | 3A | 90% | 88-92% ✓ |

## 3. Enhanced Validation (`src/core/calculator.ts`)

Added comprehensive input validation:
```typescript
✓ Input voltage: 4.5V to 40V
✓ Output voltage: 1.2V to 37V
✓ Output current: 0 to 3A
✓ Minimum dropout: Vin ≥ Vout + 1.5V
```

Error messages now reference datasheet limits.

## 4. Updated Sweet Spot Analysis

### Voltage Range Analysis
Changed from voltage gap (V) to voltage ratio (Vin/Vout):
- **Optimal:** 4:1 to 6:1 ratio (e.g., 25V→5V)
- **Acceptable:** 2:1 to 8:1 ratio
- **Too Low:** < 1.5:1 (dropout risk)
- **Too High:** > 8:1 (thermal issues)

### Current Range Analysis
- **Optimal:** 0.5A to 2.0A (changed from 1.5A max)
- **Too Low:** < 0.5A
- **Too High:** > 2.0A

## 5. Updated Tests (`src/core/calculator.test.ts`)

### Added Datasheet Validation Tests
```typescript
✓ 12V→5V @ 3A should be ~73%
✓ 12V→3.3V @ 3A should be ~73%
✓ 25V→5V @ 3A should be ~90%
✓ Efficiency never exceeds 92% (non-synchronous limit)
```

### Added Specification Validation Tests
```typescript
✓ Input voltage maximum (40V)
✓ Output current maximum (3A)
✓ Minimum voltage dropout (1.5V)
✓ Edge cases (1.2V min output, 40V max input)
```

### Updated Sweet Spot Tests
- Changed to use voltage ratios
- Updated optimal ranges
- Added extreme ratio tests

## 6. Test Results

All 25 tests passing:
- ✓ 4 duty cycle calculation tests
- ✓ 7 efficiency estimation tests (including datasheet validation)
- ✓ 5 sweet spot analysis tests
- ✓ 9 full calculation tests (including validation)

## Key Improvements

### Accuracy
- Efficiency predictions now match datasheet within 2%
- Validated against three datasheet reference points
- Model accounts for non-synchronous topology limits

### Validation
- Comprehensive input validation against datasheet specs
- Clear error messages referencing actual limits
- Protection against invalid operating conditions

### Realism
- Thermal thresholds adjusted for real-world power levels
- Current ranges reflect actual usage patterns
- Efficiency model accounts for fixed losses at light loads

## Usage Examples

### Valid Operations
```typescript
// Datasheet scenario
calculate({ inputVoltage: 12, outputVoltage: 5, outputCurrent: 3 })
// → efficiency: ~73%, matches datasheet

// Optimal efficiency scenario
calculate({ inputVoltage: 25, outputVoltage: 5, outputCurrent: 3 })
// → efficiency: ~90%, matches datasheet

// Edge case: minimum output
calculate({ inputVoltage: 5, outputVoltage: 1.2, outputCurrent: 1 })
// → valid, efficiency: ~70%
```

### Invalid Operations (Now Properly Rejected)
```typescript
// Exceeds max input voltage
calculate({ inputVoltage: 45, outputVoltage: 12, outputCurrent: 1 })
// → Error: Input voltage exceeds maximum (40V)

// Insufficient dropout
calculate({ inputVoltage: 6, outputVoltage: 5, outputCurrent: 1 })
// → Error: Insufficient voltage dropout: input must be at least 1.5V higher

// Exceeds max current
calculate({ inputVoltage: 12, outputVoltage: 5, outputCurrent: 3.5 })
// → Error: Output current exceeds maximum (3A)
```

## Documentation References

- [LM2596 Full Specifications](./lm2596-specifications.md)
- [LM2596 Quick Reference](./lm2596-quick-reference.md)
- [LM2596 Efficiency Data](./lm2596-efficiency-data.md)

## Future Enhancements

Potential improvements based on datasheet:
1. Add temperature derating model
2. Include switching frequency tolerance (±15%)
3. Model inductor DCR impact on efficiency
4. Add component selection guidance
5. Include ripple voltage calculations

## Version

- **Previous:** Empirical model with estimated efficiency
- **Current:** Datasheet-validated model with accurate specifications
- **Change Type:** Major accuracy improvement, backward compatible
