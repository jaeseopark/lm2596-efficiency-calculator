/**
 * LM2596 Buck Converter Efficiency Calculator
 * 
 * Core calculation functions based on manufacturer's datasheet
 * Source: Texas Instruments LM2596 Datasheet (SNVS124G)
 * 
 * Key datasheet specifications:
 * - Input voltage: 4.5V to 40V (Vout + 1.5V minimum)
 * - Output voltage: 1.2V to 37V (adjustable), fixed 3.3V/5V/12V
 * - Max output current: 3A continuous
 * - Switching frequency: 150 kHz (fixed)
 * - Efficiency: 73% to 90% depending on operating conditions
 * 
 * Validated efficiency data points:
 * - 12V → 5V @ 3A: 73%
 * - 12V → 3.3V @ 3A: 73%
 * - 25V → 5V @ 3A: 90%
 * 
 * See docs/lm2596-specifications.md for complete specifications
 * See docs/calculator-updates.md for implementation details
 */

import type { ConverterInput, ConverterResult, SweetSpotAnalysis } from './types';
import { LM2596_CONSTANTS } from './types';

/**
 * Calculate the duty cycle for a buck converter
 * Duty Cycle = V_out / V_in
 */
export function calculateDutyCycle(inputVoltage: number, outputVoltage: number): number {
  if (inputVoltage <= 0) {
    throw new Error('Input voltage must be greater than 0');
  }
  if (outputVoltage < 0) {
    throw new Error('Output voltage must be non-negative');
  }
  if (outputVoltage >= inputVoltage) {
    throw new Error('Output voltage must be less than input voltage for buck converter');
  }
  
  return (outputVoltage / inputVoltage) * 100;
}

/**
 * Linear interpolation helper
 * Returns value between y0 and y1 based on x position between x0 and x1
 */
function lerp(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0;
  const t = Math.max(0, Math.min(1, (x - x0) / (x1 - x0)));
  return y0 + t * (y1 - y0);
}

/**
 * Get efficiency multiplier based on output current
 * Smoothly interpolates between current ranges
 */
function getCurrentEfficiencyFactor(current: number): number {
  // Datasheet tests are at 3A (heavy load)
  // Light loads have reduced efficiency due to fixed losses
  
  if (current >= 2.5) {
    // Very heavy load (2.5-3A): slight penalty due to losses
    return lerp(current, 2.5, 3.0, 1.0, 0.99);
  } else if (current >= 1.5) {
    // Heavy load (1.5-2.5A): baseline efficiency
    return 1.0;
  } else if (current >= 0.8) {
    // Moderate load (0.8-1.5A): slightly better efficiency
    return lerp(current, 0.8, 1.5, 1.03, 1.01);
  } else if (current >= 0.4) {
    // Medium load (0.4-0.8A): peak efficiency
    return lerp(current, 0.4, 0.8, 1.04, 1.03);
  } else if (current >= 0.2) {
    // Light load (0.2-0.4A): fixed losses becoming significant
    return lerp(current, 0.2, 0.4, 0.95, 1.04);
  } else if (current >= 0.1) {
    // Very light load (0.1-0.2A): poor efficiency
    return lerp(current, 0.1, 0.2, 0.82, 0.95);
  } else if (current > 0) {
    // Extremely light load (0-0.1A): quiescent current dominates
    return lerp(current, 0.0, 0.1, 0.60, 0.82);
  } else {
    return 0.60; // No load
  }
}

/**
 * Estimate efficiency based on operating conditions
 * Based on LM2596 datasheet (Texas Instruments, SNVS124G)
 * 
 * Uses bilinear interpolation between known datasheet points:
 * - 12V → 5V @ 3A: 73%
 * - 12V → 3.3V @ 3A: 73%
 * - 25V → 5V @ 3A: 90%
 * 
 * Interpolation approach:
 * 1. Base efficiency from input voltage and voltage ratio (bilinear)
 * 2. Current-based adjustment factor (smooth curves)
 * 3. Edge case penalties (duty cycle extremes, thermal stress)
 * 
 * This provides smooth, continuous efficiency estimates for any valid
 * input/output combination, not just the discrete datasheet points.
 * 
 * @param input - Converter input parameters (Vin, Vout, Iout)
 * @returns Estimated efficiency as percentage (0-100)
 */
export function estimateEfficiency(input: ConverterInput): number {
  const { inputVoltage, outputVoltage, outputCurrent } = input;
  
  const dutyCycle = outputVoltage / inputVoltage;
  const voltageRatio = inputVoltage / outputVoltage;
  
  // Datasheet reference points for interpolation
  // Format: [Vin, Vout, efficiency at 3A]
  const referencePoints = [
    { vin: 12, vout: 5.0, eff: 0.73 },
    { vin: 12, vout: 3.3, eff: 0.73 },
    { vin: 25, vout: 5.0, eff: 0.90 },
  ];
  
  // Calculate base efficiency using bilinear interpolation
  let baseEfficiency: number;
  
  // For 12V input range (4.5V - 15V)
  if (inputVoltage <= 15) {
    // Datasheet shows ~73% for 12V input regardless of Vout (at 2:1+ ratio)
    // Interpolate based on voltage ratio
    if (voltageRatio >= 2.0) {
      baseEfficiency = 0.73;
    } else if (voltageRatio >= 1.5) {
      // Linear interpolation between dropout and normal operation
      const t = (voltageRatio - 1.5) / 0.5; // 0 to 1
      baseEfficiency = 0.62 + t * (0.73 - 0.62);
    } else {
      // Too close to dropout
      baseEfficiency = 0.62;
    }
  }
  // For high input range (20V+)
  else if (inputVoltage >= 20) {
    // Datasheet shows 90% for 25V→5V (5:1 ratio)
    // Interpolate based on proximity to 25V and optimal ratio
    const vinNormalized = Math.min((inputVoltage - 20) / 5, 1.0); // 0 at 20V, 1 at 25V
    
    if (voltageRatio >= 4.0 && voltageRatio <= 6.0) {
      // Optimal ratio range
      // Interpolate from 82% at 20V to 90% at 25V
      baseEfficiency = 0.82 + vinNormalized * (0.90 - 0.82);
    } else if (voltageRatio >= 3.0 && voltageRatio < 4.0) {
      // Good ratio, slightly lower efficiency
      baseEfficiency = 0.78 + vinNormalized * 0.06;
    } else if (voltageRatio >= 2.0 && voltageRatio < 3.0) {
      // Moderate ratio
      baseEfficiency = 0.75 + vinNormalized * 0.05;
    } else if (voltageRatio >= 6.0 && voltageRatio <= 8.0) {
      // High ratio, still good but declining
      baseEfficiency = 0.80 + vinNormalized * 0.05;
    } else if (voltageRatio < 2.0) {
      // Close to dropout
      baseEfficiency = 0.68 + vinNormalized * 0.05;
    } else {
      // Very high ratio (>8:1) - efficiency declines
      baseEfficiency = 0.75 + vinNormalized * 0.05;
    }
  }
  // For medium input range (15V - 20V)
  else {
    // Interpolate between low (12V) and high (25V) ranges
    const t = (inputVoltage - 15) / 5; // 0 at 15V, 1 at 20V
    
    // Get efficiency as if it were at 15V boundary
    let eff15V: number;
    if (voltageRatio >= 2.0) {
      eff15V = 0.73;
    } else if (voltageRatio >= 1.5) {
      const tRatio = (voltageRatio - 1.5) / 0.5;
      eff15V = 0.62 + tRatio * 0.11;
    } else {
      eff15V = 0.62;
    }
    
    // Get efficiency as if it were at 20V boundary
    let eff20V: number;
    if (voltageRatio >= 4.0 && voltageRatio <= 6.0) {
      eff20V = 0.82;
    } else if (voltageRatio >= 3.0 && voltageRatio < 4.0) {
      eff20V = 0.78;
    } else if (voltageRatio >= 2.0 && voltageRatio < 3.0) {
      eff20V = 0.75;
    } else if (voltageRatio >= 6.0 && voltageRatio <= 8.0) {
      eff20V = 0.80;
    } else if (voltageRatio < 2.0) {
      eff20V = 0.68;
    } else {
      eff20V = 0.75;
    }
    
    // Linear interpolation between boundaries
    baseEfficiency = eff15V + t * (eff20V - eff15V);
  }
  
  // Apply current-based efficiency factor using smooth interpolation
  const currentFactor = getCurrentEfficiencyFactor(outputCurrent);
  let efficiency = baseEfficiency * currentFactor;
  
  // Apply additional adjustments for edge cases
  
  // Penalty for very low duty cycle (< 15% - extreme ratios)
  if (dutyCycle < 0.15) {
    efficiency *= lerp(dutyCycle, 0.10, 0.15, 0.92, 1.0);
  }
  
  // Penalty for very high duty cycle (> 80%, close to dropout)
  if (dutyCycle > 0.80) {
    efficiency *= lerp(dutyCycle, 0.80, 0.95, 1.0, 0.88);
  }
  
  // Penalty for extreme voltage gaps (> 30V - severe thermal stress)
  const voltageGap = inputVoltage - outputVoltage;
  if (voltageGap > 30) {
    efficiency *= lerp(voltageGap, 30, 38, 1.0, 0.93);
  }
  
  // Cap efficiency at non-synchronous limit
  efficiency = Math.min(efficiency, LM2596_CONSTANTS.MAX_EFFICIENCY);
  
  // Floor at reasonable minimum
  efficiency = Math.max(efficiency, 0.50);
  
  return efficiency * 100; // Return as percentage
}

