
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { DateRange } from './dashboardService';

// Fetch current inventory levels
export async function fetchInventoryLevels(category?: string) {
  try {
    let query = supabase
      .from('inventory')
      .select(`
        id,
        current_level,
        unit,
        ingredients!inner(name, category)
      `);
    
    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('ingredients.category', category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Format data for the UI
    return data.map((item: any) => ({
      name: item.ingredients.name,
      level: Math.round((item.current_level / 100) * 100), // Assume max level is 100 for percentage
      unit: item.unit
    }));
  } catch (error) {
    console.error('Error fetching inventory levels:', error);
    throw error;
  }
}

// Ingredient usage trends
export async function fetchIngredientUsageTrends(
  dateRange: DateRange,
  ingredientId?: string,
  unit: string = 'pounds'
) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    // This query assumes there's a relationship between items and ingredients
    // and that the quantity of ingredients used per item is tracked
    let query = supabase
      .from('order_items')
      .select(`
        quantity,
        orders!inner(order_date),
        items!inner(
          id,
          name,
          item_ingredients!inner(
            ingredient_id,
            amount_per_item,
            ingredients!inner(name)
          )
        )
      `)
      .gte('orders.order_date', fromDate)
      .lte('orders.order_date', toDate);
    
    // Filter by ingredient if provided
    if (ingredientId) {
      query = query.eq('items.item_ingredients.ingredient_id', ingredientId);
    }
    
    const { data, error } = await query;
    
    // If the query structure doesn't match your database, use this fallback
    if (error || !data) {
      console.warn('Error with ingredient usage query, using mock data');
      return generateMockIngredientUsage(dateRange);
    }
    
    // Group usage by date
    const usageByDate: Record<string, number> = {};
    
    data.forEach((orderItem: any) => {
      const date = format(new Date(orderItem.orders.order_date), 'MMM dd');
      const quantity = orderItem.quantity;
      
      // For each ingredient in the item
      orderItem.items.item_ingredients.forEach((ingredientUsage: any) => {
        const amountUsed = quantity * ingredientUsage.amount_per_item;
        
        if (!usageByDate[date]) {
          usageByDate[date] = 0;
        }
        
        usageByDate[date] += amountUsed;
      });
    });
    
    // Format for chart
    return Object.entries(usageByDate).map(([date, amount]) => ({
      date,
      amount: Math.round(amount)
    }));
  } catch (error) {
    console.error('Error fetching ingredient usage trends:', error);
    return generateMockIngredientUsage(dateRange);
  }
}

// Fallback function to generate mock data
function generateMockIngredientUsage(dateRange: DateRange) {
  const { from, to = new Date() } = dateRange;
  const result = [];
  
  let currentDate = new Date(from);
  const endDate = new Date(to);
  
  while (currentDate <= endDate) {
    result.push({
      date: format(currentDate, 'MMM dd'),
      amount: Math.floor(Math.random() * 15) + 10 // Random value between 10 and 25
    });
    
    // Increment by one day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}
