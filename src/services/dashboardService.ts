
import { supabase } from '@/lib/supabase';
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
    // Total sales and order count
    const { data: salesData, error: salesError } = await supabase
      .from('orders')
      .select('id, total_amount, delivery_method')
      .gte('order_date', fromDate)
      .lte('order_date', toDate);
      
    if (salesError) throw salesError;
    
    // Calculate metrics
    const totalSales = salesData.reduce((sum, order) => sum + order.total_amount, 0);
    const orderCount = salesData.length;
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
    
    // Delivery vs pickup
    const deliveryCount = salesData.filter(order => order.delivery_method === 'delivery').length;
    const pickupCount = salesData.filter(order => order.delivery_method === 'pickup').length;
    
    return {
      totalSales,
      orderCount,
      avgOrderValue,
      deliveryPercentage: orderCount > 0 ? (deliveryCount / orderCount) * 100 : 0,
      pickupPercentage: orderCount > 0 ? (pickupCount / orderCount) * 100 : 0
    };
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    throw error;
  }
}

// Sales trend data for the last 30 days
export async function fetchSalesTrend(dateRange: DateRange) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('order_date, total_amount')
      .gte('order_date', fromDate)
      .lte('order_date', toDate)
      .order('order_date', { ascending: true });
      
    if (error) throw error;
    
    // Group by date
    const salesByDate = data.reduce((acc, order) => {
      const date = order.order_date.split('T')[0]; // Extract date part
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += order.total_amount;
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
    const { data, error } = await supabase
      .rpc('get_top_selling_items', { 
        start_date: fromDate, 
        end_date: toDate,
        limit_count: 5 
      });
      
    if (error) {
      // If RPC function doesn't exist, fallback to manual query
      console.warn('RPC function not available, using fallback query');
      return fetchTopItemsFallback(fromDate, toDate);
    }
    
    return data.map((item: any) => ({
      name: item.item_name,
      quantity: item.total_quantity
    }));
  } catch (error) {
    console.error('Error fetching top items:', error);
    // Fallback to manual query
    return fetchTopItemsFallback(fromDate, toDate);
  }
}

// Fallback function if RPC is not available
async function fetchTopItemsFallback(fromDate: string, toDate: string) {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        item_id,
        quantity,
        orders!inner(order_date),
        items!inner(name)
      `)
      .gte('orders.order_date', fromDate)
      .lte('orders.order_date', toDate);
      
    if (error) throw error;
    
    // Group and sum by item
    const itemQuantities: Record<string, { name: string, quantity: number }> = {};
    
    data.forEach((orderItem: any) => {
      const itemId = orderItem.item_id;
      const itemName = orderItem.items.name;
      const quantity = orderItem.quantity;
      
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = { name: itemName, quantity: 0 };
      }
      
      itemQuantities[itemId].quantity += quantity;
    });
    
    // Convert to array and sort
    return Object.values(itemQuantities)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  } catch (error) {
    console.error('Error in fallback query for top items:', error);
    return [];
  }
}
