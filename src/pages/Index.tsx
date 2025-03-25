
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopItemsChart } from "@/components/dashboard/TopItemsChart";
import { DateRangePicker } from "@/components/analysis/DateRangePicker";
import { DollarSign, ShoppingBag, Users, Truck } from "lucide-react";
import { fetchDashboardKPIs, fetchSalesTrend, fetchTopItems } from "@/services/dashboardService";
import { toast } from "sonner";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Fetch KPI data
  const { 
    data: kpiData, 
    isLoading: kpiLoading,
    error: kpiError
  } = useQuery({
    queryKey: ['dashboard-kpis', dateRange],
    queryFn: () => fetchDashboardKPIs(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch sales trend data
  const { 
    data: salesData, 
    isLoading: salesLoading,
    error: salesError 
  } = useQuery({
    queryKey: ['sales-trend', dateRange],
    queryFn: () => fetchSalesTrend(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch top items data
  const { 
    data: topItemsData, 
    isLoading: topItemsLoading,
    error: topItemsError 
  } = useQuery({
    queryKey: ['top-items', dateRange],
    queryFn: () => fetchTopItems(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors
  useEffect(() => {
    if (kpiError) {
      toast.error("Failed to load KPI data");
      console.error("KPI error:", kpiError);
    }
    if (salesError) {
      toast.error("Failed to load sales trend data");
      console.error("Sales error:", salesError);
    }
    if (topItemsError) {
      toast.error("Failed to load top items data");
      console.error("Top items error:", topItemsError);
    }
  }, [kpiError, salesError, topItemsError]);

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from) {
      setDateRange({
        from: range.from,
        to: range.to || new Date()
      });
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="flex justify-end mb-6">
        <DateRangePicker onRangeChange={handleDateRangeChange} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Sales"
          value={kpiLoading ? "Loading..." : `$${kpiData?.totalSales.toFixed(2) || 0}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={12.5}
          trendLabel="vs. last period"
        />
        <KPICard
          title="Orders"
          value={kpiLoading ? "Loading..." : `${kpiData?.orderCount || 0}`}
          icon={<ShoppingBag className="h-5 w-5" />}
          trend={8.2}
          trendLabel="vs. last period"
        />
        <KPICard
          title="Avg. Order Value"
          value={kpiLoading ? "Loading..." : `$${kpiData?.avgOrderValue.toFixed(2) || 0}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={-2.4}
          trendLabel="vs. last period"
        />
        <KPICard
          title="Delivery Rate"
          value={kpiLoading ? "Loading..." : `${Math.round(kpiData?.deliveryPercentage || 0)}%`}
          icon={<Truck className="h-5 w-5" />}
          trend={5.1}
          trendLabel="vs. last period"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesChart 
          data={salesLoading ? [] : salesData || []} 
          title="Sales Last 30 Days" 
        />
        <TopItemsChart 
          data={topItemsLoading ? [] : topItemsData || []} 
          title="Top 5 Best-Selling Items" 
        />
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
