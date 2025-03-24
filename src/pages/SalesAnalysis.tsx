
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ChartContainer } from "@/components/analysis/ChartContainer";
import { LineChart } from "@/components/analysis/LineChart";
import { BarChart } from "@/components/analysis/BarChart";
import { PieChart } from "@/components/analysis/PieChart";
import { FilterToolbar, FilterItem } from "@/components/analysis/FilterToolbar";
import { DateRangePicker } from "@/components/analysis/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data
const mockSalesData = [
  { date: "May 01", sales: 4000, orders: 120 },
  { date: "May 02", sales: 3200, orders: 98 },
  { date: "May 03", sales: 5800, orders: 142 },
  { date: "May 04", sales: 4780, orders: 134 },
  { date: "May 05", sales: 5890, orders: 156 },
  { date: "May 06", sales: 4390, orders: 122 },
  { date: "May 07", sales: 3490, orders: 110 },
  { date: "May 08", sales: 4490, orders: 132 },
  { date: "May 09", sales: 5290, orders: 158 },
  { date: "May 10", sales: 6100, orders: 172 },
  { date: "May 11", sales: 4900, orders: 145 },
  { date: "May 12", sales: 4100, orders: 125 },
];

const mockTopItems = [
  { name: "Pepperoni Pizza", sales: 12450 },
  { name: "Margherita Pizza", sales: 9870 },
  { name: "Hawaiian Pizza", sales: 7650 },
  { name: "BBQ Chicken Pizza", sales: 6120 },
  { name: "Vegetarian Pizza", sales: 4950 },
];

const mockCategoryData = [
  { name: "Classic Pizzas", value: 35 },
  { name: "Specialty Pizzas", value: 25 },
  { name: "Sides", value: 20 },
  { name: "Drinks", value: 15 },
  { name: "Desserts", value: 5 },
];

const mockPeakHours = [
  { hour: "11 AM", orders: 45 },
  { hour: "12 PM", orders: 78 },
  { hour: "1 PM", orders: 95 },
  { hour: "2 PM", orders: 65 },
  { hour: "3 PM", orders: 35 },
  { hour: "4 PM", orders: 28 },
  { hour: "5 PM", orders: 58 },
  { hour: "6 PM", orders: 120 },
  { hour: "7 PM", orders: 145 },
  { hour: "8 PM", orders: 130 },
  { hour: "9 PM", orders: 85 },
  { hour: "10 PM", orders: 42 },
];

const SalesAnalysis = () => {
  const [activeTab, setActiveTab] = useState("trends");
  
  return (
    <DashboardLayout title="Sales Analysis">
      <Tabs defaultValue="trends" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="trends">Sales Trends</TabsTrigger>
          <TabsTrigger value="items">Best-Selling Items</TabsTrigger>
          <TabsTrigger value="categories">Sales by Category</TabsTrigger>
          <TabsTrigger value="peaks">Peak Order Times</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={(range) => console.log(range)} />
            </FilterItem>
            <FilterItem label="Category">
              <Select defaultValue="all">
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="classic">Classic Pizzas</SelectItem>
                  <SelectItem value="specialty">Specialty Pizzas</SelectItem>
                  <SelectItem value="sides">Sides</SelectItem>
                  <SelectItem value="drinks">Drinks</SelectItem>
                  <SelectItem value="desserts">Desserts</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Sales Trend Over Time">
            <LineChart 
              data={mockSalesData}
              lines={[
                { dataKey: "sales", stroke: "hsl(var(--primary))" },
                { dataKey: "orders", stroke: "#10b981" }
              ]}
              xAxisDataKey="date"
              yAxisFormatter={(value) => `$${value}`}
              tooltipFormatter={(value, name) => [`$${value}`, name === "sales" ? "Sales" : "Orders"]}
              height={400}
            />
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="items" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={(range) => console.log(range)} />
            </FilterItem>
            <FilterItem label="Category">
              <Select defaultValue="all">
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="classic">Classic Pizzas</SelectItem>
                  <SelectItem value="specialty">Specialty Pizzas</SelectItem>
                  <SelectItem value="sides">Sides</SelectItem>
                  <SelectItem value="drinks">Drinks</SelectItem>
                  <SelectItem value="desserts">Desserts</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
            <FilterItem label="Top N Items">
              <Select defaultValue="5">
                <SelectTrigger className="w-[100px] h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="15">Top 15</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Best-Selling Items by Revenue">
            <BarChart 
              data={mockTopItems}
              bars={[{ dataKey: "sales", fill: "hsl(var(--primary))" }]}
              xAxisDataKey="name"
              yAxisFormatter={(value) => `$${value}`}
              tooltipFormatter={(value, name) => [`$${value}`, "Sales"]}
              height={400}
              layout="vertical"
            />
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={(range) => console.log(range)} />
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Sales by Category">
            <PieChart 
              data={mockCategoryData}
              tooltipFormatter={(value, name) => [`${value}%`, name]}
              height={400}
              innerRadius={80}
            />
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="peaks" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={(range) => console.log(range)} />
            </FilterItem>
            <FilterItem label="Granularity">
              <Select defaultValue="hourly">
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Peak Order Times">
            <BarChart 
              data={mockPeakHours}
              bars={[{ dataKey: "orders", fill: "hsl(var(--primary))" }]}
              xAxisDataKey="hour"
              yAxisFormatter={(value) => `${value}`}
              tooltipFormatter={(value, name) => [`${value}`, "Orders"]}
              height={400}
            />
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SalesAnalysis;
