/**
 * Power Loss Chart Component (React + D3)
 */

import { useEffect, useRef } from 'react';
import { createPowerLossVsCurrentChart } from '@d3-app/charts';
import * as d3 from 'd3';
import { calculate } from '@core/calculator';
import type { ConverterInput } from '@core/types';
import './Chart.css';

interface PowerLossChartProps {
  inputVoltage: number;
  outputVoltage: number;
  currentPoint: number;
}

export function PowerLossChart({ inputVoltage, outputVoltage, currentPoint }: PowerLossChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the chart
    createPowerLossVsCurrentChart(containerRef.current, inputVoltage, outputVoltage);

    // Add current point marker
    const input: ConverterInput = { inputVoltage, outputVoltage, outputCurrent: currentPoint };
    const result = calculate(input);

    // Calculate scales (same as in charts.ts)
    const dataPoints: Array<{ x: number; y: number }> = [];
    for (let current = 0.1; current <= 3.0; current += 0.1) {
      try {
        const inp: ConverterInput = { inputVoltage, outputVoltage, outputCurrent: current };
        const res = calculate(inp);
        dataPoints.push({ x: current, y: res.powerLoss });
      } catch (e) {
        // Skip
      }
    }

    const maxY = d3.max(dataPoints, d => d.y) ?? 5;

    const svg = d3.select(containerRef.current).select('svg');
    const marginLeft = 60;
    const marginTop = 40;
    const marginBottom = 50;
    const marginRight = 30;
    const width = 600;
    const height = 400;

    const xScale = d3.scaleLinear().domain([0, 3]).range([marginLeft, width - marginRight]);
    const yScale = d3.scaleLinear().domain([0, Math.ceil(maxY)]).range([height - marginBottom, marginTop]);

    svg.append('circle')
      .attr('cx', xScale(currentPoint))
      .attr('cy', yScale(result.powerLoss))
      .attr('r', 5)
      .attr('fill', '#dc2626')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);
  }, [inputVoltage, outputVoltage, currentPoint]);

  return (
    <div className="chart-container">
      <div ref={containerRef}></div>
    </div>
  );
}
