
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

export interface DateRange {
  from: Date;
  to?: Date;
}

// Get sales summary for dashboard
export async function fetchSalesSummary(dateRange: DateRange) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    // Fetch raw orders data
    const { data, error } = await supabase
      .from('orders')
      .select('quantity, item_id, delivery, order_id')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
    
    if (error) throw error;
    
    // Skip if no orders in date range
    if (data.length === 0) {
      return {
        totalSales: 0,
        orderCount: 0,
        avgOrderValue: 0,
        deliveryPercentage: 0
      };
    }
    
    // Fetch item prices
    const itemIds = [...new Set(data.map(order => order.item_id))];
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('items')
      .select('item_id, item_price')
      .in('item_id', itemIds);
    
    if (itemsError) throw itemsError;
    
    // Create a lookup map for item prices
    const itemPrices = itemsData.reduce((acc, item) => {
      acc[item.item_id] = item.item_price || 0;
      return acc;
    }, {});
    
    // Calculate sales metrics
    let totalSales = 0;
    let deliveryCount = 0;
    const orderMap = new Map();
    
    data.forEach(order => {
      const itemPrice = itemPrices[order.item_id] || 0;
      const orderValue = (order.quantity || 1) * itemPrice;
      
      totalSales += orderValue;
      
      if (order.delivery === 1) {
        deliveryCount++;
      }
      
      // Track unique orders
      if (order.order_id) {
        if (!orderMap.has(order.order_id)) {
          orderMap.set(order.order_id, {
            total: 0,
            isDelivery: order.delivery === 1
          });
        }
        
        orderMap.get(order.order_id).total += orderValue;
      }
    });
    
    const orderCount = orderMap.size;
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
    // Convert to numbers before division to fix the type error
    const deliveryPercentage = orderCount > 0 ? (Number(deliveryCount) / Number(data.length)) * 100 : 0;
    
    return {
      totalSales,
      orderCount,
      avgOrderValue,
      deliveryPercentage
    };
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    throw error;
  }
}

// This is the renamed function to match what's expected in Index.tsx
export const fetchDashboardKPIs = fetchSalesSummary;

// Get sales trend for dashboard
export async function fetchSalesTrend(dateRange: DateRange) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    // Fetch raw orders data
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, quantity, item_id')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
    
    if (error) throw error;
    
    // Fetch item prices
    const itemIds = [...new Set(data.map(order => order.item_id))];
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('items')
      .select('item_id, item_price')
      .in('item_id', itemIds);
    
    if (itemsError) throw itemsError;
    
    // Create a lookup map for item prices
    const itemPrices = itemsData.reduce((acc, item) => {
      acc[item.item_id] = item.item_price || 0;
      return acc;
    }, {});
    
    // Group sales by day
    const salesByDay = {};
    
    data.forEach(order => {
      const date = format(new Date(order.created_at), 'yyyy-MM-dd');
      const itemPrice = itemPrices[order.item_id] || 0;
      const orderValue = (order.quantity || 1) * itemPrice;
      
      if (!salesByDay[date]) {
        salesByDay[date] = 0;
      }
      
      salesByDay[date] += orderValue;
    });
    
    // Fill in missing dates
    let currentDate = new Date(from);
    while (currentDate <= to) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      
      if (!salesByDay[dateString]) {
        salesByDay[dateString] = 0;
      }
      
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    
    // Format for chart
    return Object.entries(salesByDay)
      .map(([date, amount]) => ({
        date: format(new Date(date), 'MMM dd'),
        amount: Number(amount) // Ensure amount is a number
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching sales trend:', error);
    throw error;
  }
}

// Get top items for dashboard
export async function fetchTopItems(dateRange: DateRange) {
  try {
    const { from, to = new Date() } = dateRange;
    
    // Format dates for Supabase query
    const fromDate = format(from, 'yyyy-MM-dd');
    const toDate = format(to, 'yyyy-MM-dd');
    
    // Query to count items and their quantities
    const { data, error } = await supabase
      .from('orders')
      .select('item_id, quantity')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
    
    if (error) throw error;
    
    // Group and sum quantities by item
    const itemQuantities = {};
    
    data.forEach(order => {
      const itemId = order.item_id;
      
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = 0;
      }
      
      itemQuantities[itemId] += order.quantity || 1;
    });
    
    // Get top N items by quantity
    const topItemIds = Object.entries(itemQuantities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
    
    if (topItemIds.length === 0) {
      return [];
    }
    
    // Fetch item details
    const { data: itemsData, error: itemsError } = await supabase
      .from('items')
      .select('item_id, item_name, item_price')
      .in('item_id', topItemIds);
    
    if (itemsError) throw itemsError;
    
    // Format for chart - match the TopItem interface with the quantity property
    return topItemIds.map(id => {
      const item = itemsData.find(item => item.item_id === id);
      
      return {
        name: item ? item.item_name : `Item ${id}`,
        quantity: itemQuantities[id],
        price: item ? item.item_price : 0
      };
    });
  } catch (error) {
    console.error('Error fetching top items:', error);
    throw error;
  }
}
