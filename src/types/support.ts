export type TicketStatus = 'Open' | 'In Progress' | 'Answered' | 'On Hold' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  assigned_to: string | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_internal: boolean;
  attachments: string[];
}

export interface TicketStatusHistory {
  id: string;
  ticket_id: string;
  old_status: TicketStatus | null;
  new_status: TicketStatus;
  changed_by: string;
  changed_at: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  answered: number;
  onHold: number;
  closed: number;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assignedTo?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}