import React, { useState } from 'react';
import { usePeriodStore } from '../stores/periodStore';
import { Calendar } from 'lucide-react';

const DateFilter: React.FC = () => {
  const { startDate, endDate, setDateRange } = usePeriodStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(new Date(e.target.value), endDate);
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(startDate, new Date(e.target.value));
  };
  
  // Predefined periods
  const periods = [
    { label: 'This Month', days: 30 },
    { label: 'Last 3 Months', days: 90 },
    { label: 'This Year', days: 365 },
    { label: 'Custom', days: 0 },
  ];
  
  const setPeriod = (days: number) => {
    if (days === 0) {
      setIsOpen(true);
      return;
    }
    
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setDateRange(start, end);
    setIsOpen(false);
  };
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Calendar size={18} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Period:</span>
        </div>
        
        <div className="flex space-x-2">
          {periods.map((period) => (
            <button
              key={period.label}
              onClick={() => setPeriod(period.days)}
              className={`text-sm px-3 py-1 rounded-md ${
                period.days === 0 && isOpen
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        
        <div className="text-sm text-gray-500">
          {formatDate(startDate)} - {formatDate(endDate)}
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute mt-2 p-4 bg-white shadow-lg rounded-md border border-gray-200 z-10 animate-slide-in">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={formatDate(startDate)}
                onChange={handleStartDateChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={formatDate(endDate)}
                onChange={handleEndDateChange}
                className="input"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-primary"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;