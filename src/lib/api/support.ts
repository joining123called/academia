import { supabase } from '../supabase';
import type { 
  SupportTicket, 
  TicketMessage, 
  TicketStatus,
  TicketPriority,
  TicketFilters 
} from '../../types/support';

export async function createTicket(
  subject: string,
  description: string,
  category: string,
  priority: TicketPriority = 'Medium'
): Promise<SupportTicket> {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      subject,
      description,
      category,
      priority,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTickets(filters?: TicketFilters) {
  let query = supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }
  if (filters?.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start.toISOString())
      .lte('created_at', filters.dateRange.end.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTicketById(id: string) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      messages:ticket_messages(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
) {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function assignTicket(
  ticketId: string,
  assignedTo: string
) {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ assigned_to: assignedTo })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addTicketMessage(
  ticketId: string,
  message: string,
  isInternal: boolean = false
) {
  const { data, error } = await supabase
    .from('ticket_messages')
    .insert({
      ticket_id: ticketId,
      message,
      is_internal: isInternal,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTicketMessages(ticketId: string) {
  const { data, error } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getTicketStatusHistory(ticketId: string) {
  const { data, error } = await supabase
    .from('ticket_status_history')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('changed_at', { ascending: true });

  if (error) throw error;
  return data;
}