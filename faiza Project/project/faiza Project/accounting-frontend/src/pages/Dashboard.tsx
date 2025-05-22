import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  FileText, 
  BookOpen, 
  BarChart2, 
  FilePlus 
} from 'lucide-react';
import { useAccountStore } from '../stores/accountStore';
import { useTransactionStore } from '../stores/transactionStore';

const Dashboard: React.FC = () => {
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  
  // Calculate summary statistics
  const totalAssets = accounts
    .filter(account => account.type === 'asset')
    .reduce((sum, account) => sum + account.balance, 0);
  
  const totalLiabilities = accounts
    .filter(account => account.type === 'liability')
    .reduce((sum, account) => sum + account.balance, 0);
  
  const totalEquity = accounts
    .filter(account => account.type === 'equity')
    .reduce((sum, account) => sum + account.balance, 0);
  
  const totalRevenue = accounts
    .filter(account => account.type === 'revenue')
    .reduce((sum, account) => sum + account.balance, 0);
  
  const totalExpenses = accounts
    .filter(account => account.type === 'expense')
    .reduce((sum, account) => sum + account.balance, 0);
  
  const netIncome = totalRevenue - totalExpenses;
  
  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const accountingCycleSteps = [
    { 
      name: 'Record Transactions', 
      description: 'Enter and categorize transactions',
      icon: <FileText size={24} className="text-primary-500" />,
      link: '/transactions'
    },
    { 
      name: 'Chart of Accounts', 
      description: 'Manage your list of accounts',
      icon: <BookOpen size={24} className="text-primary-500" />,
      link: '/chart-of-accounts'
    },
    { 
      name: 'General Ledger', 
      description: 'View posted transactions',
      icon: <FileText size={24} className="text-primary-500" />,
      link: '/general-ledger'
    },
    { 
      name: 'Trial Balance', 
      description: 'Ensure debits equal credits',
      icon: <FileText size={24} className="text-secondary-500" />,
      link: '/trial-balance'
    },
    { 
      name: 'Financial Statements', 
      description: 'Generate financial reports',
      icon: <BarChart2 size={24} className="text-secondary-500" />,
      link: '/financial-statements'
    },
    { 
      name: 'Closing Entries', 
      description: 'Close the accounting period',
      icon: <FilePlus size={24} className="text-secondary-500" />,
      link: '/closing-entries'
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Financial summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Income</p>
              <h3 className={`text-2xl font-bold ${netIncome >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                ${netIncome.toFixed(2)}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${netIncome >= 0 ? 'bg-success-100' : 'bg-error-100'}`}>
              {netIncome >= 0 ? 
                <TrendingUp className="h-6 w-6 text-success-600" /> : 
                <TrendingDown className="h-6 w-6 text-error-600" />
              }
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Revenue</p>
              <p className="font-medium text-success-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Expenses</p>
              <p className="font-medium text-error-600">${totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Assets</p>
              <h3 className="text-2xl font-bold text-gray-900">${totalAssets.toFixed(2)}</h3>
            </div>
            <div className="p-3 rounded-full bg-primary-100">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Liabilities</p>
              <p className="font-medium text-gray-900">${totalLiabilities.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Equity</p>
              <p className="font-medium text-gray-900">${totalEquity.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Transactions</p>
              <h3 className="text-2xl font-bold text-gray-900">{transactions.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-secondary-100">
              <CreditCard className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <Link to="/transactions" className="text-primary-600 hover:text-primary-700 font-medium">
              View all transactions &rarr;
            </Link>
          </div>
        </div>
      </div>
      
      {/* Accounting cycle steps */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accounting Cycle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accountingCycleSteps.map((step, index) => (
            <Link 
              key={index} 
              to={step.link}
              className="card p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div>{step.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{step.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
        
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.description}</td>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;