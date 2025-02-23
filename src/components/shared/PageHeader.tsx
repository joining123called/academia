import React from 'react';
import clsx from 'clsx';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, children, className }) => (
  <div className={clsx(
    "flex justify-between items-center mb-6",
    className
  )}>
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    {children}
  </div>
);