/**
 * Analyze if operating conditions are in the sweet spot
 * Based on datasheet efficiency curves and thermal characteristics
 */
export function analyzeSweetSpot(input: ConverterInput): SweetSpotAnalysis {
  const { inputVoltage, outputVoltage, outputCurrent } = input;
  const voltageRatio = inputVoltage / outputVoltage;
  
  // Analyze current range
  let currentRange: SweetSpotAnalysis['currentRange'];
  if (outputCurrent < LM2596_CONSTANTS.OPTIMAL_CURRENT_MIN) {
    currentRange = 'too-low';
  } else if (outputCurrent <= LM2596_CONSTANTS.OPTIMAL_CURRENT_MAX) {
    currentRange = 'optimal';
  } else {
    currentRange = 'too-high';
  }
  
  // Analyze voltage ratio (optimal: 4:1 to 6:1)
  let voltageGapRange: SweetSpotAnalysis['voltageGapRange'];
  if (voltageRatio < 1.5) {
    voltageGapRange = 'too-low';  // Too close to dropout
  } else if (voltageRatio >= 4.0 && voltageRatio <= 6.0) {
    voltageGapRange = 'optimal';  // Sweet spot (e.g., 25V→5V)
  } else if ((voltageRatio >= 2.0 && voltageRatio < 4.0) || (voltageRatio > 6.0 && voltageRatio <= 8.0)) {
    voltageGapRange = 'optimal';  // Acceptable range
  } else {
    voltageGapRange = 'too-high'; // Very high ratio (> 8:1)
  }
  
  // Calculate power loss to determine thermal status
  const outputPower = outputVoltage * outputCurrent;
  const efficiency = estimateEfficiency(input) / 100;
  const inputPower = outputPower / efficiency;
  const powerLoss = inputPower - outputPower;
  
  let thermalStatus: SweetSpotAnalysis['thermalStatus'];
  if (powerLoss < LM2596_CONSTANTS.THERMAL_COOL) {
    thermalStatus = 'cool';
  } else if (powerLoss < LM2596_CONSTANTS.THERMAL_WARM) {
    thermalStatus = 'warm';
  } else if (powerLoss < LM2596_CONSTANTS.THERMAL_HOT) {
    thermalStatus = 'hot';
  } else {
    thermalStatus = 'critical';
  }
  
  // Generate recommendation
  let recommendation = '';
  if (currentRange === 'optimal' && voltageGapRange === 'optimal') {
    recommendation = 'Operating in sweet spot - optimal efficiency and thermal performance.';
  } else {
    const issues: string[] = [];
    if (currentRange === 'too-low') {
      issues.push(`increase load current above ${LM2596_CONSTANTS.OPTIMAL_CURRENT_MIN}A for better efficiency`);
    } else if (currentRange === 'too-high') {
      issues.push(`reduce load current or add heatsink (max ${LM2596_CONSTANTS.MAX_OUTPUT_CURRENT}A)`);
    }
    
    if (voltageGapRange === 'too-low') {
      issues.push(`increase input voltage (min dropout: ${LM2596_CONSTANTS.MIN_VOLTAGE_DROPOUT}V)`);
    } else if (voltageGapRange === 'too-high') {
      issues.push('reduce voltage gap for better efficiency');
    }
    
    if (thermalStatus === 'critical') {
      issues.push('ADD HEATSINK IMMEDIATELY');
    } else if (thermalStatus === 'hot') {
      issues.push('consider adding heatsink');
    }
    
    recommendation = 'Consider: ' + issues.join(', ') + '.';
  }
  
  return {
    currentRange,
    voltageGapRange,
    thermalStatus,
    recommendation,
  };
}

