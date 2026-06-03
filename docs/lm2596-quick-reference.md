# LM2596 Quick Reference Card

## At a Glance

| Specification | Value |
|--------------|-------|
| Type | Buck (Step-Down) Regulator |
| Input Voltage | 4.5V to 40V |
| Output Current | 3A max |
| Output Options | 3.3V, 5V, 12V, Adjustable (1.2-37V) |
| Efficiency | 73% to 90% (varies with conditions) |
| Switching Freq | 150 kHz (fixed) |
| External Parts | 4 minimum (L, Cin, Cout, Diode) |

## Key Design Constraints

```
Vin,min = Vout + 1.5V    (minimum dropout)
Vout,max = 37V           (adjustable version)
Iout,max = 3A            (with heatsinking)
```

## Typical Efficiency

| Vin | Vout | Iload | η |
|-----|------|-------|---|
| 12V | 5V | 3A | 73% |
| 12V | 3.3V | 3A | 73% |
| 25V | 5V | 3A | 90% |

**Rule of thumb:** Lower Vin/Vout ratio = Higher efficiency

## Component Values

### Inductor
- **Range:** 33-100 µH
- **Common:** 47 µH
- **Rating:** > Iout + ripple current

### Output Capacitor
- **Range:** 470-1000 µF
- **Type:** Low ESR electrolytic
- **ESR:** < 0.1Ω for low ripple

### Input Capacitor
- **Range:** 100-220 µF
- **Type:** Low ESR electrolytic

### Catch Diode
- **Type:** Schottky (1N5822, SS34)
- **Rating:** 3A+, Vr > Vin,max
- **Lower Vf:** Better efficiency

## Protection Features

- ✓ Cycle-by-cycle current limiting
- ✓ Thermal shutdown
- ✓ Enable/disable (TTL compatible)
- ✓ Standby: 80 µA typical

## PCB Layout Tips

1. ⚡ Keep switching node traces **short**
2. 🔄 Minimize loop area (Cin, diode, ground)
3. 📏 Wide traces for high current paths
4. 🛡️ Use ground plane
5. 🎯 Keep feedback away from switching node

## Common Applications

- 12V/24V → 5V/3.3V (automotive)
- Industrial power supplies
- Battery-powered devices
- Set-top boxes, EPOS systems

## When to Use LM2596

✅ **Good for:**
- Simple designs (4 components)
- Wide input range needed
- Cost-sensitive applications
- Through-hole preferred
- 150 kHz acceptable

❌ **Consider alternatives if:**
- Need > 90% efficiency
- Space critical (smaller modules available)
- Need higher switching frequency
- Synchronous topology preferred

## Quick Calculations

### Output Voltage (Adjustable)
```
Vout = 1.23V × (1 + R2/R1)
```

### Power Dissipation (Approx)
```
Pdiss ≈ (Vin - Vout) × Iout × (1 - η)
```

### Efficiency Impact
```
↑ Vin/Vout ratio → ↓ Efficiency → ↑ Heat
```

## Datasheet Quick Links

- Full specs: See [lm2596-specifications.md](./lm2596-specifications.md)
- Design tool: TI WEBENCH® Power Designer
- Alternatives: LMR51430 (synchronous), TLVM13630 (module)
