import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationMessageProps {
  message: string;
  type: 'error' | 'warning' | 'success';
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ message, type }) => {
  const colors = {
    error: 'text-red-600 bg-red-50 border-red-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    success: 'text-green-600 bg-green-50 border-green-200'
  };

  return (
    <div className={`flex items-center p-2 mt-1 text-sm rounded-lg border ${colors[type]}`}>
      <AlertCircle className="h-4 w-4 mr-2" />
      <span>{message}</span>
    </div>
  );
};