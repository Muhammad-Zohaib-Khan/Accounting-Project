import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useTransactionStore } from '../stores/transactionStore';
import { useAccountStore } from '../stores/accountStore';

interface TransactionFormProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onClose }) => {
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { accounts } = useAccountStore();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<Transaction>({
    defaultValues: transaction || {
      id: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      accountId: '',
      amount: 0,
      type: 'debit',
    }
  });
  
  const onSubmit = (data: Transaction) => {
    if (transaction) {
      updateTransaction({ ...data, id: transaction.id });
    } else {
      addTransaction(data);
    }
    onClose();
  };
  
  // Group accounts by type for the dropdown
  const accountsByType = accounts.reduce((groups, account) => {
    const type = account.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {} as Record<string, Account[]>);
  
  // Order for account types in the dropdown
  const typeOrder = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                id="date"
                type="date"
                className={`input ${errors.date ? 'border-error-500' : ''}`}
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-error-600">{errors.date.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                id="description"
                type="text"
                className={`input ${errors.description ? 'border-error-500' : ''}`}
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
                Account
              </label>
              <select
                id="accountId"
                className={`input ${errors.accountId ? 'border-error-500' : ''}`}
                {...register('accountId', { required: 'Account is required' })}
              >
                <option value="">Select an account</option>
                {typeOrder.map(type => {
                  const accountsInType = accountsByType[type] || [];
                  if (accountsInType.length === 0) return null;
                  
                  return (
                    <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                      {accountsInType.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.number} - {account.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              {errors.accountId && (
                <p className="mt-1 text-sm text-error-600">{errors.accountId.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  className={`input ${errors.amount ? 'border-error-500' : ''}`}
                  {...register('amount', { 
                    required: 'Amount is required',
                    valueAsNumber: true,
                    min: { value: 0.01, message: 'Amount must be positive' }
                  })}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-error-600">{errors.amount.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  className={`input ${errors.type ? 'border-error-500' : ''}`}
                  {...register('type', { required: 'Type is required' })}
                >
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-error-600">{errors.type.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {transaction ? 'Update Transaction' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;