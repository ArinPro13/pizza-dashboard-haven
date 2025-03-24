
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopItemsChart } from "@/components/dashboard/TopItemsChart";
import { DateRangePicker } from "@/components/analysis/DateRangePicker";
import { DollarSign, ShoppingBag, Users, Truck } from "lucide-react";

// Mock data
const mockSalesData = [
  { date: "May 01", amount: 4000 },
  { date: "May 02", amount: 3200 },
  { date: "May 03", amount: 5800 },
  { date: "May 04", amount: 4780 },
  { date: "May 05", amount: 5890 },
  { date: "May 06", amount: 4390 },
  { date: "May 07", amount: 3490 },
  { date: "May 08", amount: 4490 },
  { date: "May 09", amount: 5290 },
  { date: "May 10", amount: 6100 },
  { date: "May 11", amount: 4900 },
  { date: "May 12", amount: 4100 },
  { date: "May 13", amount: 3500 },
  { date: "May 14", amount: 4800 },
  { date: "May 15", amount: 5100 },
];

const mockTopItems = [
  { name: "Pepperoni Pizza", quantity: 245 },
  { name: "Margherita Pizza", quantity: 190 },
  { name: "Hawaiian Pizza", quantity: 150 },
  { name: "BBQ Chicken Pizza", quantity: 120 },
  { name: "Vegetarian Pizza", quantity: 95 },
];

const Dashboard = () => {
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    console.log("Date range changed:", range);
    // Here you would typically fetch new data based on the date range
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="flex justify-end mb-6">
        <DateRangePicker onRangeChange={handleDateRangeChange} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Sales"
          value="$78,650"
          icon={<DollarSign className="h-5 w-5" />}
          trend={12.5}
          trendLabel="vs. last period"
        />
        <KPICard
          title="Orders"
          value="1,643"
          icon={<ShoppingBag className="h-5 w-5" />}
          trend={8.2}
          trendLabel="vs. last period"
        />
        <KPICard
          title="Avg. Order Value"
          value="$47.86"
          icon={<DollarSign className="h-5 w-5" />}
          trend={-2.4}
          trendLabel="vs. last period"
        />
        <KPICard
          title="Delivery Rate"
          value="68%"
          icon={<Truck className="h-5 w-5" />}
          trend={5.1}
          trendLabel="vs. last period"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesChart data={mockSalesData} title="Sales Last 30 Days" />
        <TopItemsChart data={mockTopItems} title="Top 5 Best-Selling Items" />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="chart-wrapper">
          <h3 className="text-base font-medium mb-4">Recent Orders</h3>
          <div className="text-sm text-muted-foreground text-center py-10">
            Order data placeholder - connect to your backend API
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
