import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTicketById, getTicketMessages, addTicketMessage } from '../../lib/api/support';
import { formatTimestamp } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Card } from '../shared/Card';
import { UserAvatar } from '../ui/UserAvatar';

interface TicketDetailsProps {
  ticketId: string;
  onClose?: () => void;
}

export function TicketDetails({ ticketId, onClose }: TicketDetailsProps) {
  const { data: ticket } = useQuery(
    ['ticket', ticketId],
    () => getTicketById(ticketId)
  );

  const { data: messages } = useQuery(
    ['ticketMessages', ticketId],
    () => getTicketMessages(ticketId)
  );

  const [newMessage, setNewMessage] = React.useState('');

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addTicketMessage(ticketId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!ticket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Ticket Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {ticket.subject}
          </h2>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusVariant(ticket.status)}>
              {ticket.status}
            </Badge>
            <Badge variant={getPriorityVariant(ticket.priority)}>
              {ticket.priority}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>#{ticket.ticket_number}</span>
          <span>{formatTimestamp(ticket.created_at)}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmitMessage}>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: any }) {
  return (
    <div className="flex items-start space-x-3">
      <UserAvatar user={{ id: message.user_id }} size="sm" />
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <p className="text-sm text-gray-900">{message.message}</p>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {formatTimestamp(message.created_at)}
        </div>
      </div>
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