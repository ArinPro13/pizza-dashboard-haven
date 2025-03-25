
import { supabase } from '@/integrations/supabase/client';
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
    // First, get the shift assignments in the date range
    let rotaQuery = supabase
      .from('rota')
      .select('staff_id, shift_id, date')
      .gte('date', fromDate)
      .lte('date', toDate);
      
    // Filter by staff ID if provided
    if (staffId) {
      rotaQuery = rotaQuery.eq('staff_id', staffId);
    }
    
    const { data: rotaData, error: rotaError } = await rotaQuery;
    if (rotaError) throw rotaError;
    
    // Skip if no shifts in date range
    if (rotaData.length === 0) {
      return [];
    }
    
    // Get shift details
    const shiftIds = [...new Set(rotaData.map(rota => rota.shift_id))];
    
    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .select('shift_id, start_time, end_time')
      .in('shift_id', shiftIds);
      
    if (shiftsError) throw shiftsError;
    
    // Create lookup map for shift duration
    const shiftDurations = shiftsData.reduce((acc, shift) => {
      const startTime = new Date(`1970-01-01T${shift.start_time}Z`);
      const endTime = new Date(`1970-01-01T${shift.end_time}Z`);
      
      // Calculate duration in hours
      let hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Handle shifts that cross midnight
      if (hours < 0) {
        hours += 24;
      }
      
      acc[shift.shift_id] = hours;
      return acc;
    }, {});
    
    // Get staff details
    const staffIds = [...new Set(rotaData.map(rota => rota.staff_id))];
    
    let staffQuery = supabase
      .from('staffs')
      .select('staff_id, first_name, last_name, hourly_rate, position');
      
    // Filter by role if provided
    if (role && role !== 'all') {
      staffQuery = staffQuery.eq('position', role);
    }
    
    staffQuery = staffQuery.in('staff_id', staffIds);
    
    const { data: staffData, error: staffError } = await staffQuery;
    if (staffError) throw staffError;
    
    // Create lookup map for staff details
    const staffDetails = staffData.reduce((acc, staff) => {
      acc[staff.staff_id] = {
        name: `${staff.first_name} ${staff.last_name}`,
        hourlyRate: staff.hourly_rate,
        position: staff.position
      };
      return acc;
    }, {});
    
    // Calculate hours and costs per staff member
    const staffHours: Record<string, { name: string, hours: number, cost: number }> = {};
    
    rotaData.forEach(rota => {
      const staffId = rota.staff_id;
      const shiftId = rota.shift_id;
      
      // Skip if staff or shift details not found
      if (!staffDetails[staffId] || !shiftDurations[shiftId]) return;
      
      const staffName = staffDetails[staffId].name;
      const hourlyRate = staffDetails[staffId].hourlyRate;
      const hours = shiftDurations[shiftId];
      const cost = hours * hourlyRate;
      
      if (!staffHours[staffId]) {
        staffHours[staffId] = { name: staffName, hours: 0, cost: 0 };
      }
      
      staffHours[staffId].hours += hours;
      staffHours[staffId].cost += cost;
    });
    
    // Format for charts
    return Object.values(staffHours).map(staff => ({
      name: staff.name,
      hours: Math.round(staff.hours * 10) / 10, // Round to 1 decimal place
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
    // Get rota data for the date range
    const { data: rotaData, error: rotaError } = await supabase
      .from('rota')
      .select('date, shift_id')
      .gte('date', fromDate)
      .lte('date', toDate);
      
    if (rotaError) throw rotaError;
    
    // Skip if no shifts in date range
    if (rotaData.length === 0) {
      return [];
    }
    
    // Get shift details
    const shiftIds = [...new Set(rotaData.map(rota => rota.shift_id))];
    
    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .select('shift_id, start_time, day_of_week');
      
    if (shiftsError) throw shiftsError;
    
    // Create lookup map for shift timing
    const shiftTimes = shiftsData.reduce((acc, shift) => {
      acc[shift.shift_id] = {
        startTime: shift.start_time,
        dayOfWeek: shift.day_of_week
      };
      return acc;
    }, {});
    
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
    
    rotaData.forEach(rota => {
      const shiftId = rota.shift_id;
      const shiftInfo = shiftTimes[shiftId];
      
      // Skip if shift info not found
      if (!shiftInfo) return;
      
      const day = shiftInfo.dayOfWeek || format(new Date(rota.date), 'EEEE'); // Use shift day or date's day
      
      // Skip if we're filtering by day of week
      if (dayOfWeek && dayOfWeek !== 'all' && day !== dayOfWeek) {
        return;
      }
      
      const startTimeStr = shiftInfo.startTime;
      
      // Parse hour from time string (assuming format like "09:00:00")
      const hour = parseInt(startTimeStr.split(':')[0], 10);
      
      // Categorize by shift time
      if (hour >= 6 && hour < 12) {
        shiftCoverage[day].morning += 1;
      } else if (hour >= 12 && hour < 18) {
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
    // Get staff details
    let staffQuery = supabase
      .from('staffs')
      .select('staff_id, first_name, last_name, position');
      
    // Filter by staff ID if provided
    if (staffId) {
      staffQuery = staffQuery.eq('staff_id', staffId);
    }
    
    // Filter by role if provided
    if (role && role !== 'all') {
      staffQuery = staffQuery.eq('position', role);
    }
    
    const { data: staffData, error: staffError } = await staffQuery;
    if (staffError) throw staffError;
    
    // Skip if no staff members found
    if (staffData.length === 0) {
      return [];
    }
    
    // Get rota data for these staff members
    const staffIds = staffData.map(staff => staff.staff_id);
    
    const { data: rotaData, error: rotaError } = await supabase
      .from('rota')
      .select('staff_id, shift_id, date')
      .in('staff_id', staffIds)
      .gte('date', fromDate)
      .lte('date', toDate);
      
    if (rotaError) throw rotaError;
    
    // Get shift details
    const shiftIds = [...new Set(rotaData.map(rota => rota.shift_id))];
    
    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .select('shift_id, start_time, end_time, day_of_week');
      
    if (shiftsError) throw shiftsError;
    
    // Create lookup map for shift details
    const shiftDetails = shiftsData.reduce((acc, shift) => {
      acc[shift.shift_id] = {
        startTime: shift.start_time,
        endTime: shift.end_time,
        dayOfWeek: shift.day_of_week
      };
      return acc;
    }, {});
    
    // Group shifts by staff member and day of week
    const staffSchedule: Record<string, any> = {};
    
    staffData.forEach(staff => {
      staffSchedule[staff.staff_id] = {
        id: staff.staff_id,
        name: `${staff.first_name} ${staff.last_name}`,
        role: staff.position,
        monday: "OFF",
        tuesday: "OFF",
        wednesday: "OFF",
        thursday: "OFF",
        friday: "OFF",
        saturday: "OFF",
        sunday: "OFF"
      };
    });
    
    rotaData.forEach(rota => {
      const staffId = rota.staff_id;
      const shiftId = rota.shift_id;
      const shiftInfo = shiftDetails[shiftId];
      
      // Skip if shift info not found
      if (!shiftInfo) return;
      
      // Get day of week from shift or from date
      let day = shiftInfo.dayOfWeek?.toLowerCase() || 
                format(new Date(rota.date), 'EEEE').toLowerCase();
      
      // Format the shift time
      const startTimeStr = shiftInfo.startTime;
      const endTimeStr = shiftInfo.endTime;
      
      // Format hours to 12-hour format with AM/PM
      const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${hour12}${period}`;
      };
      
      const formattedStart = formatTime(startTimeStr);
      const formattedEnd = formatTime(endTimeStr);
      
      // Update the schedule for this staff member
      if (staffSchedule[staffId]) {
        staffSchedule[staffId][day] = `${formattedStart}-${formattedEnd}`;
      }
    });
    
    // Convert to array
    return Object.values(staffSchedule);
  } catch (error) {
    console.error('Error fetching staff schedule:', error);
    throw error;
  }
}
