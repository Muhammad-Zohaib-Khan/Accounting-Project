import { create } from 'zustand';

interface PeriodState {
  startDate: Date;
  endDate: Date;
  setDateRange: (start: Date, end: Date) => void;
}

// Set default date range to current month
const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

export const usePeriodStore = create<PeriodState>((set) => ({
  startDate: firstDayOfMonth,
  endDate: lastDayOfMonth,
  setDateRange: (start, end) => set({ startDate: start, endDate: end }),
}));