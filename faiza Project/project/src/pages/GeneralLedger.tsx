import React, { useState } from 'react';
import { useAccountStore } from '../stores/accountStore';
import { useTransactionStore } from '../stores/transactionStore';
import { usePeriodStore } from '../stores/periodStore';
import { Search, Download, FileText } from 'lucide-react';
import { generatePDF } from '../utils/reportGenerator';

const GeneralLedger: React.FC = () => {
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  const { startDate, endDate } = usePeriodStore();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter transactions based on date range, selected account, and search term
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const dateInRange = transactionDate >= startDate && transactionDate <= endDate;
    const accountMatches = selectedAccountId === 'all' || transaction.accountId === selectedAccountId;
    
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return dateInRange && accountMatches && matchesSearch;
  });
  
  // Sort transactions by date (oldest first) and then by account
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    // First sort by date
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    
    // Then by account
    return a.accountId.localeCompare(b.accountId);
  });
  
  // Group transactions by account
  const groupedTransactions = sortedTransactions.reduce((groups, transaction) => {
    const accountId = transaction.accountId;
    if (!groups[accountId]) {
      groups[accountId] = [];
    }
    groups[accountId].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
  
  // Calculate account balances after each transaction
  const accountsWithBalances = Object.keys(groupedTransactions).map(accountId => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return null;
    
    let runningBalance = account.balance;
    const transactionsWithBalance = groupedTransactions[accountId].map(transaction => {
      if (transaction.type === 'debit') {
        if (['asset', 'expense'].includes(account.type)) {
          runningBalance += transaction.amount;
        } else {
          runningBalance -= transaction.amount;
        }
      } else {
        if (['asset', 'expense'].includes(account.type)) {
          runningBalance -= transaction.amount;
        } else {
          runningBalance += transaction.amount;
        }
      }
      
      return {
        ...transaction,
        balance: runningBalance
      };
    });
    
    return {
      ...account,
      transactions: transactionsWithBalance
    };
  }).filter(Boolean) as (Account & { transactions: (Transaction & { balance: number })[] })[];
  
  // Download general ledger as PDF
  const handleDownloadPDF = () => {
    generatePDF({
      title: 'General Ledger',
      subtitle: `Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      data: accountsWithBalances.map(account => ({
        accountName: `${account.number} - ${account.name}`,
        transactions: account.transactions.map(tx => ({
          date: new Date(tx.date).toLocaleDateString(),
          description: tx.description,
          debit: tx.type === 'debit' ? tx.amount.toFixed(2) : '',
          credit: tx.type === 'credit' ? tx.amount.toFixed(2) : '',
          balance: tx.balance.toFixed(2)
        }))
      })),
      type: 'generalLedger'
    });
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 md:mb-0">General Ledger</h1>
        <div className="flex items-center space-x-2">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="input"
          >
            <option value="all">All Accounts</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.number} - {account.name}
              </option>
            ))}
          </select>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          <button 
            onClick={handleDownloadPDF}
            className="btn btn-secondary flex items-center"
          >
            <Download size={18} className="mr-1" />
            Export PDF
          </button>
        </div>
      </div>
      
      {accountsWithBalances.length > 0 ? (
        accountsWithBalances.map(account => (
          <div key={account.id} className="mb-8 card">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">
                {account.number} - {account.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{account.description}</p>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {account.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.description}</td>
                      <td>
                        {transaction.type === 'debit' ? `$${transaction.amount.toFixed(2)}` : ''}
                      </td>
                      <td>
                        {transaction.type === 'credit' ? `$${transaction.amount.toFixed(2)}` : ''}
                      </td>
                      <td className="font-medium">${transaction.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="card p-8 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No transactions found for the selected period and account.</p>
        </div>
      )}
    </div>
  );
};

export default GeneralLedger;