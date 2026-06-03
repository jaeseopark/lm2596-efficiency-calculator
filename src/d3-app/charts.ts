/**
 * D3 visualization components for LM2596 efficiency calculator
 */

import * as d3 from 'd3';
import type { ConverterInput } from '@core/types';
import { calculate } from '@core/calculator';

export interface ChartDimensions {
  width: number;
  height: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
}

export interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

/**
 * Create efficiency vs current chart
 */
export function createEfficiencyVsCurrentChart(
  container: HTMLElement,
  inputVoltage: number,
  outputVoltage: number,
  dimensions: Partial<ChartDimensions> = {}
): void {
  const {
    width = 600,
    height = 400,
    marginTop = 40,
    marginRight = 30,
    marginBottom = 50,
    marginLeft = 60,
  } = dimensions;

  // Clear existing chart
  d3.select(container).selectAll('*').remove();

  // Generate data points for current from 0.1A to 3A
  const dataPoints: DataPoint[] = [];
  for (let current = 0.1; current <= 3.0; current += 0.1) {
    try {
      const input: ConverterInput = { inputVoltage, outputVoltage, outputCurrent: current };
      const result = calculate(input);
      dataPoints.push({ x: current, y: result.efficiency });
    } catch (e) {
      // Skip invalid points
    }
  }

  // Create SVG
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto;');

  // Create scales
  const xScale = d3
    .scaleLinear()
    .domain([0, 3])
    .range([marginLeft, width - marginRight]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - marginBottom, marginTop]);

  // Create axes
  const xAxis = d3.axisBottom(xScale).ticks(10);
  const yAxis = d3.axisLeft(yScale).ticks(10);

  svg
    .append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(xAxis)
    .append('text')
    .attr('x', width / 2)
    .attr('y', 35)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .text('Output Current (A)');

  svg
    .append('g')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(height / 2))
    .attr('y', -45)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .text('Efficiency (%)');

  // Add title
  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', '16px')
    .attr('font-weight', 'bold')
    .text(`Efficiency vs Current (${inputVoltage}V → ${outputVoltage}V)`);

  // Create line generator
  const line = d3
    .line<DataPoint>()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);

  // Draw line
  svg
    .append('path')
    .datum(dataPoints)
    .attr('fill', 'none')
    .attr('stroke', '#2563eb')
    .attr('stroke-width', 2.5)
    .attr('d', line);

  // Add sweet spot region (0.5A to 1.5A)
  svg
    .append('rect')
    .attr('x', xScale(0.5))
    .attr('y', marginTop)
    .attr('width', xScale(1.5) - xScale(0.5))
    .attr('height', height - marginTop - marginBottom)
    .attr('fill', '#10b981')
    .attr('opacity', 0.1);

  // Add sweet spot label
  svg
    .append('text')
    .attr('x', xScale(1.0))
    .attr('y', marginTop + 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#059669')
    .text('Sweet Spot');
}

/**
 * Create power loss vs current chart
 */
export function createPowerLossVsCurrentChart(
  container: HTMLElement,
  inputVoltage: number,
  outputVoltage: number,
  dimensions: Partial<ChartDimensions> = {}
): void {
  const {
    width = 600,
    height = 400,
    marginTop = 40,
    marginRight = 30,
    marginBottom = 50,
    marginLeft = 60,
  } = dimensions;

  // Clear existing chart
  d3.select(container).selectAll('*').remove();

  // Generate data points
  const dataPoints: DataPoint[] = [];
  for (let current = 0.1; current <= 3.0; current += 0.1) {
    try {
      const input: ConverterInput = { inputVoltage, outputVoltage, outputCurrent: current };
      const result = calculate(input);
      dataPoints.push({ x: current, y: result.powerLoss });
    } catch (e) {
      // Skip invalid points
    }
  }

  // Create SVG
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto;');

  // Create scales
  const xScale = d3
    .scaleLinear()
    .domain([0, 3])
    .range([marginLeft, width - marginRight]);

  const maxY = d3.max(dataPoints, d => d.y) ?? 5;
  const yScale = d3
    .scaleLinear()
    .domain([0, Math.ceil(maxY)])
    .range([height - marginBottom, marginTop]);

  // Create axes
  const xAxis = d3.axisBottom(xScale).ticks(10);
  const yAxis = d3.axisLeft(yScale).ticks(10);

  svg
    .append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(xAxis)
    .append('text')
    .attr('x', width / 2)
    .attr('y', 35)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .text('Output Current (A)');

  svg
    .append('g')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(height / 2))
    .attr('y', -45)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .text('Power Loss (W)');

  // Add title
  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', '16px')
    .attr('font-weight', 'bold')
    .text(`Power Loss vs Current (${inputVoltage}V → ${outputVoltage}V)`);

  // Create line generator
  const line = d3
    .line<DataPoint>()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);

  // Draw line
  svg
    .append('path')
    .datum(dataPoints)
    .attr('fill', 'none')
    .attr('stroke', '#dc2626')
    .attr('stroke-width', 2.5)
    .attr('d', line);

  // Add thermal threshold lines
  const thresholds = [
    { value: 0.5, label: 'Cool', color: '#10b981' },
    { value: 1.0, label: 'Warm', color: '#f59e0b' },
    { value: 1.5, label: 'Hot', color: '#ef4444' },
  ];

  thresholds.forEach(threshold => {
    if (threshold.value <= maxY) {
      svg
        .append('line')
        .attr('x1', marginLeft)
        .attr('x2', width - marginRight)
        .attr('y1', yScale(threshold.value))
        .attr('y2', yScale(threshold.value))
        .attr('stroke', threshold.color)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.5);

      svg
        .append('text')
        .attr('x', width - marginRight - 5)
        .attr('y', yScale(threshold.value) - 5)
        .attr('text-anchor', 'end')
        .attr('font-size', '10px')
        .attr('fill', threshold.color)
        .text(threshold.label);
    }
  });
}

