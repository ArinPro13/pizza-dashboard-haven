
import { supabase } from '@/integrations/supabase/client';
import { addDays, format, subDays } from 'date-fns';

export type DateRange = {
  from: Date;
  to?: Date;
};

// Dashboard KPI metrics
export async function fetchDashboardKPIs(dateRange: DateRange) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    // Total sales amount
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('quantity, item_id, delivery')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
      
    if (orderError) throw orderError;
    
    // Get items to calculate sales
    const itemIds = [...new Set(orderData.map(order => order.item_id))];
    
    // Skip if no orders in date range
    if (itemIds.length === 0) {
      return {
        totalSales: 0,
        orderCount: 0,
        avgOrderValue: 0,
        deliveryPercentage: 0,
        pickupPercentage: 0
      };
    }
    
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select('item_id, item_price')
      .in('item_id', itemIds);
      
    if (itemError) throw itemError;
    
    // Create lookup map for item prices
    const itemPrices = itemData.reduce((acc, item) => {
      acc[item.item_id] = item.item_price;
      return acc;
    }, {});
    
    // Calculate metrics
    let totalSales = 0;
    
    orderData.forEach(order => {
      const price = itemPrices[order.item_id] || 0;
      totalSales += price * order.quantity;
    });
    
    // Count unique order IDs
    const uniqueOrderIds = [...new Set(orderData.map(order => order.order_id))];
    const orderCount = uniqueOrderIds.length;
    
    // Calculate average order value
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
    
    // Count delivery vs pickup orders
    const deliveryCount = orderData.filter(order => order.delivery === 1).length;
    const pickupCount = orderData.filter(order => order.delivery === 0).length;
    const totalCount = deliveryCount + pickupCount;
    
    return {
      totalSales,
      orderCount,
      avgOrderValue,
      deliveryPercentage: totalCount > 0 ? (deliveryCount / totalCount) * 100 : 0,
      pickupPercentage: totalCount > 0 ? (pickupCount / totalCount) * 100 : 0
    };
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    throw error;
  }
}

// Sales trend data for the selected date range
export async function fetchSalesTrend(dateRange: DateRange) {
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
    
    // Fetch item prices
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select('item_id, item_price')
      .in('item_id', itemIds);
      
    if (itemError) throw itemError;
    
    // Create lookup map for item prices
    const itemPrices = itemData.reduce((acc, item) => {
      acc[item.item_id] = item.item_price;
      return acc;
    }, {});
    
    // Group by date
    const salesByDate = orderData.reduce((acc, order) => {
      const date = order.created_at.split('T')[0]; // Extract date part
      const price = itemPrices[order.item_id] || 0;
      const amount = price * order.quantity;
      
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array format expected by charts
    return Object.entries(salesByDate).map(([date, amount]) => ({
      date: format(new Date(date), 'MMM dd'),
      amount
    }));
  } catch (error) {
    console.error('Error fetching sales trend:', error);
    throw error;
  }
}

// Top 5 best-selling items
export async function fetchTopItems(dateRange: DateRange) {
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
    
    // Group and sum by item
    const itemQuantities: Record<string, number> = {};
    
    orderData.forEach(order => {
      const itemId = order.item_id;
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = 0;
      }
      itemQuantities[itemId] += order.quantity;
    });
    
    // Get item details for the top items
    const topItemIds = Object.entries(itemQuantities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([itemId]) => itemId);
      
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select('item_id, item_name')
      .in('item_id', topItemIds);
      
    if (itemError) throw itemError;
    
    // Create lookup map for item names
    const itemNames = itemData.reduce((acc, item) => {
      acc[item.item_id] = item.item_name;
      return acc;
    }, {});
    
    // Format data for the chart
    return Object.entries(itemQuantities)
      .map(([itemId, quantity]) => ({
        name: itemNames[itemId] || `Item ${itemId}`,
        quantity
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching top items:', error);
    throw error;
  }
}
