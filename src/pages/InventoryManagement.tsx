
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ChartContainer } from "@/components/analysis/ChartContainer";
import { BarChart } from "@/components/analysis/BarChart";
import { LineChart } from "@/components/analysis/LineChart";
import { FilterToolbar, FilterItem } from "@/components/analysis/FilterToolbar";
import { DateRangePicker } from "@/components/analysis/DateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

// Mock data
const mockIngredientLevels = [
  { name: "Cheese", level: 75, unit: "lb" },
  { name: "Pepperoni", level: 45, unit: "lb" },
  { name: "Dough", level: 85, unit: "lb" },
  { name: "Tomato Sauce", level: 60, unit: "gal" },
  { name: "Mushrooms", level: 35, unit: "lb" },
  { name: "Bell Peppers", level: 40, unit: "lb" },
  { name: "Onions", level: 50, unit: "lb" },
  { name: "Olives", level: 25, unit: "lb" },
  { name: "Bacon", level: 30, unit: "lb" },
];

const mockIngredientUsage = [
  { date: "May 01", amount: 12 },
  { date: "May 02", amount: 18 },
  { date: "May 03", amount: 15 },
  { date: "May 04", amount: 20 },
  { date: "May 05", amount: 22 },
  { date: "May 06", amount: 16 },
  { date: "May 07", amount: 14 },
  { date: "May 08", amount: 19 },
  { date: "May 09", amount: 23 },
  { date: "May 10", amount: 25 },
  { date: "May 11", amount: 18 },
  { date: "May 12", amount: 16 },
];

const InventoryManagement = () => {
  return (
    <DashboardLayout title="Inventory Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <FilterToolbar>
            <FilterItem label="Ingredient Category">
              <Select defaultValue="all">
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
              <Select defaultValue="name">
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
            <div className="p-6 space-y-6">
              {mockIngredientLevels.map((ingredient) => (
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
          </ChartContainer>
        </div>
        
        <div>
          <ChartContainer title="Reorder Status">
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Needs Reordering</h4>
                <div className="space-y-2">
                  {mockIngredientLevels
                    .filter(i => i.level < 30)
                    .map((ingredient) => (
                      <div key={ingredient.name} className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm">{ingredient.name}</span>
                        <Badge variant="destructive" className="text-xs">
                          {ingredient.level}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Low Stock</h4>
                <div className="space-y-2">
                  {mockIngredientLevels
                    .filter(i => i.level >= 30 && i.level < 50)
                    .map((ingredient) => (
                      <div key={ingredient.name} className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm">{ingredient.name}</span>
                        <Badge variant="outline" className="text-xs text-amber-500 border-amber-500">
                          {ingredient.level}%
                        </Badge>
                      </div>
                    ))}
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
                <DateRangePicker onRangeChange={(range) => console.log(range)} />
              </FilterItem>
              <FilterItem label="Ingredient">
                <Select defaultValue="cheese">
                  <SelectTrigger className="w-[200px] h-9">
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheese">Cheese</SelectItem>
                    <SelectItem value="pepperoni">Pepperoni</SelectItem>
                    <SelectItem value="dough">Dough</SelectItem>
                    <SelectItem value="sauce">Tomato Sauce</SelectItem>
                  </SelectContent>
                </Select>
              </FilterItem>
              <FilterItem label="Unit">
                <Select defaultValue="pounds">
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
            
            <LineChart 
              data={mockIngredientUsage}
              lines={[{ dataKey: "amount", stroke: "hsl(var(--primary))" }]}
              xAxisDataKey="date"
              yAxisFormatter={(value) => `${value} lb`}
              tooltipFormatter={(value, name) => [`${value} lb`, "Usage"]}
              height={300}
            />
          </div>
        </ChartContainer>
      </div>
    </DashboardLayout>
  );
};

export default InventoryManagement;
