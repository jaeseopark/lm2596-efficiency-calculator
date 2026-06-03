/**
 * Results Display Component
 */

import { calculate } from '@core/calculator';
import type { ConverterInput } from '@core/types';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  input: ConverterInput;
}

export function ResultsDisplay({ input }: ResultsDisplayProps) {
  let result;
  let error: string | null = null;

  try {
    result = calculate(input);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  }

  if (error || !result) {
    return (
      <div className="results-display error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const statusColor = result.isInSweetSpot ? '#10b981' : '#f59e0b';
  const thermalColor = 
    result.sweetSpotAnalysis.thermalStatus === 'cool' ? '#10b981' :
    result.sweetSpotAnalysis.thermalStatus === 'warm' ? '#f59e0b' :
    result.sweetSpotAnalysis.thermalStatus === 'hot' ? '#ef4444' : '#dc2626';

  return (
    <div className="results-display">
      <h2>Current Operating Point</h2>
      
      <div className="metrics-grid">
        <div className="metric">
          <div className="metric-label">Output Power</div>
          <div className="metric-value">{result.outputPower.toFixed(2)} W</div>
        </div>
        
        <div className="metric">
          <div className="metric-label">Efficiency</div>
          <div className="metric-value">{result.efficiency.toFixed(1)}%</div>
        </div>
        
        <div className="metric">
          <div className="metric-label">Power Loss</div>
          <div className="metric-value" style={{ color: thermalColor }}>
            {result.powerLoss.toFixed(2)} W
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-label">Status</div>
          <div className="metric-value status" style={{ color: statusColor }}>
            {result.isInSweetSpot ? '✓ Sweet Spot' : '⚠ Out of Range'}
          </div>
        </div>
      </div>

      <div className="additional-metrics">
        <div className="metric-row">
          <span>Duty Cycle:</span>
          <span>{result.dutyCycle.toFixed(1)}%</span>
        </div>
        <div className="metric-row">
          <span>Input Power:</span>
          <span>{result.inputPower.toFixed(2)} W</span>
        </div>
        <div className="metric-row">
          <span>Input Current:</span>
          <span>{result.inputCurrent.toFixed(3)} A</span>
        </div>
      </div>

      <div className="recommendation" style={{ borderLeftColor: statusColor }}>
        <div className="recommendation-label">Recommendation:</div>
        <div className="recommendation-text">{result.sweetSpotAnalysis.recommendation}</div>
      </div>
    </div>
  );
}
