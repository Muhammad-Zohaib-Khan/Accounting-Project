import React, { useState } from 'react';
import { Plus, Search, FileText, Edit, Trash2 } from 'lucide-react';
import { useTransactionStore } from '../stores/transactionStore';
import TransactionForm from '../components/TransactionForm';
import { usePeriodStore } from '../stores/periodStore';

const Transactions: React.FC = () => {
  const { transactions, removeTransaction } = useTransactionStore();
  const { startDate, endDate } = usePeriodStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };
  
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      removeTransaction(id);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };
  
  // Filter transactions based on date range and search term
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const dateInRange = transactionDate >= startDate && transactionDate <= endDate;
    
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accountId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return dateInRange && (searchTerm === '' || matchesSearch);
  });
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 md:mb-0">Transactions</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button onClick={handleAddTransaction} className="btn btn-primary flex items-center">
            <Plus size={18} className="mr-1" />
            Add Transaction
          </button>
        </div>
      </div>
      
      <div className="card">
        {sortedTransactions.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.accountId}</td>
                    <td className="font-medium">${transaction.amount.toFixed(2)}</td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'debit'
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-secondary-100 text-secondary-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="p-1 text-gray-500 hover:text-primary-600"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
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
        ) : (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">No transactions found for the selected period.</p>
            <button onClick={handleAddTransaction} className="btn btn-primary mt-4">
              Add Your First Transaction
            </button>
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <TransactionForm 
          transaction={editingTransaction} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default Transactions;