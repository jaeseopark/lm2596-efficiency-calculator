/**
 * Unit tests for LM2596 calculator core functions
 */

import { describe, it, expect } from 'vitest';
import { calculate, calculateDutyCycle, estimateEfficiency, analyzeSweetSpot } from './calculator';
import type { ConverterInput } from './types';

describe('calculateDutyCycle', () => {
  it('should calculate correct duty cycle for 12V to 5V', () => {
    const result = calculateDutyCycle(12, 5);
    expect(result).toBeCloseTo(41.67, 1);
  });

  it('should calculate correct duty cycle for 12V to 3.7V', () => {
    const result = calculateDutyCycle(12, 3.7);
    expect(result).toBeCloseTo(30.83, 1);
  });

  it('should throw error for zero input voltage', () => {
    expect(() => calculateDutyCycle(0, 5)).toThrow('Input voltage must be greater than 0');
  });

  it('should throw error when output >= input', () => {
    expect(() => calculateDutyCycle(5, 12)).toThrow('Output voltage must be less than input voltage');
  });
});

describe('estimateEfficiency', () => {
  it('should match datasheet: 12V->5V @ 3A = ~73%', () => {
    const input: ConverterInput = {
      inputVoltage: 12,
      outputVoltage: 5,
      outputCurrent: 3.0,
    };
    const efficiency = estimateEfficiency(input);
    expect(efficiency).toBeGreaterThanOrEqual(72);
    expect(efficiency).toBeLessThanOrEqual(75);
  });

  it('should match datasheet: 12V->3.3V @ 3A = ~73%', () => {
    const input: ConverterInput = {
      inputVoltage: 12,
      outputVoltage: 3.3,
      outputCurrent: 3.0,
    };
    const efficiency = estimateEfficiency(input);
    expect(efficiency).toBeGreaterThanOrEqual(72);
    expect(efficiency).toBeLessThanOrEqual(75);
  });

  it('should match datasheet: 25V->5V @ 3A = ~90%', () => {
    const input: ConverterInput = {
      inputVoltage: 25,
      outputVoltage: 5,
      outputCurrent: 3.0,
    };
    const efficiency = estimateEfficiency(input);
    expect(efficiency).toBeGreaterThanOrEqual(88);
    expect(efficiency).toBeLessThanOrEqual(92);
  });

  it('should show improved efficiency at moderate load vs heavy load', () => {
    const heavyLoad: ConverterInput = {
      inputVoltage: 12,
      outputVoltage: 5,
      outputCurrent: 3.0,
    };
    const moderateLoad: ConverterInput = {
      inputVoltage: 12,
      outputVoltage: 5,
      outputCurrent: 1.0,
    };
    const effHeavy = estimateEfficiency(heavyLoad);
    const effModerate = estimateEfficiency(moderateLoad);
    expect(effModerate).toBeGreaterThanOrEqual(effHeavy);
  });

  it('should estimate lower efficiency at very low current', () => {
    const input: ConverterInput = {
      inputVoltage: 12,
      outputVoltage: 5,
      outputCurrent: 0.1,
    };
    const efficiency = estimateEfficiency(input);
    expect(efficiency).toBeLessThan(70);
  });

  it('should never exceed 92% (non-synchronous limit)', () => {
    const input: ConverterInput = {
      inputVoltage: 25,
      outputVoltage: 5,
      outputCurrent: 1.5,
    };
    const efficiency = estimateEfficiency(input);
    expect(efficiency).toBeLessThanOrEqual(92);
  });

  it('should have lower efficiency with very high voltage ratio', () => {
    const input: ConverterInput = {
      inputVoltage: 40,
      outputVoltage: 3.3,
      outputCurrent: 2.0,
    };
    const efficiency = estimateEfficiency(input);
    expect(efficiency).toBeLessThan(90);
  });

  describe('interpolation between datasheet points', () => {
    it('should interpolate between 12V and 25V input voltages', () => {
      const input18V: ConverterInput = {
        inputVoltage: 18,
        outputVoltage: 5,
        outputCurrent: 3.0,
      };
      const eff18V = estimateEfficiency(input18V);
      
      // Should be between 73% (12V) and 90% (25V)
      expect(eff18V).toBeGreaterThan(73);
      expect(eff18V).toBeLessThan(90);
      
      // 18V is about halfway, expect intermediate efficiency
      expect(eff18V).toBeGreaterThan(74);
      expect(eff18V).toBeLessThan(82);
    });

    it('should smoothly interpolate across current ranges', () => {
      const input1: ConverterInput = { inputVoltage: 12, outputVoltage: 5, outputCurrent: 0.5 };
      const input2: ConverterInput = { inputVoltage: 12, outputVoltage: 5, outputCurrent: 1.0 };
      const input3: ConverterInput = { inputVoltage: 12, outputVoltage: 5, outputCurrent: 2.0 };
      const input4: ConverterInput = { inputVoltage: 12, outputVoltage: 5, outputCurrent: 3.0 };
      
      const eff1 = estimateEfficiency(input1);
      const eff2 = estimateEfficiency(input2);
      const eff3 = estimateEfficiency(input3);
      const eff4 = estimateEfficiency(input4);
      
      // Peak efficiency should be around 0.5-1.0A range
      expect(eff1).toBeGreaterThan(eff4); // 0.5A better than 3A
      expect(eff2).toBeGreaterThan(eff4); // 1.0A better than 3A
      
      // Heavy load (3A) should match datasheet at ~73%
      expect(eff4).toBeGreaterThanOrEqual(72);
      expect(eff4).toBeLessThanOrEqual(75);
      
      // All should be in reasonable range for 12V input
      expect(eff1).toBeGreaterThan(72);
      expect(eff2).toBeGreaterThan(72);
      expect(eff3).toBeGreaterThan(71);
    });

    it('should interpolate for non-standard output voltages', () => {
      const input: ConverterInput = {
        inputVoltage: 12,
        outputVoltage: 4.0, // Between 3.3V and 5V
        outputCurrent: 3.0,
      };
      const efficiency = estimateEfficiency(input);
      
      // Should be similar to 12V->3.3V and 12V->5V (both ~73%)
      expect(efficiency).toBeGreaterThanOrEqual(72);
      expect(efficiency).toBeLessThanOrEqual(75);
    });

    it('should provide smooth transitions at voltage boundaries', () => {
      const inputs = [
        { inputVoltage: 14, outputVoltage: 5, outputCurrent: 3.0 },
        { inputVoltage: 15, outputVoltage: 5, outputCurrent: 3.0 },
        { inputVoltage: 16, outputVoltage: 5, outputCurrent: 3.0 },
      ];
      
      const efficiencies = inputs.map(i => estimateEfficiency(i));
      
      // Should show gradual increase, no sudden jumps
      const diff1 = efficiencies[1] - efficiencies[0];
      const diff2 = efficiencies[2] - efficiencies[1];
      
      // Differences should be small and similar (smooth)
      expect(Math.abs(diff1)).toBeLessThan(2);
      expect(Math.abs(diff2)).toBeLessThan(2);
      expect(Math.abs(diff1 - diff2)).toBeLessThan(1);
    });
  });
});

