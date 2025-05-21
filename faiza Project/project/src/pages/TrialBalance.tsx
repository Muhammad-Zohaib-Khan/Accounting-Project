import React, { useState } from 'react';
import { useAccountStore } from '../stores/accountStore';
import { useTransactionStore } from '../stores/transactionStore';
import { usePeriodStore } from '../stores/periodStore';
import { Download, FileText } from 'lucide-react';
import { generatePDF } from '../utils/reportGenerator';

const TrialBalance: React.FC = () => {
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  const { startDate, endDate } = usePeriodStore();
  const [isAdjusted, setIsAdjusted] = useState(false);
  
  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
  
  // Calculate account balances based on transactions
  const accountBalances = accounts.map(account => {
    // Get transactions for this account
    const accountTransactions = filteredTransactions.filter(
      t => t.accountId === account.id
    );
    
    // Calculate balance based on transactions
    let balance = account.balance;
    
    accountTransactions.forEach(transaction => {
      if (transaction.type === 'debit') {
        if (['asset', 'expense'].includes(account.type)) {
          balance += transaction.amount;
        } else {
          balance -= transaction.amount;
        }
      } else {
        if (['asset', 'expense'].includes(account.type)) {
          balance -= transaction.amount;
        } else {
          balance += transaction.amount;
        }
      }
    });
    
    // Split balance into debit and credit columns
    let debitBalance = 0;
    let creditBalance = 0;
    
    if (['asset', 'expense'].includes(account.type)) {
      if (balance > 0) {
        debitBalance = balance;
      } else {
        creditBalance = Math.abs(balance);
      }
    } else {
      if (balance > 0) {
        creditBalance = balance;
      } else {
        debitBalance = Math.abs(balance);
      }
    }
    
    return {
      ...account,
      debitBalance,
      creditBalance
    };
  });
  
  // Calculate totals
  const totalDebit = accountBalances.reduce((sum, account) => sum + account.debitBalance, 0);
  const totalCredit = accountBalances.reduce((sum, account) => sum + account.creditBalance, 0);
  
  // Check if debits equal credits (balanced)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01; // Allow for small rounding errors
  
  // Group accounts by type
  const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  const groupedAccounts = accountTypes.reduce((groups, type) => {
    groups[type] = accountBalances.filter(account => account.type === type);
    return groups;
  }, {} as Record<string, (Account & { debitBalance: number; creditBalance: number })[]>);
  
  // Download trial balance as PDF
  const handleDownloadPDF = () => {
    generatePDF({
      title: isAdjusted ? 'Adjusted Trial Balance' : 'Unadjusted Trial Balance',
      subtitle: `Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      data: accountBalances.map(account => ({
        accountNumber: account.number,
        accountName: account.name,
        debit: account.debitBalance > 0 ? account.debitBalance.toFixed(2) : '',
        credit: account.creditBalance > 0 ? account.creditBalance.toFixed(2) : ''
      })),
      totals: {
        debit: totalDebit.toFixed(2),
        credit: totalCredit.toFixed(2)
      },
      type: 'trialBalance'
    });
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isAdjusted ? 'Adjusted Trial Balance' : 'Unadjusted Trial Balance'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Period: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAdjusted(false)}
              className={`px-3 py-1 text-sm rounded-md ${
                !isAdjusted 
                  ? 'bg-primary-100 text-primary-700 font-medium' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Unadjusted
            </button>
            <button
              onClick={() => setIsAdjusted(true)}
              className={`px-3 py-1 text-sm rounded-md ${
                isAdjusted 
                  ? 'bg-primary-100 text-primary-700 font-medium' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Adjusted
            </button>
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
      
      {accountBalances.length > 0 ? (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Account Name</th>
                  <th>Debit</th>
                  <th>Credit</th>
                </tr>
              </thead>
              <tbody>
                {accountTypes.map(type => {
                  const accountsOfType = groupedAccounts[type] || [];
                  if (accountsOfType.length === 0) return null;
                  
                  return (
                    <React.Fragment key={type}>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="font-medium text-gray-700 capitalize">
                          {type} Accounts
                        </td>
                      </tr>
                      {accountsOfType.map(account => (
                        <tr key={account.id}>
                          <td>{account.number}</td>
                          <td>{account.name}</td>
                          <td className="font-medium">
                            {account.debitBalance > 0 ? `$${account.debitBalance.toFixed(2)}` : ''}
                          </td>
                          <td className="font-medium">
                            {account.creditBalance > 0 ? `$${account.creditBalance.toFixed(2)}` : ''}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
                <tr className="border-t-2 border-gray-200 font-medium">
                  <td colSpan={2} className="text-right pr-4">Total</td>
                  <td>${totalDebit.toFixed(2)}</td>
                  <td>${totalCredit.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className={`p-4 border-t border-gray-200 flex justify-between items-center`}>
            <span className="font-medium">Balance Status:</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isBalanced 
                ? 'bg-success-100 text-success-800' 
                : 'bg-error-100 text-error-800'
            }`}>
              {isBalanced ? 'Balanced' : 'Not Balanced'}
            </span>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No accounts or transactions found for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default TrialBalance;