
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ChartContainer } from "@/components/analysis/ChartContainer";
import { BarChart } from "@/components/analysis/BarChart";
import { FilterToolbar, FilterItem } from "@/components/analysis/FilterToolbar";
import { DateRangePicker } from "@/components/analysis/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Mock data
const mockStaffHours = [
  { name: "John Doe", hours: 38, cost: 570 },
  { name: "Jane Smith", hours: 42, cost: 630 },
  { name: "Mike Johnson", hours: 35, cost: 525 },
  { name: "Sarah Williams", hours: 40, cost: 600 },
  { name: "David Brown", hours: 32, cost: 480 },
];

const mockShiftCoverage = [
  { day: "Monday", morning: 3, afternoon: 4, evening: 5 },
  { day: "Tuesday", morning: 2, afternoon: 3, evening: 4 },
  { day: "Wednesday", morning: 3, afternoon: 4, evening: 5 },
  { day: "Thursday", morning: 3, afternoon: 3, evening: 4 },
  { day: "Friday", morning: 4, afternoon: 5, evening: 6 },
  { day: "Saturday", morning: 5, afternoon: 6, evening: 7 },
  { day: "Sunday", morning: 4, afternoon: 5, evening: 6 },
];

const mockShiftSchedule = [
  { 
    id: 1, 
    name: "John Doe", 
    role: "Manager", 
    monday: "9AM-5PM", 
    tuesday: "9AM-5PM", 
    wednesday: "OFF", 
    thursday: "9AM-5PM", 
    friday: "9AM-5PM", 
    saturday: "OFF", 
    sunday: "OFF" 
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    role: "Chef", 
    monday: "8AM-4PM", 
    tuesday: "8AM-4PM", 
    wednesday: "8AM-4PM", 
    thursday: "8AM-4PM", 
    friday: "OFF", 
    saturday: "OFF", 
    sunday: "12PM-8PM" 
  },
  { 
    id: 3, 
    name: "Mike Johnson", 
    role: "Server", 
    monday: "4PM-10PM", 
    tuesday: "4PM-10PM", 
    wednesday: "4PM-10PM", 
    thursday: "OFF", 
    friday: "4PM-10PM", 
    saturday: "4PM-10PM", 
    sunday: "OFF" 
  },
  { 
    id: 4, 
    name: "Sarah Williams", 
    role: "Server", 
    monday: "OFF", 
    tuesday: "4PM-10PM", 
    wednesday: "4PM-10PM", 
    thursday: "4PM-10PM", 
    friday: "4PM-10PM", 
    saturday: "12PM-8PM", 
    sunday: "OFF" 
  },
  { 
    id: 5, 
    name: "David Brown", 
    role: "Delivery", 
    monday: "5PM-10PM", 
    tuesday: "OFF", 
    wednesday: "5PM-10PM", 
    thursday: "5PM-10PM", 
    friday: "5PM-10PM", 
    saturday: "5PM-10PM", 
    sunday: "5PM-10PM" 
  },
];

