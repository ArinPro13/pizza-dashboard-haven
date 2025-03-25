
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { toast } from "sonner";
import { 
  fetchSalesTrendWithFilters, 
  fetchBestSellingItems, 
  fetchSalesByCategory, 
  fetchPeakOrderTimes 
} from "@/services/salesAnalysisService";

const SalesAnalysis = () => {
  const [activeTab, setActiveTab] = useState("trends");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [category, setCategory] = useState("all");
  const [topItemsLimit, setTopItemsLimit] = useState(5);
  const [granularity, setGranularity] = useState("day");
  const [peakTimeGranularity, setPeakTimeGranularity] = useState("hourly");

  // Fetch sales trend data
  const { 
    data: salesTrendData, 
    isLoading: salesTrendLoading,
    error: salesTrendError
  } = useQuery({
    queryKey: ['sales-trend-filters', dateRange, category, granularity],
    queryFn: () => fetchSalesTrendWithFilters(dateRange, category, granularity as 'day' | 'week' | 'month'),
    enabled: activeTab === "trends",
  });

  // Fetch best selling items
  const { 
    data: bestSellingData, 
    isLoading: bestSellingLoading,
    error: bestSellingError
  } = useQuery({
    queryKey: ['best-selling-items', dateRange, category, topItemsLimit],
    queryFn: () => fetchBestSellingItems(dateRange, category, topItemsLimit),
    enabled: activeTab === "items",
  });

  // Fetch sales by category
  const { 
    data: categoryData, 
    isLoading: categoryLoading,
    error: categoryError
  } = useQuery({
    queryKey: ['sales-by-category', dateRange],
    queryFn: () => fetchSalesByCategory(dateRange),
    enabled: activeTab === "categories",
  });

  // Fetch peak order times
  const { 
    data: peakTimeData, 
    isLoading: peakTimeLoading,
    error: peakTimeError
  } = useQuery({
    queryKey: ['peak-order-times', dateRange, peakTimeGranularity],
    queryFn: () => fetchPeakOrderTimes(dateRange, peakTimeGranularity as 'hourly' | 'daily' | 'weekly'),
    enabled: activeTab === "peaks",
  });

  // Handle errors
  useEffect(() => {
    if (salesTrendError) {
      toast.error("Failed to load sales trend data");
      console.error("Sales trend error:", salesTrendError);
    }
    if (bestSellingError) {
      toast.error("Failed to load best-selling items data");
      console.error("Best selling error:", bestSellingError);
    }
    if (categoryError) {
      toast.error("Failed to load category data");
      console.error("Category error:", categoryError);
    }
    if (peakTimeError) {
      toast.error("Failed to load peak time data");
      console.error("Peak time error:", peakTimeError);
    }
  }, [salesTrendError, bestSellingError, categoryError, peakTimeError]);

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from) {
      setDateRange({
        from: range.from,
        to: range.to || new Date()
      });
    }
  };

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
              <DateRangePicker onRangeChange={handleDateRangeChange} />
            </FilterItem>
            <FilterItem label="Category">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Classic Pizzas">Classic Pizzas</SelectItem>
                  <SelectItem value="Specialty Pizzas">Specialty Pizzas</SelectItem>
                  <SelectItem value="Sides">Sides</SelectItem>
                  <SelectItem value="Drinks">Drinks</SelectItem>
                  <SelectItem value="Desserts">Desserts</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
            <FilterItem label="Granularity">
              <Select value={granularity} onValueChange={setGranularity}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Sales Trend Over Time">
            {salesTrendLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p>Loading sales data...</p>
              </div>
            ) : salesTrendData && salesTrendData.length > 0 ? (
              <LineChart 
                data={salesTrendData}
                lines={[
                  { dataKey: "sales", stroke: "hsl(var(--primary))" },
                  { dataKey: "orders", stroke: "#10b981" }
                ]}
                xAxisDataKey="date"
                yAxisFormatter={(value) => `$${value}`}
                tooltipFormatter={(value, name) => [`$${value}`, name === "sales" ? "Sales" : "Orders"]}
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p>No sales data available for the selected filters.</p>
              </div>
            )}
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="items" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={handleDateRangeChange} />
            </FilterItem>
            <FilterItem label="Category">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Classic Pizzas">Classic Pizzas</SelectItem>
                  <SelectItem value="Specialty Pizzas">Specialty Pizzas</SelectItem>
                  <SelectItem value="Sides">Sides</SelectItem>
                  <SelectItem value="Drinks">Drinks</SelectItem>
                  <SelectItem value="Desserts">Desserts</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
            <FilterItem label="Top N Items">
              <Select value={topItemsLimit.toString()} onValueChange={(value) => setTopItemsLimit(parseInt(value, 10))}>
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
            {bestSellingLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p>Loading best-selling items...</p>
              </div>
            ) : bestSellingData && bestSellingData.length > 0 ? (
              <BarChart 
                data={bestSellingData}
                bars={[{ dataKey: "sales", fill: "hsl(var(--primary))" }]}
                xAxisDataKey="name"
                yAxisFormatter={(value) => `$${value}`}
                tooltipFormatter={(value, name) => [`$${value}`, "Sales"]}
                height={400}
                layout="vertical"
              />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p>No best-selling items data available for the selected filters.</p>
              </div>
            )}
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={handleDateRangeChange} />
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Sales by Category">
            {categoryLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p>Loading category data...</p>
              </div>
            ) : categoryData && categoryData.length > 0 ? (
              <PieChart 
                data={categoryData}
                tooltipFormatter={(value, name) => [`${value}%`, name]}
                height={400}
                innerRadius={80}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p>No category data available for the selected filters.</p>
              </div>
            )}
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="peaks" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={handleDateRangeChange} />
            </FilterItem>
            <FilterItem label="Granularity">
              <Select value={peakTimeGranularity} onValueChange={setPeakTimeGranularity}>
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
            {peakTimeLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p>Loading peak time data...</p>
              </div>
            ) : peakTimeData && peakTimeData.length > 0 ? (
              <BarChart 
                data={peakTimeData}
                bars={[{ dataKey: "orders", fill: "hsl(var(--primary))" }]}
                xAxisDataKey="hour"
                yAxisFormatter={(value) => `${value}`}
                tooltipFormatter={(value, name) => [`${value}`, "Orders"]}
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p>No peak time data available for the selected filters.</p>
              </div>
            )}
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SalesAnalysis;
