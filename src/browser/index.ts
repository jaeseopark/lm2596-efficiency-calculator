/**
 * Browser-friendly exports for headless usage in <script> tags
 * 
 * Usage Option 1: Direct function calls
 * ```html
 * <script src="dist/browser.umd.js"></script>
 * <script>
 *   const result = LM2596Calculator.calculate({
 *     inputVoltage: 12,
 *     outputVoltage: 5,
 *     outputCurrent: 1.2
 *   });
 *   console.log(result);
 * </script>
 * ```
 * 
 * Usage Option 2: DOM element binding
 * ```html
 * <input id="inputV" type="number" value="12" />
 * <input id="outputV" type="number" value="5" />
 * <input id="outputA" type="number" value="1.2" />
 * <textarea id="result"></textarea>
 * <script src="dist/browser.umd.js"></script>
 * <script>
 *   LM2596Calculator.bindToElements({
 *     inputVoltageId: 'inputV',
 *     outputVoltageId: 'outputV',
 *     outputCurrentId: 'outputA',
 *     resultId: 'result',
 *     resultProperty: 'value'
 *   });
 * </script>
 * ```
 */

import { calculate } from '@core/calculator';
import type { ConverterInput, ConverterResult } from '@core/types';

// Re-export core functions for direct usage
export { calculate, calculateDutyCycle, estimateEfficiency, analyzeSweetSpot } from '@core/calculator';
export { LM2596_CONSTANTS } from '@core/types';
export type { ConverterInput, ConverterResult, SweetSpotAnalysis } from '@core/types';

/**
 * Configuration for binding calculator to DOM elements
 */
export interface DOMBindingConfig {
  inputVoltageId: string;
  outputVoltageId: string;
  outputCurrentId: string;
  resultId: string;
  resultProperty?: 'value' | 'textContent' | 'innerHTML';
  formatFunction?: (result: ConverterResult) => string;
  autoUpdate?: boolean; // Auto-update on input change
}

/**
 * Get a DOM element by ID with type checking
 */
function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element as T;
}

/**
 * Get numeric value from an input element
 */
function getNumericValue(element: HTMLElement): number {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return parseFloat(element.value) || 0;
  }
  const textContent = element.textContent || '0';
  return parseFloat(textContent) || 0;
}

/**
 * Default result formatter
 */
function defaultFormatter(result: ConverterResult): string {
  return `
LM2596 Buck Converter Results
=============================

Input Parameters:
  Input Voltage: ${result.inputPower / result.inputCurrent}V
  Input Current: ${result.inputCurrent.toFixed(3)}A
  Input Power: ${result.inputPower.toFixed(2)}W

Output Parameters:
  Output Power: ${result.outputPower.toFixed(2)}W

Performance:
  Duty Cycle: ${result.dutyCycle.toFixed(1)}%
  Efficiency: ${result.efficiency.toFixed(1)}%
  Power Loss: ${result.powerLoss.toFixed(2)}W

Status:
  In Sweet Spot: ${result.isInSweetSpot ? 'YES' : 'NO'}
  Current Range: ${result.sweetSpotAnalysis.currentRange}
  Voltage Gap: ${result.sweetSpotAnalysis.voltageGapRange}
  Thermal Status: ${result.sweetSpotAnalysis.thermalStatus}
  
Recommendation:
  ${result.sweetSpotAnalysis.recommendation}
`.trim();
}

/**
 * Update result in DOM element
 */
function updateResult(
  resultElement: HTMLElement,
  result: ConverterResult,
  property: DOMBindingConfig['resultProperty'] = 'textContent',
  formatter: (result: ConverterResult) => string = defaultFormatter
): void {
  const formattedResult = formatter(result);
  
  if (property === 'value' && (resultElement instanceof HTMLInputElement || resultElement instanceof HTMLTextAreaElement)) {
    resultElement.value = formattedResult;
  } else if (property === 'innerHTML') {
    resultElement.innerHTML = formattedResult;
  } else {
    resultElement.textContent = formattedResult;
  }
}

/**
 * Bind calculator to DOM elements
 * Returns a cleanup function to remove event listeners
 */
export function bindToElements(config: DOMBindingConfig): () => void {
  const {
    inputVoltageId,
    outputVoltageId,
    outputCurrentId,
    resultId,
    resultProperty = 'textContent',
    formatFunction = defaultFormatter,
    autoUpdate = true,
  } = config;

  const inputVoltageEl = getElement(inputVoltageId);
  const outputVoltageEl = getElement(outputVoltageId);
  const outputCurrentEl = getElement(outputCurrentId);
  const resultEl = getElement(resultId);

  const updateCalculation = (): void => {
    try {
      const input: ConverterInput = {
        inputVoltage: getNumericValue(inputVoltageEl),
        outputVoltage: getNumericValue(outputVoltageEl),
        outputCurrent: getNumericValue(outputCurrentEl),
      };

      const result = calculate(input);
      updateResult(resultEl, result, resultProperty, formatFunction);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (resultProperty === 'value' && (resultEl instanceof HTMLInputElement || resultEl instanceof HTMLTextAreaElement)) {
        resultEl.value = `Error: ${errorMessage}`;
      } else {
        resultEl.textContent = `Error: ${errorMessage}`;
      }
    }
  };

  // Initial calculation
  updateCalculation();

  // Setup auto-update if enabled
  const listeners: [HTMLElement, string, EventListener][] = [];
  
  if (autoUpdate) {
    const elements = [inputVoltageEl, outputVoltageEl, outputCurrentEl];
    elements.forEach(el => {
      const listener = (): void => updateCalculation();
      el.addEventListener('input', listener);
      el.addEventListener('change', listener);
      listeners.push([el, 'input', listener]);
      listeners.push([el, 'change', listener]);
    });
  }

  // Return cleanup function
  return () => {
    listeners.forEach(([el, event, listener]) => {
      el.removeEventListener(event, listener);
    });
  };
}

/**
 * Calculate and return result as JSON string
 * Useful for simple script integration
 */
export function calculateToJSON(
  inputVoltage: number,
  outputVoltage: number,
  outputCurrent: number
): string {
  const input: ConverterInput = { inputVoltage, outputVoltage, outputCurrent };
  const result = calculate(input);
  return JSON.stringify(result, null, 2);
}

// Make available on window object for UMD build
if (typeof window !== 'undefined') {
  (window as any).LM2596Calculator = {
    calculate,
    bindToElements,
    calculateToJSON,
  };
}
