// Account Types
interface Account {
  id: string;
  number: string;
  name: string;
  description: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
}

// Transaction Types
interface Transaction {
  id: string;
  date: string;
  description: string;
  accountId: string;
  amount: number;
  type: 'debit' | 'credit';
}

// Augment JSX to allow importing jsPDF modules
declare module 'jspdf-autotable' {}