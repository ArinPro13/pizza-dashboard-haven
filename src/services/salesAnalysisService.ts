
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { DateRange } from './dashboardService';

// Sales trend over time with filters
export async function fetchSalesTrendWithFilters(
  dateRange: DateRange,
  category?: string,
  granularity: 'day' | 'week' | 'month' = 'day'
) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_date,
        total_amount,
        order_items!inner(
          item_id,
          quantity,
          items!inner(
            category
          )
        )
      `)
      .gte('order_date', fromDate)
      .lte('order_date', toDate);
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Filter by category if provided
    let filteredData = data;
    if (category && category !== 'all') {
      filteredData = data.filter(order => 
        order.order_items.some((item: any) => 
          item.items.category === category
        )
      );
    }
    
    // Group by date according to granularity
    const salesByDate: Record<string, { sales: number, orders: number }> = {};
    
    filteredData.forEach(order => {
      let dateKey;
      const orderDate = new Date(order.order_date);
      
      if (granularity === 'day') {
        dateKey = format(orderDate, 'MMM dd');
      } else if (granularity === 'week') {
        // Get week number in year
        const weekNum = format(orderDate, 'w');
        const year = format(orderDate, 'yyyy');
        dateKey = `W${weekNum} ${year}`;
      } else if (granularity === 'month') {
        dateKey = format(orderDate, 'MMM yyyy');
      }
      
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { sales: 0, orders: 0 };
      }
      
      salesByDate[dateKey].sales += order.total_amount;
      salesByDate[dateKey].orders += 1;
    });
    
    // Convert to array format for charts
    return Object.entries(salesByDate).map(([date, data]) => ({
      date,
      sales: data.sales,
      orders: data.orders
    }));
  } catch (error) {
    console.error('Error fetching sales trend with filters:', error);
    throw error;
  }
}

// Best-selling items with filters
export async function fetchBestSellingItems(
  dateRange: DateRange,
  category?: string,
  limit: number = 5
) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    let query = supabase
      .from('order_items')
      .select(`
        item_id,
        quantity,
        price,
        orders!inner(order_date),
        items!inner(name, category)
      `)
      .gte('orders.order_date', fromDate)
      .lte('orders.order_date', toDate);
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Filter by category
    let filteredData = data;
    if (category && category !== 'all') {
      filteredData = data.filter((item: any) => 
        item.items.category === category
      );
    }
    
    // Group and aggregate by item
    const itemSales: Record<string, { name: string, sales: number }> = {};
    
    filteredData.forEach((orderItem: any) => {
      const itemName = orderItem.items.name;
      const salesAmount = orderItem.quantity * orderItem.price;
      
      if (!itemSales[itemName]) {
        itemSales[itemName] = { name: itemName, sales: 0 };
      }
      
      itemSales[itemName].sales += salesAmount;
    });
    
    // Convert to array, sort by sales, and limit
    return Object.values(itemSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching best-selling items:', error);
    throw error;
  }
}

// Sales by category
export async function fetchSalesByCategory(dateRange: DateRange) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        orders!inner(order_date),
        items!inner(category)
      `)
      .gte('orders.order_date', fromDate)
      .lte('orders.order_date', toDate);
    
    if (error) throw error;
    
    // Calculate total sales amount
    const totalSales = data.reduce((sum, item: any) => 
      sum + (item.quantity * item.price), 0);
    
    // Group by category
    const salesByCategory: Record<string, number> = {};
    
    data.forEach((orderItem: any) => {
      const category = orderItem.items.category;
      const salesAmount = orderItem.quantity * orderItem.price;
      
      if (!salesByCategory[category]) {
        salesByCategory[category] = 0;
      }
      
      salesByCategory[category] += salesAmount;
    });
    
    // Convert to percentage format for pie chart
    return Object.entries(salesByCategory).map(([name, value]) => ({
      name,
      value: Math.round((value / totalSales) * 100)
    }));
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    throw error;
  }
}

// Peak order times
export async function fetchPeakOrderTimes(
  dateRange: DateRange,
  granularity: 'hourly' | 'daily' | 'weekly' = 'hourly'
) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('order_date')
      .gte('order_date', fromDate)
      .lte('order_date', toDate);
    
    if (error) throw error;
    
    const orderCounts: Record<string, number> = {};
    
    data.forEach(order => {
      const orderDate = new Date(order.order_date);
      let timeKey;
      
      if (granularity === 'hourly') {
        timeKey = format(orderDate, 'h a'); // e.g., "3 PM"
      } else if (granularity === 'daily') {
        timeKey = format(orderDate, 'EEE'); // e.g., "Mon"
      } else if (granularity === 'weekly') {
        timeKey = format(orderDate, 'w'); // Week number
      }
      
      if (!orderCounts[timeKey]) {
        orderCounts[timeKey] = 0;
      }
      
      orderCounts[timeKey] += 1;
    });
    
    // Format for bar chart
    if (granularity === 'hourly') {
      // For hourly, we want to sort by hour of day
      const hours = [
        "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM",
        "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
        "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
        "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
      ];
      
      return hours.map(hour => ({
        hour,
        orders: orderCounts[hour] || 0
      }));
    } else {
      return Object.entries(orderCounts).map(([time, orders]) => ({
        hour: time,
        orders
      }));
    }
  } catch (error) {
    console.error('Error fetching peak order times:', error);
    throw error;
  }
}
