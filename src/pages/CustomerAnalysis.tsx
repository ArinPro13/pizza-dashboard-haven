
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ChartContainer } from "@/components/analysis/ChartContainer";
import { BarChart } from "@/components/analysis/BarChart";
import { FilterToolbar, FilterItem } from "@/components/analysis/FilterToolbar";
import { DateRangePicker } from "@/components/analysis/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data
const mockOrderFrequency = [
  { frequency: "1 order", customers: 320 },
  { frequency: "2-3 orders", customers: 218 },
  { frequency: "4-5 orders", customers: 164 },
  { frequency: "6-10 orders", customers: 98 },
  { frequency: "11+ orders", customers: 45 },
];

const mockCustomerPreferences = [
  { item: "Pepperoni Pizza", orders: 12 },
  { item: "Garlic Bread", orders: 8 },
  { item: "Soda", orders: 6 },
  { item: "BBQ Chicken Pizza", orders: 5 },
  { item: "Cheesy Fries", orders: 4 },
];

const mockDeliveryPickup = [
  { month: "Jan", delivery: 68, pickup: 32 },
  { month: "Feb", delivery: 72, pickup: 28 },
  { month: "Mar", delivery: 65, pickup: 35 },
  { month: "Apr", delivery: 70, pickup: 30 },
  { month: "May", delivery: 75, pickup: 25 },
];

const CustomerAnalysis = () => {
  return (
    <DashboardLayout title="Customer Analysis">
      <Tabs defaultValue="frequency" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="frequency">Order Frequency</TabsTrigger>
          <TabsTrigger value="preferences">Customer Preferences</TabsTrigger>
          <TabsTrigger value="delivery">Delivery vs. Pickup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frequency" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={(range) => console.log(range)} />
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Customer Order Frequency">
            <BarChart 
              data={mockOrderFrequency}
              bars={[{ dataKey: "customers", fill: "hsl(var(--primary))" }]}
              xAxisDataKey="frequency"
              tooltipFormatter={(value, name) => [`${value}`, "Customers"]}
              height={400}
            />
          </ChartContainer>
          
          <ChartContainer title="Customer Retention Insights">
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Repeat Customers</h4>
                  <p className="text-2xl font-semibold">68%</p>
                  <p className="text-xs text-muted-foreground mt-1">+5.2% from last period</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Customer Value</h4>
                  <p className="text-2xl font-semibold">$138.50</p>
                  <p className="text-xs text-muted-foreground mt-1">+12.3% from last period</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Orders per Customer</h4>
                  <p className="text-2xl font-semibold">3.4</p>
                  <p className="text-xs text-muted-foreground mt-1">+0.8 from last period</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Connect to your customer database for detailed retention analytics.
              </div>
            </div>
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={(range) => console.log(range)} />
            </FilterItem>
            <FilterItem label="Customer ID">
              <Input 
                placeholder="Enter customer ID"
                className="w-[200px] h-9"
              />
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Customer Preferences">
            <BarChart 
              data={mockCustomerPreferences}
              bars={[{ dataKey: "orders", fill: "hsl(var(--primary))" }]}
              xAxisDataKey="item"
              tooltipFormatter={(value, name) => [`${value}`, "Orders"]}
              height={400}
              layout="vertical"
            />
          </ChartContainer>
          
          <ChartContainer title="Customer Profile">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Order History</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">First Order</span>
                    <span>March 15, 2023</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Last Order</span>
                    <span>May 12, 2023</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Total Orders</span>
                    <span>18</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Avg. Order Value</span>
                    <span>$32.45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferred Time</span>
                    <span>7:00 PM - 8:00 PM</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Name</span>
                    <span>John Doe</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Email</span>
                    <span>john.doe@example.com</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Phone</span>
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span>123 Main St, Anytown</span>
                  </div>
                </div>
              </div>
            </div>
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="delivery" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={(range) => console.log(range)} />
            </FilterItem>
            <FilterItem label="Customer ID (Optional)">
              <Input 
                placeholder="Enter customer ID"
                className="w-[200px] h-9"
              />
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Delivery vs. Pickup Preferences">
            <BarChart 
              data={mockDeliveryPickup}
              bars={[
                { dataKey: "delivery", fill: "hsl(var(--primary))", name: "Delivery" },
                { dataKey: "pickup", fill: "#10b981", name: "Pickup" }
              ]}
              xAxisDataKey="month"
              tooltipFormatter={(value, name) => [`${value}%`, name]}
              height={400}
            />
          </ChartContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer title="Delivery Metrics">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Delivery Time</h4>
                    <p className="text-2xl font-semibold">28 min</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">On-Time Rate</h4>
                    <p className="text-2xl font-semibold">92%</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Delivery Radius</h4>
                    <p className="text-2xl font-semibold">5 miles</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Distance</h4>
                    <p className="text-2xl font-semibold">2.8 miles</p>
                  </div>
                </div>
              </div>
            </ChartContainer>
            
            <ChartContainer title="Pickup Metrics">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Pickup Time</h4>
                    <p className="text-2xl font-semibold">18 min</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Ready On Arrival</h4>
                    <p className="text-2xl font-semibold">87%</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Peak Pickup Hour</h4>
                    <p className="text-2xl font-semibold">6 PM</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Wait Time</h4>
                    <p className="text-2xl font-semibold">4 min</p>
                  </div>
                </div>
              </div>
            </ChartContainer>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CustomerAnalysis;