/**
 * Create real-time updating display
 */
export class RealtimeDisplay {
  private container: HTMLElement;
  private inputVoltage: number;
  private outputVoltage: number;
  private outputCurrent: number;
  private efficiencyChart: HTMLElement | null = null;
  private powerLossChart: HTMLElement | null = null;
  private resultDisplay: HTMLElement | null = null;

  constructor(container: HTMLElement, inputVoltage: number, outputVoltage: number, outputCurrent: number) {
    this.container = container;
    this.inputVoltage = inputVoltage;
    this.outputVoltage = outputVoltage;
    this.outputCurrent = outputCurrent;
    this.init();
  }

  private init(): void {
    this.container.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
        <div id="result-display" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
        <div id="efficiency-chart" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
        <div id="power-loss-chart" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
      </div>
    `;

    this.resultDisplay = document.getElementById('result-display');
    this.efficiencyChart = document.getElementById('efficiency-chart');
    this.powerLossChart = document.getElementById('power-loss-chart');

    this.update();
  }

  update(): void {
    const input: ConverterInput = {
      inputVoltage: this.inputVoltage,
      outputVoltage: this.outputVoltage,
      outputCurrent: this.outputCurrent,
    };

    const result = calculate(input);

    // Update result display
    if (this.resultDisplay) {
      const statusColor = result.isInSweetSpot ? '#10b981' : '#f59e0b';
      const thermalColor = 
        result.sweetSpotAnalysis.thermalStatus === 'cool' ? '#10b981' :
        result.sweetSpotAnalysis.thermalStatus === 'warm' ? '#f59e0b' :
        result.sweetSpotAnalysis.thermalStatus === 'hot' ? '#ef4444' : '#dc2626';

      this.resultDisplay.innerHTML = `
        <h2 style="margin-top: 0;">Current Operating Point</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 12px; color: #666;">Output Power</div>
            <div style="font-size: 24px; font-weight: bold;">${result.outputPower.toFixed(2)} W</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666;">Efficiency</div>
            <div style="font-size: 24px; font-weight: bold;">${result.efficiency.toFixed(1)}%</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666;">Power Loss</div>
            <div style="font-size: 24px; font-weight: bold; color: ${thermalColor};">${result.powerLoss.toFixed(2)} W</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666;">Status</div>
            <div style="font-size: 16px; font-weight: bold; color: ${statusColor};">${result.isInSweetSpot ? '✓ Sweet Spot' : '⚠ Out of Range'}</div>
          </div>
        </div>
        <div style="padding: 15px; background: #f9fafb; border-radius: 4px; border-left: 4px solid ${statusColor};">
          <div style="font-weight: 600; margin-bottom: 5px;">Recommendation:</div>
          <div style="color: #374151;">${result.sweetSpotAnalysis.recommendation}</div>
        </div>
      `;
    }

    // Update charts
    if (this.efficiencyChart) {
      createEfficiencyVsCurrentChart(this.efficiencyChart, this.inputVoltage, this.outputVoltage);
      
      // Add current point marker
      const svg = d3.select(this.efficiencyChart).select('svg');
      const marginLeft = 60;
      const marginTop = 40;
      const marginBottom = 50;
      const marginRight = 30;
      const width = 600;
      const height = 400;
      
      const xScale = d3.scaleLinear().domain([0, 3]).range([marginLeft, width - marginRight]);
      const yScale = d3.scaleLinear().domain([0, 100]).range([height - marginBottom, marginTop]);
      
      svg.append('circle')
        .attr('cx', xScale(this.outputCurrent))
        .attr('cy', yScale(result.efficiency))
        .attr('r', 5)
        .attr('fill', '#dc2626')
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    }

    if (this.powerLossChart) {
      createPowerLossVsCurrentChart(this.powerLossChart, this.inputVoltage, this.outputVoltage);
      
      // Add current point marker
      const svg = d3.select(this.powerLossChart).select('svg');
      const marginLeft = 60;
      const marginTop = 40;
      const marginBottom = 50;
      const marginRight = 30;
      const width = 600;
      const height = 400;
      
      const dataPoints: DataPoint[] = [];
      for (let current = 0.1; current <= 3.0; current += 0.1) {
        try {
          const inp: ConverterInput = { 
            inputVoltage: this.inputVoltage, 
            outputVoltage: this.outputVoltage, 
            outputCurrent: current 
          };
          const res = calculate(inp);
          dataPoints.push({ x: current, y: res.powerLoss });
        } catch (e) {
          // Skip
        }
      }
      
      const maxY = d3.max(dataPoints, d => d.y) ?? 5;
      const xScale = d3.scaleLinear().domain([0, 3]).range([marginLeft, width - marginRight]);
      const yScale = d3.scaleLinear().domain([0, Math.ceil(maxY)]).range([height - marginBottom, marginTop]);
      
      svg.append('circle')
        .attr('cx', xScale(this.outputCurrent))
        .attr('cy', yScale(result.powerLoss))
        .attr('r', 5)
        .attr('fill', '#dc2626')
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    }
  }

  setInputVoltage(voltage: number): void {
    this.inputVoltage = voltage;
    this.update();
  }

  setOutputVoltage(voltage: number): void {
    this.outputVoltage = voltage;
    this.update();
  }

  setOutputCurrent(current: number): void {
    this.outputCurrent = current;
    this.update();
  }
}
