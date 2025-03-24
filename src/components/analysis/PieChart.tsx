
import React from "react";
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface PieChartProps {
  data: DataPoint[];
  dataKey?: string;
  nameKey?: string;
  tooltipFormatter?: (value: number, name: string) => [string, string];
  colors?: string[];
  className?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: string | number;
  label?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  dataKey = "value",
  nameKey = "name",
  tooltipFormatter,
  colors,
  className,
  height = 300,
  innerRadius = 0,
  outerRadius = "70%",
  label = true,
}) => {
  const defaultColors = [
    "hsl(var(--primary))",
    "#10b981", // green
    "#f59e0b", // amber
    "#6366f1", // indigo
    "#ec4899", // pink
    "#0ea5e9", // sky
    "#8b5cf6", // violet
    "#ef4444", // red
  ];

  const chartColors = colors || defaultColors;

  return (
    <div className={cn("w-full p-4", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="hsl(var(--primary))"
            labelLine={label}
            label={label && {
              fill: 'hsl(var(--foreground))',
              fontSize: 12,
            }}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={chartColors[index % chartColors.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={tooltipFormatter}
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '0.5rem', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
              border: '1px solid hsl(var(--border))'
            }}
          />
          <Legend
            formatter={(value, entry, index) => (
              <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>
                {value}
              </span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
