import React from 'react';
import clsx from 'clsx';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  color = 'violet',
  className
}) => (
  <div className={clsx(
    "bg-white p-6 rounded-xl shadow-sm border border-gray-200",
    className
  )}>
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Icon className={`h-5 w-5 text-${color}-500`} />
        <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        {trend && (
          <span className={`ml-2 text-sm font-medium text-${color}-600`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);