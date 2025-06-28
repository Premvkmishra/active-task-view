import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FolderOpen, 
  CheckSquare, 
  Activity, 
  Download, 
  LogOut,
  User
} from 'lucide-react';
import { logout } from '@/lib/auth';

interface SidebarProps {
  userRole: 'admin' | 'contributor';
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const navItems = [
    { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen, show: true },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, show: true },
    { name: 'Activity Logs', href: '/dashboard/activity-logs', icon: Activity, show: userRole === 'admin' },
    { name: 'Export Tasks', href: '/dashboard/export', icon: Download, show: userRole === 'admin' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Task Tracker</h1>
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <User className="w-4 h-4 mr-2" />
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </div>
      </div>
      
      <nav className="mt-6">
        {navItems
          .filter(item => item.show)
          .map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};
