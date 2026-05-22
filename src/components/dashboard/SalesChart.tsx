/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Card from '../ui/Card';
import SectionTitle from '../common/SectionTitle';
import { DailySalesData } from '../../services/reports.service';
import { formatCurrency } from '../../utils/helpers';
import { Calendar } from 'lucide-react';

export interface SalesChartProps {
  data: DailySalesData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  // Safe empty state check
  if (data.length === 0) {
    return (
      <Card className="h-[300px] flex flex-col justify-center items-center text-zinc-400 select-none rounded-none border border-editorial-charcoal/15">
        <Calendar className="h-8 w-8 mb-2 opacity-50 text-editorial-gold" />
        <span className="text-[10px] uppercase tracking-widest font-bold">No sales records recorded yet</span>
        <span className="text-[11px] font-serif italic text-zinc-400 mt-0.5">Complete a POS checkout to populate charts.</span>
      </Card>
    );
  }

  // Find max value to calibrate height scales
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);
  
  // Layout coordinates for SVG plotting
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, data: d };
  });

  // Compile path strings
  let linePath = '';
  let areaPath = '';
  
  if (points.length > 0) {
    // 1. Plot straight line path
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    
    // 2. Plot closed area path for gradients
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }

  return (
    <Card className="flex flex-col gap-6 rounded-none p-6">
      <div className="flex justify-between items-center border-b border-editorial-charcoal/10 dark:border-white/10 pb-4">
        <SectionTitle title="Daily Revenue Trends" subtitle="Overview of retail sales performance" />
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-editorial-gold font-bold select-none bg-editorial-gold/5 px-2.5 py-1.5 border border-[#C68E5A]/20">
          Latest {data.length} Days
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Responsive standard SVG canvas */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto text-editorial-gold select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft gold glowing gradient */}
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const h = height - paddingY - ratio * chartHeight;
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={h}
                x2={width - paddingX}
                y2={h}
                stroke="currentColor"
                strokeOpacity="0.05"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area under curve fill */}
          {areaPath && <path d={areaPath} fill="url(#chartAreaGrad)" />}

          {/* Main trend line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          )}

          {/* Hover nodes with values */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <rect
                x={p.x - 2.5}
                y={p.y - 2.5}
                width="5"
                height="5"
                className="fill-white dark:fill-zinc-900 stroke-editorial-gold"
                strokeWidth="1.5"
              />
              {/* Invisible touch focus node */}
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
            </g>
          ))}

          {/* Bottom Date stamps */}
          {points.map((p, idx) => {
            const drawLabel = idx === 0 || idx === points.length - 1 || (points.length >= 5 && idx === Math.floor(points.length / 2));
            if (!drawLabel) return null;
            
            const parts = p.data.date.split('-');
            const shortStr = parts[1] && parts[2] ? `${parts[1]}/${parts[2]}` : p.data.date;
            
            return (
              <text
                key={idx}
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                className="fill-zinc-400 dark:fill-zinc-500 font-mono tracking-wider"
              >
                {shortStr}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Tiny descriptive legend */}
      <div className="flex justify-between items-center text-[10px] font-bold font-mono border-t border-editorial-charcoal/10 dark:border-white/10 pt-4 select-none text-zinc-400">
        <span>MIN: $0.00</span>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-none bg-editorial-gold" />
            <span className="text-zinc-500 font-sans tracking-wide">RETAIL REVENUE</span>
          </div>
        </div>
        <span>MAX: {formatCurrency(maxRevenue)}</span>
      </div>
    </Card>
  );
};

export default SalesChart;
