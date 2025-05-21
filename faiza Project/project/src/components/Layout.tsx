import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  BarChart2,
  FilePlus,
  FileCheck,
  FileSpreadsheet,
  ArrowRightLeft,
  Menu,
  X,
  Calculator
} from 'lucide-react';
import DateFilter from './DateFilter';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/chart-of-accounts', icon: <BookOpen size={20} />, label: 'Chart of Accounts' },
    { to: '/transactions', icon: <ArrowRightLeft size={20} />, label: 'Transactions' },
    { to: '/general-ledger', icon: <FileText size={20} />, label: 'General Ledger' },
    { to: '/trial-balance', icon: <FileCheck size={20} />, label: 'Trial Balance' },
    { to: '/financial-statements', icon: <BarChart2 size={20} />, label: 'Financial Statements' },
    { to: '/closing-entries', icon: <FilePlus size={20} />, label: 'Closing Entries' },
    { to: '/reports', icon: <FileSpreadsheet size={20} />, label: 'Reports' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Calculator className="h-6 w-6 text-primary-600" />
          <h1 className="ml-2 text-xl font-semibold text-gray-900">TransactFlow</h1>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static inset-0 z-20 md:z-0 w-64 bg-white border-r border-gray-200 overflow-y-auto md:h-screen pt-20 md:pt-0`}
      >
        <div className="hidden md:flex items-center p-4 border-b border-gray-200">
          <Calculator className="h-6 w-6 text-primary-600" />
          <h1 className="ml-2 text-xl font-semibold text-gray-900">TransactFlow</h1>
        </div>
        <nav className="space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      
      {/* Content area */}
      <main className="flex-1 p-4 md:p-6 pt-24 md:pt-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <DateFilter />
          </div>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;