const StaffManagement = () => {
  return (
    <DashboardLayout title="Staff Management">
      <Tabs defaultValue="hours" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="hours">Staff Hours & Costs</TabsTrigger>
          <TabsTrigger value="coverage">Shift Coverage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hours" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={(range) => console.log(range)} />
            </FilterItem>
            <FilterItem label="Staff ID (Optional)">
              <Select>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="1">John Doe</SelectItem>
                  <SelectItem value="2">Jane Smith</SelectItem>
                  <SelectItem value="3">Mike Johnson</SelectItem>
                  <SelectItem value="4">Sarah Williams</SelectItem>
                  <SelectItem value="5">David Brown</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
            <FilterItem label="Role">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="chef">Chef</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
          </FilterToolbar>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer title="Staff Hours">
              <BarChart 
                data={mockStaffHours}
                bars={[{ dataKey: "hours", fill: "hsl(var(--primary))" }]}
                xAxisDataKey="name"
                tooltipFormatter={(value, name) => [`${value} hours`, "Hours Worked"]}
                height={300}
              />
            </ChartContainer>
            
            <ChartContainer title="Staff Costs">
              <BarChart 
                data={mockStaffHours}
                bars={[{ dataKey: "cost", fill: "#10b981" }]}
                xAxisDataKey="name"
                yAxisFormatter={(value) => `$${value}`}
                tooltipFormatter={(value, name) => [`$${value}`, "Cost"]}
                height={300}
              />
            </ChartContainer>
          </div>
          
          <ChartContainer title="Staff Efficiency">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Orders Processed</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">John Doe</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell>38</TableCell>
                    <TableCell>120</TableCell>
                    <TableCell>3.2 orders/hour</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">High</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Jane Smith</TableCell>
                    <TableCell>Chef</TableCell>
                    <TableCell>42</TableCell>
                    <TableCell>168</TableCell>
                    <TableCell>4.0 orders/hour</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">High</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Mike Johnson</TableCell>
                    <TableCell>Server</TableCell>
                    <TableCell>35</TableCell>
                    <TableCell>87</TableCell>
                    <TableCell>2.5 orders/hour</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500">Medium</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sarah Williams</TableCell>
                    <TableCell>Server</TableCell>
                    <TableCell>40</TableCell>
                    <TableCell>112</TableCell>
                    <TableCell>2.8 orders/hour</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">High</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">David Brown</TableCell>
                    <TableCell>Delivery</TableCell>
                    <TableCell>32</TableCell>
                    <TableCell>64</TableCell>
                    <TableCell>2.0 orders/hour</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500">Medium</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="coverage" className="space-y-6">
          <FilterToolbar>
            <FilterItem label="Date Range">
              <DateRangePicker onRangeChange={(range) => console.log(range)} />
            </FilterItem>
            <FilterItem label="Day of Week">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </FilterItem>
          </FilterToolbar>
          
          <ChartContainer title="Staff Coverage by Day and Shift">
            <BarChart 
              data={mockShiftCoverage}
              bars={[
                { dataKey: "morning", fill: "#10b981", name: "Morning (8AM-2PM)" },
                { dataKey: "afternoon", fill: "hsl(var(--primary))", name: "Afternoon (2PM-8PM)" },
                { dataKey: "evening", fill: "#f59e0b", name: "Evening (8PM-12AM)" }
              ]}
              xAxisDataKey="day"
              tooltipFormatter={(value, name) => [`${value} staff`, name]}
              height={300}
            />
          </ChartContainer>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Monday</TableHead>
                      <TableHead>Tuesday</TableHead>
                      <TableHead>Wednesday</TableHead>
                      <TableHead>Thursday</TableHead>
                      <TableHead>Friday</TableHead>
                      <TableHead>Saturday</TableHead>
                      <TableHead>Sunday</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockShiftSchedule.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.role}</TableCell>
                        <TableCell>
                          {staff.monday === "OFF" ? (
                            <Badge variant="outline" className="text-muted-foreground">OFF</Badge>
                          ) : (
                            staff.monday
                          )}
                        </TableCell>
                        <TableCell>
                          {staff.tuesday === "OFF" ? (
                            <Badge variant="outline" className="text-muted-foreground">OFF</Badge>
                          ) : (
                            staff.tuesday
                          )}
                        </TableCell>
                        <TableCell>
                          {staff.wednesday === "OFF" ? (
                            <Badge variant="outline" className="text-muted-foreground">OFF</Badge>
                          ) : (
                            staff.wednesday
                          )}
                        </TableCell>
                        <TableCell>
                          {staff.thursday === "OFF" ? (
                            <Badge variant="outline" className="text-muted-foreground">OFF</Badge>
                          ) : (
                            staff.thursday
                          )}
                        </TableCell>
                        <TableCell>
                          {staff.friday === "OFF" ? (
                            <Badge variant="outline" className="text-muted-foreground">OFF</Badge>
                          ) : (
                            staff.friday
                          )}
                        </TableCell>
                        <TableCell>
                          {staff.saturday === "OFF" ? (
                            <Badge variant="outline" className="text-muted-foreground">OFF</Badge>
                          ) : (
                            staff.saturday
                          )}
                        </TableCell>
                        <TableCell>
                          {staff.sunday === "OFF" ? (
                            <Badge variant="outline" className="text-muted-foreground">OFF</Badge>
                          ) : (
                            staff.sunday
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default StaffManagement;
