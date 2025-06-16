export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  paidUsers: number;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  averageAttendance: number;
}

export interface AdminDashboardStats {
  users: UserStats;
  events: EventStats;
  revenueData: {
    monthly: number;
    yearly: number;
    growth: number;
  };
}