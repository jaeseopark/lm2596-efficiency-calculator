/**
 * Efficiency Chart Component (React + D3)
 */

import { useEffect, useRef } from 'react';
import { createEfficiencyVsCurrentChart } from '@d3-app/charts';
import * as d3 from 'd3';
import { calculate } from '@core/calculator';
import type { ConverterInput } from '@core/types';
import './Chart.css';

interface EfficiencyChartProps {
  inputVoltage: number;
  outputVoltage: number;
  currentPoint: number;
}

export function EfficiencyChart({ inputVoltage, outputVoltage, currentPoint }: EfficiencyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the chart
    createEfficiencyVsCurrentChart(containerRef.current, inputVoltage, outputVoltage);

    // Add current point marker
    const input: ConverterInput = { inputVoltage, outputVoltage, outputCurrent: currentPoint };
    const result = calculate(input);

    const svg = d3.select(containerRef.current).select('svg');
    const marginLeft = 60;
    const marginTop = 40;
    const marginBottom = 50;
    const marginRight = 30;
    const width = 600;
    const height = 400;

    const xScale = d3.scaleLinear().domain([0, 3]).range([marginLeft, width - marginRight]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height - marginBottom, marginTop]);

    svg.append('circle')
      .attr('cx', xScale(currentPoint))
      .attr('cy', yScale(result.efficiency))
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
