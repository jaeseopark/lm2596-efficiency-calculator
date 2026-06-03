/**
 * Calculator Controls Component
 */

import type { ConverterInput } from '@core/types';
import './CalculatorControls.css';

interface CalculatorControlsProps {
  input: ConverterInput;
  onChange: (field: keyof ConverterInput, value: number) => void;
}

export function CalculatorControls({ input, onChange }: CalculatorControlsProps) {
  return (
    <div className="calculator-controls">
      <div className="control-group">
        <label htmlFor="inputV">
          Input Voltage (V):
          <span className="control-value">{input.inputVoltage.toFixed(1)} V</span>
        </label>
        <input
          id="inputV"
          type="range"
          min="4.5"
          max="40"
          step="0.5"
          value={input.inputVoltage}
          onChange={(e) => onChange('inputVoltage', parseFloat(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label htmlFor="outputV">
          Output Voltage (V):
          <span className="control-value">{input.outputVoltage.toFixed(1)} V</span>
        </label>
        <input
          id="outputV"
          type="range"
          min="1.2"
          max="37"
          step="0.1"
          value={input.outputVoltage}
          onChange={(e) => onChange('outputVoltage', parseFloat(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label htmlFor="outputA">
          Output Current (A):
          <span className="control-value">{input.outputCurrent.toFixed(1)} A</span>
        </label>
        <input
          id="outputA"
          type="range"
          min="0.1"
          max="3.0"
          step="0.1"
          value={input.outputCurrent}
          onChange={(e) => onChange('outputCurrent', parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
