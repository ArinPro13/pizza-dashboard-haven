
import { supabase } from '@/integrations/supabase/client';
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
    // Fetch orders within date range
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('created_at, quantity, item_id')
      .gte('created_at', fromDate)
      .lte('created_at', toDate)
      .order('created_at', { ascending: true });
      
    if (orderError) throw orderError;
    
    // Get unique item IDs from orders
    const itemIds = [...new Set(orderData.map(order => order.item_id))];
    
    // Skip if no orders in date range
    if (itemIds.length === 0) {
      return [];
    }
    
    // Fetch items with category filter if provided
    let itemQuery = supabase
      .from('items')
      .select('item_id, item_price, item_cat');
      
    if (category && category !== 'all') {
      itemQuery = itemQuery.eq('item_cat', category);
    }
    
    itemQuery = itemQuery.in('item_id', itemIds);
    
    const { data: itemData, error: itemError } = await itemQuery;
    if (itemError) throw itemError;
    
    // Create a set of item IDs that match the category filter
    const filteredItemIds = new Set(itemData.map(item => item.item_id));
    
    // Create lookup map for item prices
    const itemPrices = itemData.reduce((acc, item) => {
      acc[item.item_id] = item.item_price;
      return acc;
    }, {});
    
    // Filter orders by the items that match the category
    const filteredOrders = orderData.filter(order => 
      filteredItemIds.has(order.item_id)
    );
    
    // Group by date according to granularity
    const salesByDate: Record<string, { sales: number, orders: number }> = {};
    
    filteredOrders.forEach(order => {
      let dateKey;
      const orderDate = new Date(order.created_at);
      
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
      
      const price = itemPrices[order.item_id] || 0;
      const saleAmount = price * order.quantity;
      
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { sales: 0, orders: 0 };
      }
      
      salesByDate[dateKey].sales += saleAmount;
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
    // Fetch orders within date range
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('item_id, quantity')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
      
    if (orderError) throw orderError;
    
    // Skip if no orders in date range
    if (orderData.length === 0) {
      return [];
    }
    
    // Get unique item IDs from orders
    const itemIds = [...new Set(orderData.map(order => order.item_id))];
    
    // Fetch items with category filter if provided
    let itemQuery = supabase
      .from('items')
      .select('item_id, item_name, item_price, item_cat');
      
    if (category && category !== 'all') {
      itemQuery = itemQuery.eq('item_cat', category);
    }
    
    itemQuery = itemQuery.in('item_id', itemIds);
    
    const { data: itemData, error: itemError } = await itemQuery;
    if (itemError) throw itemError;
    
    // Create lookup map for item details
    const itemDetails = itemData.reduce((acc, item) => {
      acc[item.item_id] = {
        name: item.item_name,
        price: item.item_price,
        category: item.item_cat
      };
      return acc;
    }, {});
    
    // Group and aggregate by item
    const itemSales: Record<string, { name: string, sales: number }> = {};
    
    orderData.forEach(order => {
      const itemId = order.item_id;
      const itemDetail = itemDetails[itemId];
      
      // Skip if item doesn't match category filter
      if (!itemDetail) return;
      
      if (!itemSales[itemId]) {
        itemSales[itemId] = { name: itemDetail.name, sales: 0 };
      }
      
      itemSales[itemId].sales += order.quantity * itemDetail.price;
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
    // Fetch orders within date range
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('item_id, quantity')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
      
    if (orderError) throw orderError;
    
    // Skip if no orders in date range
    if (orderData.length === 0) {
      return [];
    }
    
    // Get unique item IDs from orders
    const itemIds = [...new Set(orderData.map(order => order.item_id))];
    
    // Fetch item details
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select('item_id, item_price, item_cat')
      .in('item_id', itemIds);
      
    if (itemError) throw itemError;
    
    // Create lookup map for item details
    const itemDetails = itemData.reduce((acc, item) => {
      acc[item.item_id] = {
        price: item.item_price,
        category: item.item_cat
      };
      return acc;
    }, {});
    
    // Calculate sales by category
    const salesByCategory: Record<string, number> = {};
    let totalSales = 0;
    
    orderData.forEach(order => {
      const itemId = order.item_id;
      const itemDetail = itemDetails[itemId];
      
      // Skip if item details not found
      if (!itemDetail) return;
      
      const category = itemDetail.category || 'Uncategorized';
      const saleAmount = order.quantity * itemDetail.price;
      
      if (!salesByCategory[category]) {
        salesByCategory[category] = 0;
      }
      
      salesByCategory[category] += saleAmount;
      totalSales += saleAmount;
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
      .select('created_at')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
    
    if (error) throw error;
    
    const orderCounts: Record<string, number> = {};
    
    data.forEach(order => {
      const orderDate = new Date(order.created_at);
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
