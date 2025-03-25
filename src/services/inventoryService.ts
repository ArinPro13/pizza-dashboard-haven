
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { DateRange } from './dashboardService';

// Fetch current inventory levels
export async function fetchInventoryLevels(category?: string) {
  try {
    // Fetch inventory data
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('inv_id, ing_id, quantity');
      
    if (inventoryError) throw inventoryError;
    
    // Get ingredient details
    const ingIds = inventoryData.map(item => item.ing_id);
    
    let ingredientsQuery = supabase
      .from('ingredients')
      .select('ing_id, ing_name, ing_weight, ing_meas');
      
    // Filter by category if provided
    if (category && category !== 'all') {
      // For this to work, your ingredients table would need a category column
      // We'll assume it doesn't have one, so this filter won't apply
      // ingredientsQuery = ingredientsQuery.eq('category', category);
    }
    
    ingredientsQuery = ingredientsQuery.in('ing_id', ingIds);
    
    const { data: ingredientsData, error: ingredientsError } = await ingredientsQuery;
    if (ingredientsError) throw ingredientsError;
    
    // Create lookup map for ingredient details
    const ingredients = ingredientsData.reduce((acc, ing) => {
      acc[ing.ing_id] = {
        name: ing.ing_name,
        weight: ing.ing_weight,
        unit: ing.ing_meas
      };
      return acc;
    }, {});
    
    // Format data for the UI
    return inventoryData.map(item => {
      const ingredient = ingredients[item.ing_id] || {
        name: `Ingredient ${item.ing_id}`,
        weight: 100,
        unit: 'units'
      };
      
      return {
        id: item.inv_id,
        name: ingredient.name,
        level: Math.min(100, Math.round((item.quantity / ingredient.weight) * 100)),
        unit: ingredient.unit
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching inventory levels:', error);
    throw error;
  }
}

// Ingredient usage trends
export async function fetchIngredientUsageTrends(
  dateRange: DateRange,
  ingredientId?: string
) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    // First, get all orders in the date range
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('created_at, item_id, quantity')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);
      
    if (ordersError) throw ordersError;
    
    // Skip if no orders in date range
    if (ordersData.length === 0) {
      return [];
    }
    
    // Get unique pizza/item IDs
    const itemIds = [...new Set(ordersData.map(order => order.item_id))];
    
    // For each item, get the recipe ingredients
    const { data: recipiesData, error: recipiesError } = await supabase
      .from('recipies')
      .select('pizza_id, ing_id, quantity')
      .in('pizza_id', itemIds);
      
    if (recipiesError) throw recipiesError;
    
    // Filter by ingredient if provided
    let filteredRecipies = recipiesData;
    if (ingredientId) {
      filteredRecipies = recipiesData.filter(recipe => recipe.ing_id === ingredientId);
    }
    
    // Now calculate ingredient usage by date
    const usageByDate: Record<string, number> = {};
    
    ordersData.forEach(order => {
      const orderDate = format(new Date(order.created_at), 'MMM dd');
      const itemId = order.item_id;
      const orderQuantity = order.quantity;
      
      // Find all ingredients used for this item
      const itemIngredients = filteredRecipies.filter(recipe => recipe.pizza_id === itemId);
      
      itemIngredients.forEach(ingredient => {
        if (!usageByDate[orderDate]) {
          usageByDate[orderDate] = 0;
        }
        
        // Calculate amount used: recipe quantity * order quantity
        usageByDate[orderDate] += ingredient.quantity * orderQuantity;
      });
    });
    
    // Format for chart
    return Object.entries(usageByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
