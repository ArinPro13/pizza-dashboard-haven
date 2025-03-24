
import React from "react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  [key: string]: any;
}

interface BarProps {
  dataKey: string;
  fill?: string;
  name?: string;
}

interface BarChartProps {
  data: DataPoint[];
  bars: BarProps[];
  xAxisDataKey: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number, name: string) => [string, string];
  className?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  xAxisDataKey,
  yAxisFormatter = (value) => `${value}`,
  tooltipFormatter,
  className,
  height = 300,
  layout = "horizontal",
}) => {
  const defaultColors = [
    "hsl(var(--primary))",
    "#10b981", // green
    "#f59e0b", // amber
    "#6366f1", // indigo
    "#ec4899", // pink
  ];

  const isVertical = layout === "vertical";

  return (
    <div className={cn("w-full p-4", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={!isVertical} horizontal={isVertical} stroke="hsl(var(--border))" />
          {isVertical ? (
            <>
              <XAxis 
                type="number" 
                tickFormatter={yAxisFormatter}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                dataKey={xAxisDataKey} 
                type="category" 
                width={100}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
            </>
          ) : (
            <>
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
            </>
          )}
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
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.fill || defaultColors[index % defaultColors.length]}
              radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              animationDuration={1000}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
