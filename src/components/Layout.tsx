
import React from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  userRole: 'admin' | 'contributor';
}

export const Layout: React.FC<LayoutProps> = ({ userRole }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userRole={userRole} />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
