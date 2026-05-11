export type Machine = {
  id: number;
  machine_code: string;
  name: string;
  location?: string | null;
  machine_type?: string | null;
  status: string;
};

export type Technician = {
  id: number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  skill_area?: string | null;
};

export type MaintenanceTicket = {
  id: number;
  ticket_no: string;
  machine_id: number;
  technician_id?: number | null;
  issue_title: string;
  issue_description: string;
  issue_category?: string | null;
  priority: string;
  status: string;

  ai_suggested_priority?: string | null;
  ai_possible_root_cause?: string | null;
  ai_recommended_action?: string | null;
  estimated_repair_hours?: number | null;

  downtime_start?: string | null;
  downtime_end?: string | null;
  root_cause?: string | null;
  action_taken?: string | null;
  spare_parts_used?: string | null;
  created_at: string;
  completed_at?: string | null;
};

export type DashboardSummary = {
  machine_summary: {
    total: number;
    running: number;
    down: number;
    maintenance: number;
  };

  ticket_summary: {
    total: number;
    open: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };

  priority_summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  performance_summary: {
    average_estimated_repair_hours: number;
  };

  recent_critical_tickets: {
    id: number;
    ticket_no: string;
    issue_title: string;
    status: string;
    priority: string;
    estimated_repair_hours?: number | null;
    created_at: string;
  }[];
};