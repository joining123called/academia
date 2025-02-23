import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTickets } from '../../lib/api/support';
import { TicketFilters, SupportTicket } from '../../types/support';
import { formatTimestamp } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Card } from '../shared/Card';

interface TicketListProps {
  filters?: TicketFilters;
  onTicketClick?: (ticket: SupportTicket) => void;
}

export function TicketList({ filters, onTicketClick }: TicketListProps) {
  const { data: tickets, isLoading } = useQuery(
    ['tickets', filters],
    () => getTickets(filters)
  );

  if (isLoading) {
    return <div>Loading tickets...</div>;
  }

  return (
    <div className="space-y-4">
      {tickets?.map((ticket) => (
        <Card
          key={ticket.id}
          className="hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onTicketClick?.(ticket)}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {ticket.subject}
                </h3>
                <p className="text-sm text-gray-500">
                  #{ticket.ticket_number}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusVariant(ticket.status)}>
                  {ticket.status}
                </Badge>
                <Badge variant={getPriorityVariant(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {ticket.description}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Created {formatTimestamp(ticket.created_at)}</span>
              <span>Category: {ticket.category}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'Open':
      return 'yellow';
    case 'In Progress':
      return 'blue';
    case 'Answered':
      return 'green';
    case 'On Hold':
      return 'orange';
    case 'Closed':
      return 'gray';
    default:
      return 'default';
  }
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case 'Low':
      return 'gray';
    case 'Medium':
      return 'blue';
    case 'High':
      return 'orange';
    case 'Critical':
      return 'red';
    default:
      return 'default';
  }
}