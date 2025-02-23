import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TicketList } from '../../components/support/TicketList';
import { TicketForm } from '../../components/support/TicketForm';
import { TicketDetails } from '../../components/support/TicketDetails';
import { SupportTicket } from '../../types/support';
import { Card } from '../../components/shared/Card';
import { HelpCircle, Plus } from 'lucide-react';

export default function Support() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowNewTicketForm(false);
  };

  const handleNewTicketClick = () => {
    setSelectedTicket(null);
    setShowNewTicketForm(true);
  };

  const handleTicketCreated = () => {
    setShowNewTicketForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <button
          onClick={handleNewTicketClick}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Support Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Tickets</h2>
            </div>
            <div className="p-6">
              <TicketList onTicketClick={handleTicketClick} />
            </div>
          </Card>
        </div>

        {/* Ticket Details or New Ticket Form */}
        <div className="lg:col-span-1">
          <Card>
            {showNewTicketForm ? (
              <>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Create New Ticket</h2>
                </div>
                <div className="p-6">
                  <TicketForm
                    onSuccess={handleTicketCreated}
                    onCancel={() => setShowNewTicketForm(false)}
                  />
                </div>
              </>
            ) : selectedTicket ? (
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
                  Or create a new ticket to get help from our support team
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}