
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface TopItem {
  name: string;
  quantity: number;
  price?: number;
}

interface TopItemsChartProps {
  data: TopItem[];
  title: string;
}

export const TopItemsChart: React.FC<TopItemsChartProps> = ({ data, title }) => {
  return (
    <div className="chart-wrapper h-[300px]">
      <h3 className="text-base font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fontSize: 12 }} 
            width={100}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '0.5rem', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
              border: '1px solid hsl(var(--border))'
            }}
            formatter={(value) => [`${value}`, 'Quantity Sold']}
          />
          <Bar 
            dataKey="quantity" 
            fill="hsl(var(--primary))" 
            radius={[0, 4, 4, 0]} 
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
