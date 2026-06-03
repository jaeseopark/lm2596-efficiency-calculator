# LM2596 Efficiency Data Points

## Extracted from Manufacturer's Datasheet

This document contains efficiency data points extracted from the LM2596 datasheet
that can be used for validation and comparison with calculated values.

## Raw Efficiency Data Points

| Vin (V) | Vout (V) | Iload (A) | Efficiency (%) | Notes |
|---------|----------|-----------|----------------|-------|
| 12 | 5.0 | 3.0 | 73 | Standard test condition |
| 12 | 3.3 | 3.0 | 73 | Lower output voltage |
| 12 | 3.0 | 3.0 | 73 | Listed in datasheet |
| 25 | 5.0 | 3.0 | 90 | Higher Vin, better efficiency for ratio |
| 12 | Various | 3.0 | 80 | Alternative measurement |

## Efficiency Trends

### By Input Voltage (Vout = 5V, Iload = 3A)
```
Vin (V)  | Efficiency (%)
---------|---------------
12       | 73
25       | 90
```
**Trend:** Higher Vin with same Vout = Higher efficiency (for reasonable ratios)

### By Output Voltage (Vin = 12V, Iload = 3A)
```
Vout (V) | Efficiency (%)
---------|---------------
3.0      | 73
3.3      | 73
5.0      | 73-80
```
**Trend:** Similar efficiency across different Vout values at 12V input

### Efficiency vs Vin/Vout Ratio
```
Ratio   | Example       | Efficiency (%)
--------|---------------|---------------
2.4:1   | 12V → 5V      | 73-80
3.6:1   | 12V → 3.3V    | 73
4.0:1   | 12V → 3V      | 73
5.0:1   | 25V → 5V      | 90
```

## Efficiency Loss Factors

Based on datasheet information:

### 1. Conduction Losses
- Switch on-resistance (RDS(on))
- Diode forward voltage drop
- Inductor DC resistance (DCR)
- ESR of capacitors

### 2. Switching Losses
- Turn-on and turn-off transitions
- Gate drive losses
- Frequency-dependent (150 kHz fixed)

### 3. Other Losses
- Control circuit quiescent current
- Reverse recovery of catch diode
- Core losses in inductor

## Typical Efficiency Curve Characteristics

### Full Load (3A)
- **Peak efficiency:** 85-90% (optimal Vin/Vout ratio)
- **Typical efficiency:** 73-80% (common applications)
- **Poor efficiency:** < 70% (very high Vin/Vout ratio)

### Light Load (< 0.3A)
- Efficiency typically drops due to fixed losses
- Quiescent current becomes significant percentage

### Heavy Load (2-3A)
- Better efficiency due to conduction losses being more dominant
- Thermal management becomes critical

## Expected Efficiency Ranges by Application

### 12V → 5V @ 3A (Common automotive)
- **Datasheet:** 73-80%
- **Real-world with good PCB:** 70-75%
- **With losses (diode, PCB resistance):** 68-73%

### 24V → 5V @ 3A (Industrial)
- **Datasheet:** ~85%
- **Real-world:** 80-83%

### 12V → 3.3V @ 3A (Low voltage digital)
- **Datasheet:** 73%
- **Real-world:** 68-72%

## Efficiency Calculation Model

For calculator validation, efficiency can be approximated as:

```
η ≈ η_max × k_ratio × k_load × k_thermal

Where:
- η_max: Maximum efficiency (~0.90 for LM2596)
- k_ratio: Ratio factor (function of Vin/Vout)
- k_load: Load factor (function of Iload/Imax)
- k_thermal: Thermal derating factor
```

### Ratio Factor (k_ratio)
```
Vin/Vout  | k_ratio
----------|--------
1.5-2.0   | 0.70
2.0-3.0   | 0.80
3.0-4.0   | 0.85
4.0-6.0   | 0.95
6.0-8.0   | 1.00
> 8.0     | 0.95
```

### Load Factor (k_load)
```
Iload/Imax | k_load
-----------|-------
< 0.1      | 0.60
0.1-0.3    | 0.75
0.3-0.5    | 0.85
0.5-0.7    | 0.92
0.7-1.0    | 1.00
```

## Power Loss Components

For Vin = 12V, Vout = 5V, Iload = 3A, η = 73%:

```
Pin  = Vout × Iload / η = 5V × 3A / 0.73 = 20.55W
Pout = Vout × Iload = 5V × 3A = 15W
Ploss = Pin - Pout = 5.55W
```

### Loss Breakdown (Estimated)
- Switch conduction: ~35% of total loss (~2W)
- Diode forward voltage: ~30% of total loss (~1.7W)
- Switching losses: ~20% of total loss (~1.1W)
- Inductor DCR: ~10% of total loss (~0.5W)
- Other (control, gate drive): ~5% of total loss (~0.3W)

## Using This Data in Calculator

### Validation Points
Test the calculator's efficiency function against these known data points:
1. calcEfficiency(12, 5, 3) should return ≈ 73-80%
2. calcEfficiency(25, 5, 3) should return ≈ 90%
3. calcEfficiency(12, 3.3, 3) should return ≈ 73%

### Realistic Ranges
- Ensure efficiency never exceeds 92% (non-synchronous limit)
- Ensure efficiency at very light loads (< 0.1A) drops to 50-60%
- Account for minimum Vin-Vout differential (1.5V)

### Edge Cases
- Vin close to Vout (< 2V difference): Lower efficiency, high ripple
- Very high Vin/Vout (> 10:1): Reduced efficiency, thermal issues
- Very light loads: Fixed losses dominate, efficiency < 60%

## References

- LM2596 Datasheet (Texas Instruments, SNVS124G)
- Switching Regulator Fundamentals
- Buck Converter Efficiency Analysis
