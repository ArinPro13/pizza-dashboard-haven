
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ChartContainer } from "@/components/analysis/ChartContainer";
import { LineChart } from "@/components/analysis/LineChart";
import { FilterToolbar, FilterItem } from "@/components/analysis/FilterToolbar";
import { DateRangePicker } from "@/components/analysis/DateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { fetchInventoryLevels, fetchIngredientUsageTrends } from "@/services/inventoryService";

const InventoryManagement = () => {
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [unit, setUnit] = useState("pounds");

  // Fetch inventory levels
  const { 
    data: inventoryLevels, 
    isLoading: inventoryLoading,
    error: inventoryError
  } = useQuery({
    queryKey: ['inventory-levels', category],
    queryFn: () => fetchInventoryLevels(category),
  });

  // Fetch ingredient usage trends
  const { 
    data: ingredientUsage, 
    isLoading: usageLoading,
    error: usageError
  } = useQuery({
    queryKey: ['ingredient-usage', dateRange, selectedIngredient],
    queryFn: () => fetchIngredientUsageTrends(dateRange, selectedIngredient),
  });

  // Handle errors
  useEffect(() => {
    if (inventoryError) {
      toast.error("Failed to load inventory data");
      console.error("Inventory error:", inventoryError);
    }
    if (usageError) {
      toast.error("Failed to load ingredient usage data");
      console.error("Usage error:", usageError);
    }
  }, [inventoryError, usageError]);

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from) {
      setDateRange({
        from: range.from,
        to: range.to || new Date()
      });
    }
  };

  // Sort inventory items
  const sortedInventory = inventoryLevels ? [...inventoryLevels].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "level-asc") {
      return a.level - b.level;
    } else if (sortBy === "level-desc") {
      return b.level - a.level;
    }
    return 0;
  }) : [];

  // Filter low inventory items
  const lowInventoryItems = sortedInventory?.filter(i => i.level < 30) || [];
  const mediumInventoryItems = sortedInventory?.filter(i => i.level >= 30 && i.level < 50) || [];

  return (
    <DashboardLayout title="Inventory Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <FilterToolbar>
            <FilterItem label="Ingredient Category">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ingredients</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="meat">Meat</SelectItem>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="sauce">Sauces</SelectItem>
                  <SelectItem value="dough">Dough & Bases</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
            <FilterItem label="Sort By">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="level-asc">Level (Low-High)</SelectItem>
                  <SelectItem value="level-desc">Level (High-Low)</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
          </FilterToolbar>
        </div>
        <div className="flex justify-end items-end">
          <Button className="h-9">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Order Supplies
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ChartContainer title="Current Inventory Levels">
            {inventoryLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p>Loading inventory data...</p>
              </div>
            ) : sortedInventory && sortedInventory.length > 0 ? (
              <div className="p-6 space-y-6">
                {sortedInventory.map((ingredient) => (
                  <div key={ingredient.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{ingredient.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {ingredient.level}% ({ingredient.unit})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={ingredient.level} className="h-2" />
                      {ingredient.level < 30 ? (
                        <Badge variant="destructive" className="text-xs">Low</Badge>
                      ) : ingredient.level < 50 ? (
                        <Badge variant="outline" className="text-xs text-amber-500 border-amber-500">Medium</Badge>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p>No inventory data available.</p>
              </div>
            )}
          </ChartContainer>
        </div>
        
        <div>
          <ChartContainer title="Reorder Status">
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Needs Reordering</h4>
                <div className="space-y-2">
                  {lowInventoryItems.length > 0 ? (
                    lowInventoryItems.map((ingredient) => (
                      <div key={ingredient.name} className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm">{ingredient.name}</span>
                        <Badge variant="destructive" className="text-xs">
                          {ingredient.level}%
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No items need reordering at this time.</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Low Stock</h4>
                <div className="space-y-2">
                  {mediumInventoryItems.length > 0 ? (
                    mediumInventoryItems.map((ingredient) => (
                      <div key={ingredient.name} className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm">{ingredient.name}</span>
                        <Badge variant="outline" className="text-xs text-amber-500 border-amber-500">
                          {ingredient.level}%
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No items with low stock.</p>
                  )}
                </div>
              </div>
            </div>
          </ChartContainer>
        </div>
      </div>
      
      <div className="mt-6">
        <ChartContainer title="Ingredient Usage Trends">
          <div className="p-4 space-y-4">
            <FilterToolbar>
              <FilterItem label="Date Range">
                <DateRangePicker onRangeChange={handleDateRangeChange} />
              </FilterItem>
              <FilterItem label="Ingredient">
                <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                  <SelectTrigger className="w-[200px] h-9">
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Ingredients</SelectItem>
                    {inventoryLevels?.map(ing => (
                      <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterItem>
              <FilterItem label="Unit">
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pounds">Pounds</SelectItem>
                    <SelectItem value="gallons">Gallons</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                  </SelectContent>
                </Select>
              </FilterItem>
            </FilterToolbar>
            
            {usageLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p>Loading usage data...</p>
              </div>
            ) : ingredientUsage && ingredientUsage.length > 0 ? (
              <LineChart 
                data={ingredientUsage}
                lines={[{ dataKey: "amount", stroke: "hsl(var(--primary))" }]}
                xAxisDataKey="date"
                yAxisFormatter={(value) => `${value} ${unit === 'pounds' ? 'lb' : unit === 'gallons' ? 'gal' : ''}`}
                tooltipFormatter={(value, name) => [
                  `${value} ${unit === 'pounds' ? 'lb' : unit === 'gallons' ? 'gal' : ''}`, 
                  "Usage"
                ]}
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p>No usage data available for the selected filters.</p>
              </div>
            )}
          </div>
        </ChartContainer>
      </div>
    </DashboardLayout>
  );
};

export default InventoryManagement;
