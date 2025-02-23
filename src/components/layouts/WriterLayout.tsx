import React from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';

export default function WriterLayout() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Scrollable content area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}