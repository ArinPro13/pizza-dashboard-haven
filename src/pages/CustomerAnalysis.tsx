
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ChartContainer } from "@/components/analysis/ChartContainer";
import { BarChart } from "@/components/analysis/BarChart";
import { FilterToolbar, FilterItem } from "@/components/analysis/FilterToolbar";
import { DateRangePicker } from "@/components/analysis/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  fetchCustomerOrderFrequency, 
  fetchCustomerPreferences, 
  fetchDeliveryPickupPreferences 
} from "@/services/customerAnalysisService";

const CustomerAnalysis = () => {
  const [activeTab, setActiveTab] = useState("frequency");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [customerId, setCustomerId] = useState("");

  // Fetch customer order frequency data
  const { 
    data: frequencyData, 
    isLoading: frequencyLoading,
    error: frequencyError
  } = useQuery({
    queryKey: ['customer-frequency', dateRange],
    queryFn: () => fetchCustomerOrderFrequency(dateRange),
    enabled: activeTab === "frequency",
  });

  // Fetch customer preferences
  const { 
    data: preferencesData, 
    isLoading: preferencesLoading,
    error: preferencesError
  } = useQuery({
    queryKey: ['customer-preferences', dateRange, customerId],
    queryFn: () => fetchCustomerPreferences(dateRange, customerId),
    enabled: activeTab === "preferences",
  });

  // Fetch delivery vs pickup preferences
  const { 
    data: deliveryPickupData, 
    isLoading: deliveryPickupLoading,
    error: deliveryPickupError
  } = useQuery({
    queryKey: ['delivery-pickup', dateRange, customerId],
    queryFn: () => fetchDeliveryPickupPreferences(dateRange, customerId),
    enabled: activeTab === "delivery",
  });

  // Handle errors
  useEffect(() => {
    if (frequencyError) {
      toast.error("Failed to load customer frequency data");
      console.error("Frequency error:", frequencyError);
    }
    if (preferencesError) {
      toast.error("Failed to load customer preferences data");
      console.error("Preferences error:", preferencesError);
    }
    if (deliveryPickupError) {
      toast.error("Failed to load delivery/pickup data");
      console.error("Delivery/pickup error:", deliveryPickupError);
    }
  }, [frequencyError, preferencesError, deliveryPickupError]);

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from) {
      setDateRange({
        from: range.from,
        to: range.to || new Date()
      });
    }
  };

  const handleCustomerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerId(e.target.value);
  };

  return (
    <DashboardLayout title="Customer Analysis">
      <Tabs defaultValue="frequency" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="frequency">Order Frequency</TabsTrigger>
          <TabsTrigger value="preferences">Customer Preferences</TabsTrigger>
          <TabsTrigger value="delivery">Delivery vs. Pickup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frequency" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={handleDateRangeChange} />
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Customer Order Frequency">
            {frequencyLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p>Loading frequency data...</p>
              </div>
            ) : frequencyData && frequencyData.length > 0 ? (
              <BarChart 
                data={frequencyData}
                bars={[{ dataKey: "customers", fill: "hsl(var(--primary))" }]}
                xAxisDataKey="frequency"
                tooltipFormatter={(value, name) => [`${value}`, "Customers"]}
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p>No customer frequency data available for the selected date range.</p>
              </div>
            )}
          </ChartContainer>
          
          <ChartContainer title="Customer Retention Insights">
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Repeat Customers</h4>
                  <p className="text-2xl font-semibold">
                    {frequencyLoading ? "..." : 
                      frequencyData && frequencyData.length > 0 ? 
                        (() => {
                          const nonOneTimeCustomers = frequencyData
                            .filter(d => d.frequency !== "1 order")
                            .reduce((sum, d) => sum + d.customers, 0);
                          const totalCustomers = frequencyData
                            .reduce((sum, d) => sum + d.customers, 0);
                          return totalCustomers > 0 ? 
                            `${Math.round((nonOneTimeCustomers / totalCustomers) * 100)}%` : 
                            "0%";
                        })() :
                        "0%"
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Based on selected date range</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Customer Value</h4>
                  <p className="text-2xl font-semibold">Calculated from orders</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on selected date range</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Orders per Customer</h4>
                  <p className="text-2xl font-semibold">
                    {frequencyLoading ? "..." : 
                      frequencyData && frequencyData.length > 0 ? 
                        (() => {
                          const weightedSum = frequencyData.reduce((sum, d) => {
                            // Convert frequency ranges to average values
                            let avgOrders = 0;
                            if (d.frequency === "1 order") avgOrders = 1;
                            else if (d.frequency === "2-3 orders") avgOrders = 2.5;
                            else if (d.frequency === "4-5 orders") avgOrders = 4.5;
                            else if (d.frequency === "6-10 orders") avgOrders = 8;
                            else if (d.frequency === "11+ orders") avgOrders = 13;
                            
                            return sum + (avgOrders * d.customers);
                          }, 0);
                          
                          const totalCustomers = frequencyData
                            .reduce((sum, d) => sum + d.customers, 0);
                            
                          return totalCustomers > 0 ? 
                            (weightedSum / totalCustomers).toFixed(1) : 
                            "0";
                        })() :
                        "0"
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Based on selected date range</p>
                </div>
              </div>
            </div>
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={handleDateRangeChange} />
            </FilterItem>
            <FilterItem label="Customer ID">
              <Input 
                placeholder="Enter customer ID"
                className="w-[200px] h-9"
                value={customerId}
                onChange={handleCustomerIdChange}
              />
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Customer Preferences">
            {preferencesLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p>Loading preferences data...</p>
              </div>
            ) : preferencesData && preferencesData.length > 0 ? (
              <BarChart 
                data={preferencesData}
                bars={[{ dataKey: "orders", fill: "hsl(var(--primary))" }]}
                xAxisDataKey="item"
                tooltipFormatter={(value, name) => [`${value}`, "Orders"]}
                height={400}
                layout="vertical"
              />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p>No customer preferences data available for the selected filters.</p>
              </div>
            )}
          </ChartContainer>
          
          <ChartContainer title="Customer Profile">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Order History</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">First Order</span>
                    <span>Calculate from database</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Last Order</span>
                    <span>Calculate from database</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Total Orders</span>
                    <span>Calculate from database</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Avg. Order Value</span>
                    <span>Calculate from database</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferred Time</span>
                    <span>Calculate from database</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Name</span>
                    <span>Fetch from database</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Email</span>
                    <span>Fetch from database</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Phone</span>
                    <span>Fetch from database</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span>Fetch from database</span>
                  </div>
                </div>
              </div>
            </div>
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="delivery" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={handleDateRangeChange} />
            </FilterItem>
            <FilterItem label="Customer ID (Optional)">
              <Input 
                placeholder="Enter customer ID"
                className="w-[200px] h-9"
                value={customerId}
                onChange={handleCustomerIdChange}
              />
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Delivery vs. Pickup Preferences">
            {deliveryPickupLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p>Loading delivery/pickup data...</p>
              </div>
            ) : deliveryPickupData && deliveryPickupData.length > 0 ? (
              <BarChart 
                data={deliveryPickupData}
                bars={[
                  { dataKey: "delivery", fill: "hsl(var(--primary))", name: "Delivery" },
                  { dataKey: "pickup", fill: "#10b981", name: "Pickup" }
                ]}
                xAxisDataKey="month"
                tooltipFormatter={(value, name) => [`${value}%`, name]}
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p>No delivery/pickup data available for the selected filters.</p>
              </div>
            )}
          </ChartContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer title="Delivery Metrics">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Delivery Time</h4>
                    <p className="text-2xl font-semibold">From database</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">On-Time Rate</h4>
                    <p className="text-2xl font-semibold">From database</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Delivery Radius</h4>
                    <p className="text-2xl font-semibold">From database</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Distance</h4>
                    <p className="text-2xl font-semibold">From database</p>
                  </div>
                </div>
              </div>
            </ChartContainer>
            
            <ChartContainer title="Pickup Metrics">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Pickup Time</h4>
                    <p className="text-2xl font-semibold">From database</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Ready On Arrival</h4>
                    <p className="text-2xl font-semibold">From database</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Peak Pickup Hour</h4>
                    <p className="text-2xl font-semibold">From database</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Wait Time</h4>
                    <p className="text-2xl font-semibold">From database</p>
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
