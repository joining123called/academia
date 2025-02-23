import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TicketList } from '../../components/support/TicketList';
import { TicketDetails } from '../../components/support/TicketDetails';
import { SupportTicket, TicketFilters } from '../../types/support';
import { Card } from '../../components/shared/Card';
import { HelpCircle, Filter } from 'lucide-react';

export default function AdminSupport() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filters, setFilters] = useState<TicketFilters>({});

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Support Management</h1>
        <button
          onClick={() => {}} // Add filter modal
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <Filter className="h-5 w-5 mr-2" />
          Filter Tickets
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Support Tickets</h2>
            </div>
            <div className="p-6">
              <TicketList
                filters={filters}
                onTicketClick={handleTicketClick}
              />
            </div>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-1">
          <Card>
            {selectedTicket ? (
              <TicketDetails
                ticketId={selectedTicket.id}
                onClose={() => setSelectedTicket(null)}
              />
            ) : (
              <div className="p-6 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a ticket to view details
                </h3>
                <p className="text-sm text-gray-500">
                  Click on any ticket to view and respond to it
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}