/**
 * Main calculation function
 * Calculates all converter parameters and performance metrics
 */
export function calculate(input: ConverterInput): ConverterResult {
  const { inputVoltage, outputVoltage, outputCurrent } = input;
  
  // Validate inputs against datasheet specifications
  if (inputVoltage <= 0 || outputVoltage <= 0 || outputCurrent < 0) {
    throw new Error('Invalid input: voltages must be positive, current must be non-negative');
  }
  
  if (inputVoltage > LM2596_CONSTANTS.MAX_INPUT_VOLTAGE) {
    throw new Error(`Input voltage exceeds maximum (${LM2596_CONSTANTS.MAX_INPUT_VOLTAGE}V)`);
  }
  
  if (outputVoltage < LM2596_CONSTANTS.MIN_OUTPUT_VOLTAGE) {
    throw new Error(`Output voltage below minimum (${LM2596_CONSTANTS.MIN_OUTPUT_VOLTAGE}V)`);
  }
  
  if (outputVoltage > LM2596_CONSTANTS.MAX_OUTPUT_VOLTAGE) {
    throw new Error(`Output voltage exceeds maximum (${LM2596_CONSTANTS.MAX_OUTPUT_VOLTAGE}V)`);
  }
  
  if (outputCurrent > LM2596_CONSTANTS.MAX_OUTPUT_CURRENT) {
    throw new Error(`Output current exceeds maximum (${LM2596_CONSTANTS.MAX_OUTPUT_CURRENT}A)`);
  }
  
  if (outputVoltage >= inputVoltage) {
    throw new Error('Invalid input: output voltage must be less than input voltage for buck converter');
  }
  
  // Check minimum voltage dropout (datasheet requirement: Vin >= Vout + 1.5V)
  const voltageDropout = inputVoltage - outputVoltage;
  if (voltageDropout < LM2596_CONSTANTS.MIN_VOLTAGE_DROPOUT) {
    throw new Error(`Insufficient voltage dropout: input must be at least ${LM2596_CONSTANTS.MIN_VOLTAGE_DROPOUT}V higher than output`);
  }
  
  // Basic calculations
  const outputPower = outputVoltage * outputCurrent;
  const dutyCycle = calculateDutyCycle(inputVoltage, outputVoltage);
  const efficiency = estimateEfficiency(input);
  const inputPower = outputPower / (efficiency / 100);
  const powerLoss = inputPower - outputPower;
  const inputCurrent = inputPower / inputVoltage;
  
  // Sweet spot analysis
  const sweetSpotAnalysis = analyzeSweetSpot(input);
  const isInSweetSpot = 
    sweetSpotAnalysis.currentRange === 'optimal' &&
    sweetSpotAnalysis.voltageGapRange === 'optimal';
  
  return {
    outputPower,
    dutyCycle,
    efficiency,
    inputPower,
    powerLoss,
    inputCurrent,
    isInSweetSpot,
    sweetSpotAnalysis,
  };
}
