/**
 * React + D3 Implementation
 * Main App Component
 */

import { useState } from 'react';
import { CalculatorControls } from './components/CalculatorControls';
import { ResultsDisplay } from './components/ResultsDisplay';
import { EfficiencyChart } from './components/EfficiencyChart';
import { PowerLossChart } from './components/PowerLossChart';
import type { ConverterInput } from '@core/types';
import './App.css';

function App() {
  const [input, setInput] = useState<ConverterInput>({
    inputVoltage: 12,
    outputVoltage: 5,
    outputCurrent: 1.2,
  });

  const handleInputChange = (field: keyof ConverterInput, value: number) => {
    setInput(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>LM2596 Buck Converter Analyzer</h1>
        <p className="subtitle">React + D3 Interactive Efficiency Calculator</p>
      </header>

      <div className="app-container">
        <CalculatorControls input={input} onChange={handleInputChange} />
        <ResultsDisplay input={input} />
        
        <div className="charts-grid">
          <EfficiencyChart 
            inputVoltage={input.inputVoltage}
            outputVoltage={input.outputVoltage}
            currentPoint={input.outputCurrent}
          />
          <PowerLossChart 
            inputVoltage={input.inputVoltage}
            outputVoltage={input.outputVoltage}
            currentPoint={input.outputCurrent}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
