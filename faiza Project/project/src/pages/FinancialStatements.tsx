import React, { useState } from 'react';
import { useAccountStore } from '../stores/accountStore';
import { useTransactionStore } from '../stores/transactionStore';
import { usePeriodStore } from '../stores/periodStore';
import { Download, FileText } from 'lucide-react';
import { generatePDF } from '../utils/reportGenerator';

type StatementType = 'income' | 'balance';

const FinancialStatements: React.FC = () => {
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  const { startDate, endDate } = usePeriodStore();
  const [statementType, setStatementType] = useState<StatementType>('income');
  
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
    
    return {
      ...account,
      balance
    };
  });
  
  // Income Statement Data
  const revenueAccounts = accountBalances.filter(account => account.type === 'revenue');
  const expenseAccounts = accountBalances.filter(account => account.type === 'expense');
  
  const totalRevenue = revenueAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalExpenses = expenseAccounts.reduce((sum, account) => sum + account.balance, 0);
  const netIncome = totalRevenue - totalExpenses;
  
  // Balance Sheet Data
  const assetAccounts = accountBalances.filter(account => account.type === 'asset');
  const liabilityAccounts = accountBalances.filter(account => account.type === 'liability');
  const equityAccounts = accountBalances.filter(account => account.type === 'equity');
  
  const totalAssets = assetAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalEquity = equityAccounts.reduce((sum, account) => sum + account.balance, 0) + netIncome;
  
  // Download financial statement as PDF
  const handleDownloadPDF = () => {
    if (statementType === 'income') {
      generatePDF({
        title: 'Income Statement',
        subtitle: `Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        data: {
          revenues: revenueAccounts.map(account => ({
            accountName: account.name,
            amount: account.balance.toFixed(2)
          })),
          expenses: expenseAccounts.map(account => ({
            accountName: account.name,
            amount: account.balance.toFixed(2)
          }))
        },
        totals: {
          totalRevenue: totalRevenue.toFixed(2),
          totalExpenses: totalExpenses.toFixed(2),
          netIncome: netIncome.toFixed(2)
        },
        type: 'incomeStatement'
      });
    } else {
      generatePDF({
        title: 'Balance Sheet',
        subtitle: `As of ${endDate.toLocaleDateString()}`,
        data: {
          assets: assetAccounts.map(account => ({
            accountName: account.name,
            amount: account.balance.toFixed(2)
          })),
          liabilities: liabilityAccounts.map(account => ({
            accountName: account.name,
            amount: account.balance.toFixed(2)
          })),
          equity: [
            ...equityAccounts.map(account => ({
              accountName: account.name,
              amount: account.balance.toFixed(2)
            })),
            {
              accountName: 'Retained Earnings',
              amount: netIncome.toFixed(2)
            }
          ]
        },
        totals: {
          totalAssets: totalAssets.toFixed(2),
          totalLiabilities: totalLiabilities.toFixed(2),
          totalEquity: totalEquity.toFixed(2)
        },
        type: 'balanceSheet'
      });
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Financial Statements</h1>
          <p className="text-sm text-gray-500 mt-1">
            {statementType === 'income' ? 
              `Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}` : 
              `As of ${endDate.toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStatementType('income')}
              className={`px-3 py-1 text-sm rounded-md ${
                statementType === 'income' 
                  ? 'bg-primary-100 text-primary-700 font-medium' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Income Statement
            </button>
            <button
              onClick={() => setStatementType('balance')}
              className={`px-3 py-1 text-sm rounded-md ${
                statementType === 'balance' 
                  ? 'bg-primary-100 text-primary-700 font-medium' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Balance Sheet
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
        statementType === 'income' ? (
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Income Statement
              </h2>
              
              {/* Revenue section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Revenue</h3>
                <div className="space-y-2">
                  {revenueAccounts.length > 0 ? (
                    revenueAccounts.map(account => (
                      <div key={account.id} className="flex justify-between">
                        <span>{account.name}</span>
                        <span className="font-medium">${account.balance.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-2">No revenue accounts found</div>
                  )}
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
                  <span>Total Revenue</span>
                  <span>${totalRevenue.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Expenses section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Expenses</h3>
                <div className="space-y-2">
                  {expenseAccounts.length > 0 ? (
                    expenseAccounts.map(account => (
                      <div key={account.id} className="flex justify-between">
                        <span>{account.name}</span>
                        <span className="font-medium">${account.balance.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-2">No expense accounts found</div>
                  )}
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
                  <span>Total Expenses</span>
                  <span>${totalExpenses.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Net Income */}
              <div className="border-t-2 border-gray-300 pt-4 mt-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Net Income</span>
                  <span className={netIncome >= 0 ? 'text-success-600' : 'text-error-600'}>
                    ${netIncome.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Balance Sheet
              </h2>
              
              {/* Assets section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Assets</h3>
                <div className="space-y-2">
                  {assetAccounts.length > 0 ? (
                    assetAccounts.map(account => (
                      <div key={account.id} className="flex justify-between">
                        <span>{account.name}</span>
                        <span className="font-medium">${account.balance.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-2">No asset accounts found</div>
                  )}
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
                  <span>Total Assets</span>
                  <span>${totalAssets.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Liabilities section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Liabilities</h3>
                <div className="space-y-2">
                  {liabilityAccounts.length > 0 ? (
                    liabilityAccounts.map(account => (
                      <div key={account.id} className="flex justify-between">
                        <span>{account.name}</span>
                        <span className="font-medium">${account.balance.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-2">No liability accounts found</div>
                  )}
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
                  <span>Total Liabilities</span>
                  <span>${totalLiabilities.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Equity section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Equity</h3>
                <div className="space-y-2">
                  {equityAccounts.length > 0 ? (
                    equityAccounts.map(account => (
                      <div key={account.id} className="flex justify-between">
                        <span>{account.name}</span>
                        <span className="font-medium">${account.balance.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-2">No equity accounts found</div>
                  )}
                  <div className="flex justify-between">
                    <span>Retained Earnings</span>
                    <span className="font-medium">${netIncome.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
                  <span>Total Equity</span>
                  <span>${totalEquity.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Total Liabilities and Equity */}
              <div className="border-t-2 border-gray-300 pt-4 mt-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Liabilities and Equity</span>
                  <span>${(totalLiabilities + totalEquity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="card p-8 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No accounts or transactions found for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default FinancialStatements;