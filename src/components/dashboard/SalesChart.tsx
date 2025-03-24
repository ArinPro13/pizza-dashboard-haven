
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SalesData {
  date: string;
  amount: number;
}

interface SalesChartProps {
  data: SalesData[];
  title: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, title }) => {
  return (
    <div className="chart-wrapper h-[300px]">
      <h3 className="text-base font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '0.5rem', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
              border: '1px solid hsl(var(--border))'
            }}
            formatter={(value) => [`$${value}`, 'Sales']}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorAmount)" 
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
