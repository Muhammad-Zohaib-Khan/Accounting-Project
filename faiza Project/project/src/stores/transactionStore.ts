import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  accountId: string;
  amount: number;
  type: 'debit' | 'credit';
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transactionData: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [
        {
          id: '1',
          date: '2025-01-15',
          description: 'Initial sale to customer',
          accountId: '6',
          amount: 1000,
          type: 'credit',
        },
        {
          id: '2',
          date: '2025-01-15',
          description: 'Initial sale to customer',
          accountId: '1',
          amount: 1000,
          type: 'debit',
        },
        {
          id: '3',
          date: '2025-01-20',
          description: 'Rent payment for office',
          accountId: '8',
          amount: 800,
          type: 'debit',
        },
        {
          id: '4',
          date: '2025-01-20',
          description: 'Rent payment for office',
          accountId: '1',
          amount: 800,
          type: 'credit',
        },
        {
          id: '5',
          date: '2025-01-25',
          description: 'Utility bill payment',
          accountId: '9',
          amount: 200,
          type: 'debit',
        },
        {
          id: '6',
          date: '2025-01-25',
          description: 'Utility bill payment',
          accountId: '1',
          amount: 200,
          type: 'credit',
        },
      ],
      addTransaction: (transactionData) => set((state) => ({
        transactions: [...state.transactions, { 
          ...transactionData, 
          id: transactionData.id || uuidv4() 
        }],
      })),
      updateTransaction: (updatedTransaction) => set((state) => ({
        transactions: state.transactions.map((transaction) =>
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        ),
      })),
      removeTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((transaction) => transaction.id !== id),
      })),
    }),
    {
      name: 'transaction-storage',
    }
  )
);