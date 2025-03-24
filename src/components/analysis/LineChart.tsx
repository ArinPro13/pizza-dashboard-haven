
import React from "react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  [key: string]: any;
}

interface LineProps {
  dataKey: string;
  stroke?: string;
  strokeWidth?: number;
}

interface LineChartProps {
  data: DataPoint[];
  lines: LineProps[];
  xAxisDataKey: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number, name: string) => [string, string];
  className?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  xAxisDataKey,
  yAxisFormatter = (value) => `${value}`,
  tooltipFormatter,
  className,
  height = 300,
}) => {
  const defaultColors = [
    "hsl(var(--primary))",
    "#10b981", // green
    "#f59e0b", // amber
    "#6366f1", // indigo
    "#ec4899", // pink
  ];

  return (
    <div className={cn("w-full p-4", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey={xAxisDataKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tickFormatter={yAxisFormatter}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip 
            formatter={tooltipFormatter}
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '0.5rem', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
              border: '1px solid hsl(var(--border))'
            }}
          />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke || defaultColors[index % defaultColors.length]}
              strokeWidth={line.strokeWidth || 2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1000}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