describe('analyzeSweetSpot', () => {
  it('should identify optimal conditions (25V->5V @ 1.5A)', () => {
    const input: ConverterInput = {
      inputVoltage: 25,
      outputVoltage: 5,
      outputCurrent: 1.5,
    };
    const analysis = analyzeSweetSpot(input);
    expect(analysis.currentRange).toBe('optimal');
    expect(analysis.voltageGapRange).toBe('optimal');
  });

  it('should identify too-low current', () => {
    const input: ConverterInput = {
      inputVoltage: 12,
      outputVoltage: 5,
      outputCurrent: 0.3,
    };
    const analysis = analyzeSweetSpot(input);
    expect(analysis.currentRange).toBe('too-low');
  });

  it('should identify too-high current', () => {
    const input: ConverterInput = {
      inputVoltage: 12,
      outputVoltage: 5,
      outputCurrent: 2.5,
    };
    const analysis = analyzeSweetSpot(input);
    expect(analysis.currentRange).toBe('too-high');
  });

  it('should identify too-low voltage ratio (close to dropout)', () => {
    const input: ConverterInput = {
      inputVoltage: 6.5,
      outputVoltage: 5,
      outputCurrent: 1.0,
    };
    const analysis = analyzeSweetSpot(input);
    expect(analysis.voltageGapRange).toBe('too-low');
  });

  it('should identify too-high voltage ratio', () => {
    const input: ConverterInput = {
      inputVoltage: 40,
      outputVoltage: 3.3,
      outputCurrent: 1.0,
    };
    const analysis = analyzeSweetSpot(input);
    expect(analysis.voltageGapRange).toBe('too-high');
  });
});

