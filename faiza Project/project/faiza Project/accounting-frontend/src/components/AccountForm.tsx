import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useAccountStore } from '../stores/accountStore';

interface AccountFormProps {
  account: Account | null;
  onClose: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ account, onClose }) => {
  const { addAccount, updateAccount } = useAccountStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<Account>({
    defaultValues: account || {
      id: '',
      number: '',
      name: '',
      description: '',
      type: 'asset',
      balance: 0,
    }
  });
  
  const onSubmit = (data: Account) => {
    if (account) {
      updateAccount({ ...data, id: account.id });
    } else {
      addAccount(data);
    }
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {account ? 'Edit Account' : 'Add New Account'}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  id="number"
                  type="text"
                  className={`input ${errors.number ? 'border-error-500' : ''}`}
                  {...register('number', { required: 'Account number is required' })}
                />
                {errors.number && (
                  <p className="mt-1 text-sm text-error-600">{errors.number.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  id="type"
                  className={`input ${errors.type ? 'border-error-500' : ''}`}
                  {...register('type', { required: 'Account type is required' })}
                >
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-error-600">{errors.type.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <input
                id="name"
                type="text"
                className={`input ${errors.name ? 'border-error-500' : ''}`}
                {...register('name', { required: 'Account name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="input"
                {...register('description')}
              />
            </div>
            
            <div>
              <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
                Initial Balance
              </label>
              <input
                id="balance"
                type="number"
                step="0.01"
                className={`input ${errors.balance ? 'border-error-500' : ''}`}
                {...register('balance', { valueAsNumber: true })}
              />
              {errors.balance && (
                <p className="mt-1 text-sm text-error-600">{errors.balance.message}</p>
              )}
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
              {account ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;