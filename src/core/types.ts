/**
 * LM2596 Buck Converter Efficiency Calculator
 * 
 * Core types and interfaces for the calculator
 */

export interface ConverterInput {
  inputVoltage: number;    // Volts (V)
  outputVoltage: number;   // Volts (V)
  outputCurrent: number;   // Amperes (A)
}

export interface ConverterResult {
  outputPower: number;      // Watts (W)
  dutyCycle: number;        // Percentage (0-100)
  efficiency: number;       // Percentage (0-100)
  inputPower: number;       // Watts (W)
  powerLoss: number;        // Watts (W)
  inputCurrent: number;     // Amperes (A)
  isInSweetSpot: boolean;   // Operating in optimal range
  sweetSpotAnalysis: SweetSpotAnalysis;
}

export interface SweetSpotAnalysis {
  currentRange: 'too-low' | 'optimal' | 'too-high';
  voltageGapRange: 'too-low' | 'optimal' | 'too-high';
  thermalStatus: 'cool' | 'warm' | 'hot' | 'critical';
  recommendation: string;
}

/**
 * Constants for LM2596 characteristics
 * Source: LM2596 Datasheet (Texas Instruments, SNVS124G)
 */
export const LM2596_CONSTANTS = {
  // Voltage ranges (from datasheet)
  MIN_INPUT_VOLTAGE: 4.5,     // V (Vout + 1.5V minimum)
  MAX_INPUT_VOLTAGE: 40.0,    // V (absolute maximum)
  MIN_OUTPUT_VOLTAGE: 1.2,    // V (adjustable version)
  MAX_OUTPUT_VOLTAGE: 37.0,   // V (adjustable version, Vin - 1.5V max)
  MIN_VOLTAGE_DROPOUT: 1.5,   // V (Vin must be at least Vout + 1.5V)
  
  // Current ranges (from datasheet)
  MAX_OUTPUT_CURRENT: 3.0,    // A (continuous with adequate heatsinking)
  MIN_LOAD_CURRENT: 0.1,      // A (typical minimum for proper regulation)
  OPTIMAL_CURRENT_MIN: 0.5,   // A (good efficiency range)
  OPTIMAL_CURRENT_MAX: 2.0,   // A (good efficiency range)
  
  // Fixed output voltage options (from datasheet)
  FIXED_OUTPUT_3V3: 3.3,      // V
  FIXED_OUTPUT_5V: 5.0,       // V
  FIXED_OUTPUT_12V: 12.0,     // V
  OUTPUT_VOLTAGE_TOLERANCE: 0.04, // ±4% over line and load
  
  // Efficiency data points from datasheet
  // Non-synchronous topology limits max efficiency to ~92%
  MAX_EFFICIENCY: 0.92,           // 92% (theoretical non-synchronous limit)
  EFFICIENCY_12V_5V_3A: 0.73,     // 73% at 12V→5V @ 3A (datasheet)
  EFFICIENCY_12V_3V3_3A: 0.73,    // 73% at 12V→3.3V @ 3A (datasheet)
  EFFICIENCY_25V_5V_3A: 0.90,     // 90% at 25V→5V @ 3A (datasheet)
  
  // Thermal thresholds
  THERMAL_COOL: 1.0,      // W - No heatsink needed
  THERMAL_WARM: 2.0,      // W - Warm to touch
  THERMAL_HOT: 3.0,       // W - Hot, consider heatsink
  THERMAL_CRITICAL: 4.0,  // W - Heatsink required
  
  // Operating characteristics
  SWITCHING_FREQUENCY: 150000,  // 150 kHz (fixed)
  QUIESCENT_CURRENT: 0.00008,   // 80 μA typical (shutdown mode)
} as const;
