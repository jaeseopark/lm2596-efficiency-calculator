/**
 * LM2596 Buck Converter Efficiency Calculator
 * Core module exports
 */

export { calculate, calculateDutyCycle, estimateEfficiency, analyzeSweetSpot } from './calculator';
export { LM2596_CONSTANTS } from './types';
export type { ConverterInput, ConverterResult, SweetSpotAnalysis } from './types';
