
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { DateRange } from './dashboardService';

// Staff hours and costs
export async function fetchStaffHours(
  dateRange: DateRange,
  staffId?: string,
  role?: string
) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    let query = supabase
      .from('shifts')
      .select(`
        hours_worked,
        hourly_rate,
        staff!inner(id, name, role)
      `)
      .gte('start_time', fromDate)
      .lte('end_time', toDate);
    
    // Filter by staff ID if provided
    if (staffId) {
      query = query.eq('staff_id', staffId);
    }
    
    // Filter by role if provided
    if (role && role !== 'all') {
      query = query.eq('staff.role', role);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Group by staff member
    const staffHours: Record<string, { name: string, hours: number, cost: number }> = {};
    
    data.forEach((shift: any) => {
      const staffName = shift.staff.name;
      const hoursWorked = shift.hours_worked;
      const hourlyRate = shift.hourly_rate;
      const cost = hoursWorked * hourlyRate;
      
      if (!staffHours[staffName]) {
        staffHours[staffName] = { name: staffName, hours: 0, cost: 0 };
      }
      
      staffHours[staffName].hours += hoursWorked;
      staffHours[staffName].cost += cost;
    });
    
    // Format for charts
    return Object.values(staffHours).map(staff => ({
      name: staff.name,
      hours: Math.round(staff.hours),
      cost: Math.round(staff.cost)
    }));
  } catch (error) {
    console.error('Error fetching staff hours:', error);
    throw error;
  }
}

// Shift coverage
export async function fetchShiftCoverage(
  dateRange: DateRange,
  dayOfWeek?: string
) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    let query = supabase
      .from('shifts')
      .select(`
        start_time,
        end_time,
        staff!inner(id, name, role)
      `)
      .gte('start_time', fromDate)
      .lte('end_time', toDate);
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Group by day of week and shift time
    const shiftCoverage: Record<string, { morning: number, afternoon: number, evening: number }> = {
      "Monday": { morning: 0, afternoon: 0, evening: 0 },
      "Tuesday": { morning: 0, afternoon: 0, evening: 0 },
      "Wednesday": { morning: 0, afternoon: 0, evening: 0 },
      "Thursday": { morning: 0, afternoon: 0, evening: 0 },
      "Friday": { morning: 0, afternoon: 0, evening: 0 },
      "Saturday": { morning: 0, afternoon: 0, evening: 0 },
      "Sunday": { morning: 0, afternoon: 0, evening: 0 }
    };
    
    data.forEach((shift: any) => {
      const startTime = new Date(shift.start_time);
      const endTime = new Date(shift.end_time);
      const day = format(startTime, 'EEEE'); // Full day name
      const hour = startTime.getHours();
      
      // Skip if we're filtering by day of week
      if (dayOfWeek && dayOfWeek !== 'all' && day !== dayOfWeek) {
        return;
      }
      
      // Categorize by shift time
      if (hour >= 8 && hour < 14) {
        shiftCoverage[day].morning += 1;
      } else if (hour >= 14 && hour < 20) {
        shiftCoverage[day].afternoon += 1;
      } else {
        shiftCoverage[day].evening += 1;
      }
    });
    
    // Format for chart
    return Object.entries(shiftCoverage).map(([day, coverage]) => ({
      day,
      morning: coverage.morning,
      afternoon: coverage.afternoon,
      evening: coverage.evening
    }));
  } catch (error) {
    console.error('Error fetching shift coverage:', error);
    throw error;
  }
}

// Staff schedule
export async function fetchStaffSchedule(
  dateRange: DateRange,
  staffId?: string,
  role?: string
) {
  const { from, to = new Date() } = dateRange;
  
  // Format dates for Supabase query
  const fromDate = format(from, 'yyyy-MM-dd');
  const toDate = format(to, 'yyyy-MM-dd');
  
  try {
    let query = supabase
      .from('shifts')
      .select(`
        id,
        start_time,
        end_time,
        staff!inner(id, name, role)
      `)
      .gte('start_time', fromDate)
      .lte('end_time', toDate);
    
    // Filter by staff ID if provided
    if (staffId) {
      query = query.eq('staff_id', staffId);
    }
    
    // Filter by role if provided
    if (role && role !== 'all') {
      query = query.eq('staff.role', role);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Group shifts by staff member and day of week
    const staffSchedule: Record<string, any> = {};
    
    data.forEach((shift: any) => {
      const staffId = shift.staff.id;
      const staffName = shift.staff.name;
      const staffRole = shift.staff.role;
      const startTime = new Date(shift.start_time);
      const endTime = new Date(shift.end_time);
      const day = format(startTime, 'EEEE').toLowerCase(); // e.g., monday
      
      if (!staffSchedule[staffId]) {
        staffSchedule[staffId] = {
          id: staffId,
          name: staffName,
          role: staffRole,
          monday: "OFF",
          tuesday: "OFF",
          wednesday: "OFF",
          thursday: "OFF",
          friday: "OFF",
          saturday: "OFF",
          sunday: "OFF"
        };
      }
      
      // Format the shift time
      const formattedStart = format(startTime, 'ha').toUpperCase();
      const formattedEnd = format(endTime, 'ha').toUpperCase();
      staffSchedule[staffId][day] = `${formattedStart}-${formattedEnd}`;
    });
    
    // Convert to array
    return Object.values(staffSchedule);
  } catch (error) {
    console.error('Error fetching staff schedule:', error);
    throw error;
  }
}
