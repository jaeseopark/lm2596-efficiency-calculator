/**
 * D3 Visualization App Entry Point
 */

import './style.css';
import { RealtimeDisplay } from './charts';

// Initialize the app
const appElement = document.querySelector<HTMLDivElement>('#app');

if (!appElement) {
  throw new Error('App element not found');
}

// Create input controls
const controlsHTML = `
  <div class="controls">
    <h1>LM2596 Buck Converter Analyzer</h1>
    <p class="subtitle">Interactive efficiency and thermal analysis with real-time D3 charts</p>
    
    <div class="input-group">
      <label for="inputV">Input Voltage (V):</label>
      <input id="inputV" type="range" min="4.5" max="40" step="0.5" value="12">
      <span id="inputV-value">12.0 V</span>
    </div>
    
    <div class="input-group">
      <label for="outputV">Output Voltage (V):</label>
      <input id="outputV" type="range" min="1.2" max="37" step="0.1" value="5">
      <span id="outputV-value">5.0 V</span>
    </div>
    
    <div class="input-group">
      <label for="outputA">Output Current (A):</label>
      <input id="outputA" type="range" min="0.1" max="3.0" step="0.1" value="1.2">
      <span id="outputA-value">1.2 A</span>
    </div>
  </div>
  
  <div id="display-container"></div>
`;

appElement.innerHTML = controlsHTML;

// Get elements
const inputVEl = document.getElementById('inputV') as HTMLInputElement;
const outputVEl = document.getElementById('outputV') as HTMLInputElement;
const outputAEl = document.getElementById('outputA') as HTMLInputElement;
const displayContainer = document.getElementById('display-container') as HTMLElement;

const inputVValue = document.getElementById('inputV-value') as HTMLElement;
const outputVValue = document.getElementById('outputV-value') as HTMLElement;
const outputAValue = document.getElementById('outputA-value') as HTMLElement;

// Create display
const display = new RealtimeDisplay(
  displayContainer,
  parseFloat(inputVEl.value),
  parseFloat(outputVEl.value),
  parseFloat(outputAEl.value)
);

// Setup event listeners
inputVEl.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  inputVValue.textContent = `${value.toFixed(1)} V`;
  display.setInputVoltage(value);
});

outputVEl.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  outputVValue.textContent = `${value.toFixed(1)} V`;
  display.setOutputVoltage(value);
});

outputAEl.addEventListener('input', (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  outputAValue.textContent = `${value.toFixed(1)} A`;
  display.setOutputCurrent(value);
});
