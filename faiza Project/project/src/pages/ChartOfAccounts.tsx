import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useAccountStore } from '../stores/accountStore';
import AccountForm from '../components/AccountForm';

const ChartOfAccounts: React.FC = () => {
  const { accounts, removeAccount } = useAccountStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleAddAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };
  
  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };
  
  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      removeAccount(id);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };
  
  // Filter accounts based on search term
  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.number.toString().includes(searchTerm.toLowerCase()) ||
    account.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group accounts by type
  const groupedAccounts = filteredAccounts.reduce((groups, account) => {
    const type = account.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {} as Record<string, Account[]>);
  
  // Order for account types
  const typeOrder = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  
  // Sort grouped accounts
  const sortedGroupedAccounts = Object.entries(groupedAccounts)
    .sort(([typeA], [typeB]) => {
      return typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB);
    });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 md:mb-0">Chart of Accounts</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button onClick={handleAddAccount} className="btn btn-primary flex items-center">
            <Plus size={18} className="mr-1" />
            Add Account
          </button>
        </div>
      </div>
      
      {sortedGroupedAccounts.length > 0 ? (
        sortedGroupedAccounts.map(([type, accounts]) => (
          <div key={type} className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 capitalize mb-3">{type} Accounts</h2>
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Account Number</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id}>
                        <td>{account.number}</td>
                        <td className="font-medium">{account.name}</td>
                        <td>{account.description}</td>
                        <td>${account.balance.toFixed(2)}</td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditAccount(account)}
                              className="p-1 text-gray-500 hover:text-primary-600"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="p-1 text-gray-500 hover:text-error-600"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No accounts found. Add an account to get started.</p>
          <button onClick={handleAddAccount} className="btn btn-primary mt-4">
            Add Your First Account
          </button>
        </div>
      )}
      
      {isModalOpen && (
        <AccountForm 
          account={editingAccount} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default ChartOfAccounts;