describe('calculate', () => {
  it('should calculate all parameters for datasheet scenario (12V->5V @ 3A)', () => {
    const input: ConverterInput = {
      inputVoltage: 12,
      outputVoltage: 5,
      outputCurrent: 3.0,
    };
    const result = calculate(input);
    
    expect(result.outputPower).toBeCloseTo(15.0, 1);
    expect(result.dutyCycle).toBeCloseTo(41.67, 1);
    expect(result.efficiency).toBeGreaterThanOrEqual(72);
    expect(result.efficiency).toBeLessThanOrEqual(75);
  });

  it('should calculate all parameters for high efficiency scenario (25V->5V @ 3A)', () => {
    const input: ConverterInput = {
      inputVoltage: 25,
      outputVoltage: 5,
      outputCurrent: 3.0,
    };
    const result = calculate(input);
    
    expect(result.outputPower).toBeCloseTo(15.0, 1);
    expect(result.dutyCycle).toBeCloseTo(20.0, 1);
    expect(result.efficiency).toBeGreaterThanOrEqual(88);
    expect(result.efficiency).toBeLessThanOrEqual(92);
  });

  it('should throw error when output >= input voltage', () => {
    const invalidInput: ConverterInput = {
      inputVoltage: 5,
      outputVoltage: 12,
      outputCurrent: 1.0,
    };
    expect(() => calculate(invalidInput)).toThrow('output voltage must be less than input voltage');
  });

  it('should throw error when voltage dropout is insufficient', () => {
    const invalidInput: ConverterInput = {
      inputVoltage: 6.0,
      outputVoltage: 5.0,
      outputCurrent: 1.0,
    };
    expect(() => calculate(invalidInput)).toThrow('Insufficient voltage dropout');
  });

  it('should throw error when input voltage exceeds maximum', () => {
    const invalidInput: ConverterInput = {
      inputVoltage: 45,
      outputVoltage: 12,
      outputCurrent: 1.0,
    };
    expect(() => calculate(invalidInput)).toThrow('Input voltage exceeds maximum');
  });

  it('should throw error when output current exceeds maximum', () => {
    const invalidInput: ConverterInput = {
      inputVoltage: 12,
      outputVoltage: 5,
      outputCurrent: 3.5,
    };
    expect(() => calculate(invalidInput)).toThrow('Output current exceeds maximum');
  });

  it('should calculate input current correctly', () => {
    const input: ConverterInput = {
      inputVoltage: 12,
      outputVoltage: 5,
      outputCurrent: 3.0,
    };
    const result = calculate(input);
    
    // Input current should be close to output power / input voltage / efficiency
    const expectedInputCurrent = result.inputPower / 12;
    expect(result.inputCurrent).toBeCloseTo(expectedInputCurrent, 2);
  });

  it('should accept valid edge case: minimum output voltage', () => {
    const input: ConverterInput = {
      inputVoltage: 5,
      outputVoltage: 1.2,
      outputCurrent: 1.0,
    };
    expect(() => calculate(input)).not.toThrow();
  });

  it('should accept valid edge case: maximum input voltage', () => {
    const input: ConverterInput = {
      inputVoltage: 40,
      outputVoltage: 12,
      outputCurrent: 1.0,
    };
    expect(() => calculate(input)).not.toThrow();
  });
});
