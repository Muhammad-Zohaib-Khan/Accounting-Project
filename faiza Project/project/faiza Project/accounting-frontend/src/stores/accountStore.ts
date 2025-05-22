import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Account {
  id: string;
  number: string;
  name: string;
  description: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
}

interface AccountState {
  accounts: Account[];
  addAccount: (accountData: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      accounts: [
        {
          id: '1',
          number: '1000',
          name: 'Cash',
          description: 'Cash on hand and in bank accounts',
          type: 'asset',
          balance: 10000,
        },
        {
          id: '2',
          number: '2000',
          name: 'Accounts Payable',
          description: 'Amounts owed to suppliers',
          type: 'liability',
          balance: 5000,
        },
        {
          id: '3',
          number: '3000',
          name: 'Common Stock',
          description: 'Shareholders\' equity',
          type: 'equity',
          balance: 5000,
        },
        {
          id: '4',
          number: '3100',
          name: 'Retained Earnings',
          description: 'Accumulated earnings',
          type: 'equity',
          balance: 0,
        },
        {
          id: '5',
          number: '3200',
          name: 'Income Summary',
          description: 'Temporary account used for closing entries',
          type: 'equity',
          balance: 0,
        },
        {
          id: '6',
          number: '4000',
          name: 'Sales Revenue',
          description: 'Revenue from sales',
          type: 'revenue',
          balance: 0,
        },
        {
          id: '7',
          number: '5000',
          name: 'Cost of Goods Sold',
          description: 'Cost of items sold',
          type: 'expense',
          balance: 0,
        },
        {
          id: '8',
          number: '5100',
          name: 'Rent Expense',
          description: 'Rent for office space',
          type: 'expense',
          balance: 0,
        },
        {
          id: '9',
          number: '5200',
          name: 'Utilities Expense',
          description: 'Utilities for office space',
          type: 'expense',
          balance: 0,
        },
      ],
      addAccount: (accountData) => set((state) => ({
        accounts: [...state.accounts, { ...accountData, id: uuidv4() }],
      })),
      updateAccount: (updatedAccount) => set((state) => ({
        accounts: state.accounts.map((account) =>
          account.id === updatedAccount.id ? updatedAccount : account
        ),
      })),
      removeAccount: (id) => set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== id),
      })),
    }),
    {
      name: 'account-storage',
    }
  )
);