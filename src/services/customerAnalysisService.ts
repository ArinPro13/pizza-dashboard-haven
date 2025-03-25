
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { DateRange } from './dashboardService';

// Customer order frequency
export async function fetchCustomerOrderFrequency(dateRange: DateRange) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('cust_id, order_id')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
    
    if (error) throw error;
    
    // Count orders per customer
    const customerOrders: Record<string, number> = {};
    
    // Group by order_id to avoid counting duplicates from multiple items
    const orderCustomers = new Map();
    data.forEach(order => {
      if (order.cust_id && order.order_id) {
        orderCustomers.set(order.order_id, order.cust_id);
      }
    });
    
    // Count orders per customer
    orderCustomers.forEach((custId, orderId) => {
      const customerId = custId.toString();
      
      if (!customerOrders[customerId]) {
        customerOrders[customerId] = 0;
      }
      
      customerOrders[customerId] += 1;
    });
    
    // Group into frequency buckets
    const frequencyBuckets: Record<string, number> = {
      "1 order": 0,
      "2-3 orders": 0,
      "4-5 orders": 0,
      "6-10 orders": 0,
      "11+ orders": 0
    };
    
    Object.values(customerOrders).forEach(orderCount => {
      if (orderCount === 1) {
        frequencyBuckets["1 order"] += 1;
      } else if (orderCount >= 2 && orderCount <= 3) {
        frequencyBuckets["2-3 orders"] += 1;
      } else if (orderCount >= 4 && orderCount <= 5) {
        frequencyBuckets["4-5 orders"] += 1;
      } else if (orderCount >= 6 && orderCount <= 10) {
        frequencyBuckets["6-10 orders"] += 1;
      } else {
        frequencyBuckets["11+ orders"] += 1;
      }
    });
    
    // Format for chart
    return Object.entries(frequencyBuckets).map(([frequency, customers]) => ({
      frequency,
      customers
    }));
  } catch (error) {
    console.error('Error fetching customer order frequency:', error);
    throw error;
  }
}

// Customer preferences
export async function fetchCustomerPreferences(
  dateRange: DateRange,
  customerId?: string
) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    let query = supabase
      .from('orders')
      .select('cust_id, item_id, quantity')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
    
    // Filter by customer if provided
    if (customerId) {
      query = query.eq('cust_id', customerId);
    }
    
    const { data: orderData, error: orderError } = await query;
    if (orderError) throw orderError;
    
    // Skip if no orders in date range
    if (orderData.length === 0) {
      return [];
    }
    
    // Get unique item IDs
    const itemIds = [...new Set(orderData.map(order => order.item_id))];
    
    // Fetch item details
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select('item_id, item_name')
      .in('item_id', itemIds);
      
    if (itemError) throw itemError;
    
    // Create lookup map for item names
    const itemNames = itemData.reduce((acc, item) => {
      acc[item.item_id] = item.item_name;
      return acc;
    }, {});
    
    // Group by item
    const itemPreferences: Record<string, number> = {};
    
    orderData.forEach(order => {
      const itemId = order.item_id;
      const itemName = itemNames[itemId] || `Item ${itemId}`;
      
      if (!itemPreferences[itemName]) {
        itemPreferences[itemName] = 0;
      }
      
      itemPreferences[itemName] += order.quantity;
    });
    
    // Convert to array and sort by popularity
    return Object.entries(itemPreferences)
      .map(([item, orders]) => ({ item, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching customer preferences:', error);
    throw error;
  }
}

// Delivery vs pickup preferences
export async function fetchDeliveryPickupPreferences(
  dateRange: DateRange,
  customerId?: string
) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    let query = supabase
      .from('orders')
      .select('created_at, delivery, cust_id')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
    
    // Filter by customer if provided
    if (customerId) {
      query = query.eq('cust_id', customerId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Group by month
    const monthlyPreferences: Record<string, { delivery: number, pickup: number, total: number }> = {};
    
    data.forEach(order => {
      const month = format(new Date(order.created_at), 'MMM');
      
      if (!monthlyPreferences[month]) {
        monthlyPreferences[month] = { delivery: 0, pickup: 0, total: 0 };
      }
      
      if (order.delivery === 1) {
        monthlyPreferences[month].delivery += 1;
      } else {
        monthlyPreferences[month].pickup += 1;
      }
      
      monthlyPreferences[month].total += 1;
    });
    
    // Convert to percentages
    return Object.entries(monthlyPreferences).map(([month, data]) => ({
      month,
      delivery: Math.round((data.delivery / data.total) * 100),
      pickup: Math.round((data.pickup / data.total) * 100)
    }));
  } catch (error) {
    console.error('Error fetching delivery vs pickup preferences:', error);
    throw error;
  }
}
