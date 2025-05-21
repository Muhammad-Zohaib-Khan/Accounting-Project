import React, { useState } from 'react';
import { useAccountStore } from '../stores/accountStore';
import { useTransactionStore } from '../stores/transactionStore';
import { usePeriodStore } from '../stores/periodStore';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';

const ClosingEntries: React.FC = () => {
  const { accounts } = useAccountStore();
  const { transactions, addTransaction } = useTransactionStore();
  const { startDate, endDate } = usePeriodStore();
  const [isClosingInProgress, setIsClosingInProgress] = useState(false);
  const [closingComplete, setClosingComplete] = useState(false);
  const [closingSteps, setClosingSteps] = useState<{ 
    id: number; 
    description: string; 
    complete: boolean;
    transactions?: any[];
  }[]>([
    { id: 1, description: 'Close revenue accounts to Income Summary', complete: false },
    { id: 2, description: 'Close expense accounts to Income Summary', complete: false },
    { id: 3, description: 'Close Income Summary to Retained Earnings', complete: false },
    { id: 4, description: 'Close Dividends to Retained Earnings', complete: false },
  ]);
  
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
  
  // Get income summary and retained earnings accounts
  const incomeSummaryAccount = accountBalances.find(account => 
    account.name.toLowerCase().includes('income summary')
  );
  
  const retainedEarningsAccount = accountBalances.find(account => 
    account.name.toLowerCase().includes('retained earnings')
  );
  
  // Get revenue and expense accounts
  const revenueAccounts = accountBalances.filter(account => account.type === 'revenue');
  const expenseAccounts = accountBalances.filter(account => account.type === 'expense');
  const dividendsAccount = accountBalances.find(account => 
    account.name.toLowerCase().includes('dividend')
  );
  
  // Calculate totals
  const totalRevenue = revenueAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalExpenses = expenseAccounts.reduce((sum, account) => sum + account.balance, 0);
  const netIncome = totalRevenue - totalExpenses;
  
  // Track if prerequisites are met
  const hasMissingAccounts = !incomeSummaryAccount || !retainedEarningsAccount;
  
  // Handle closing process
  const startClosingProcess = () => {
    setIsClosingInProgress(true);
    
    // Create closing transactions for each step
    const updatedSteps = [...closingSteps];
    
    // Step 1: Close revenue accounts to Income Summary
    if (revenueAccounts.length > 0) {
      const step1Transactions = revenueAccounts.map(account => ({
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: `Closing entry: ${account.name} to Income Summary`,
        accountId: account.id,
        amount: account.balance,
        type: 'debit' // Debit to revenue accounts (decreasing their credit balance)
      }));
      
      // Add corresponding credit to Income Summary
      step1Transactions.push({
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: 'Closing entry: Revenue accounts to Income Summary',
        accountId: incomeSummaryAccount!.id,
        amount: totalRevenue,
        type: 'credit'
      });
      
      updatedSteps[0].transactions = step1Transactions;
      updatedSteps[0].complete = true;
      
      // Add transactions to store
      step1Transactions.forEach(transaction => {
        addTransaction(transaction);
      });
    } else {
      updatedSteps[0].complete = true;
    }
    
    // Step 2: Close expense accounts to Income Summary
    if (expenseAccounts.length > 0) {
      const step2Transactions = expenseAccounts.map(account => ({
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: `Closing entry: ${account.name} to Income Summary`,
        accountId: account.id,
        amount: account.balance,
        type: 'credit' // Credit to expense accounts (decreasing their debit balance)
      }));
      
      // Add corresponding debit to Income Summary
      step2Transactions.push({
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: 'Closing entry: Expense accounts to Income Summary',
        accountId: incomeSummaryAccount!.id,
        amount: totalExpenses,
        type: 'debit'
      });
      
      updatedSteps[1].transactions = step2Transactions;
      updatedSteps[1].complete = true;
      
      // Add transactions to store
      step2Transactions.forEach(transaction => {
        addTransaction(transaction);
      });
    } else {
      updatedSteps[1].complete = true;
    }
    
    // Step 3: Close Income Summary to Retained Earnings
    const step3Transactions = [{
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      description: 'Closing entry: Income Summary to Retained Earnings',
      accountId: incomeSummaryAccount!.id,
      amount: netIncome,
      type: netIncome >= 0 ? 'debit' : 'credit' // Debit if positive (credit balance), credit if negative (debit balance)
    }, {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      description: 'Closing entry: Income Summary to Retained Earnings',
      accountId: retainedEarningsAccount!.id,
      amount: Math.abs(netIncome),
      type: netIncome >= 0 ? 'credit' : 'debit' // Credit if net income is positive, debit if negative
    }];
    
    updatedSteps[2].transactions = step3Transactions;
    updatedSteps[2].complete = true;
    
    // Add transactions to store
    step3Transactions.forEach(transaction => {
      addTransaction(transaction);
    });
    
    // Step 4: Close Dividends to Retained Earnings (if dividends account exists)
    if (dividendsAccount && dividendsAccount.balance > 0) {
      const step4Transactions = [{
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: 'Closing entry: Dividends to Retained Earnings',
        accountId: dividendsAccount.id,
        amount: dividendsAccount.balance,
        type: 'credit' // Credit to dividends account (decreasing debit balance)
      }, {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: 'Closing entry: Dividends to Retained Earnings',
        accountId: retainedEarningsAccount!.id,
        amount: dividendsAccount.balance,
        type: 'debit' // Debit to retained earnings
      }];
      
      updatedSteps[3].transactions = step4Transactions;
      updatedSteps[3].complete = true;
      
      // Add transactions to store
      step4Transactions.forEach(transaction => {
        addTransaction(transaction);
      });
    } else {
      updatedSteps[3].complete = true;
    }
    
    setClosingSteps(updatedSteps);
    setClosingComplete(true);
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Closing Entries</h1>
          <p className="text-sm text-gray-500 mt-1">
            Period: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Period Summary</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue Accounts</h3>
              <div className="space-y-2">
                {revenueAccounts.length > 0 ? (
                  revenueAccounts.map(account => (
                    <div key={account.id} className="flex justify-between">
                      <span>{account.name}</span>
                      <span className="font-medium">${account.balance.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No revenue accounts found</div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium">Total Revenue</span>
                  <span className="font-medium">${totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Expense Accounts</h3>
              <div className="space-y-2">
                {expenseAccounts.length > 0 ? (
                  expenseAccounts.map(account => (
                    <div key={account.id} className="flex justify-between">
                      <span>{account.name}</span>
                      <span className="font-medium">${account.balance.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No expense accounts found</div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium">Total Expenses</span>
                  <span className="font-medium">${totalExpenses.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-3 border-t-2 border-gray-300">
              <span className="font-bold">Net Income</span>
              <span className={`font-bold ${netIncome >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                ${netIncome.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Closing Process</h2>
          
          {hasMissingAccounts ? (
            <div className="bg-warning-50 border border-warning-200 rounded-md p-4 text-warning-800">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-warning-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium">Missing Required Accounts</h3>
                  <div className="mt-2 text-sm">
                    <p>The following accounts are required for closing entries:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {!incomeSummaryAccount && <li>Income Summary account</li>}
                      {!retainedEarningsAccount && <li>Retained Earnings account</li>}
                    </ul>
                    <p className="mt-2">
                      Please create these accounts in the Chart of Accounts before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {closingSteps.map((step) => (
                  <div key={step.id} className="flex items-start">
                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                      step.complete ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.complete ? <Check size={16} /> : step.id}
                    </div>
                    <div>
                      <p className={`${step.complete ? 'text-gray-900' : 'text-gray-600'}`}>
                        {step.description}
                      </p>
                      {step.complete && step.transactions && (
                        <div className="mt-2 text-sm text-gray-500">
                          {step.transactions.map((transaction, index) => (
                            <div key={index} className="ml-2 mb-1">
                              {transaction.description} - ${transaction.amount.toFixed(2)} ({transaction.type})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {!closingComplete ? (
                <button
                  onClick={startClosingProcess}
                  disabled={isClosingInProgress}
                  className={`btn btn-primary w-full ${isClosingInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isClosingInProgress ? 'Processing...' : 'Start Closing Process'}
                </button>
              ) : (
                <div className="bg-success-50 border border-success-200 rounded-md p-4 text-success-800 flex items-center">
                  <Check className="h-5 w-5 text-success-500 mr-3" />
                  <span>Closing entries have been successfully recorded.</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {closingComplete && (
        <div className="mt-6 card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Post-Closing Trial Balance</h2>
          <p className="text-sm text-gray-500 mb-4">
            A post-closing trial balance shows the permanent accounts after all temporary accounts have been closed.
          </p>
          
          <div className="flex justify-center">
            <a 
              href="/trial-balance" 
              className="btn btn-primary flex items-center"
            >
              <ArrowRight size={18} className="mr-2" />
              View Post-Closing Trial Balance
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosingEntries;