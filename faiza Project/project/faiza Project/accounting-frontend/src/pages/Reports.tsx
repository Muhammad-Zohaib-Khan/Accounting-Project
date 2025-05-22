import React, { useState } from 'react';
import { 
  BarChart2, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { useAccountStore } from '../stores/accountStore';
import { useTransactionStore } from '../stores/transactionStore';
import { usePeriodStore } from '../stores/periodStore';
import { generatePDF, exportCSV } from '../utils/reportGenerator';

type ReportType = 'trialBalance' | 'incomeStatement' | 'balanceSheet' | 'generalLedger' | 'transactionList';

const Reports: React.FC = () => {
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  const { startDate, endDate, setDateRange } = usePeriodStore();
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('trialBalance');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  
  // Handle date range changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(new Date(e.target.value), endDate);
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(startDate, new Date(e.target.value));
  };
  
  // Format date for input
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Report descriptions
  const reportDescriptions: Record<ReportType, string> = {
    trialBalance: 'Shows the balance of all accounts to ensure debits equal credits.',
    incomeStatement: 'Shows revenue and expenses for a specific period, resulting in net income or loss.',
    balanceSheet: 'Shows the financial position with assets, liabilities, and equity at a specific date.',
    generalLedger: 'Shows all transactions organized by account with running balances.',
    transactionList: 'Shows a chronological list of all transactions for the selected period.'
  };
  
  // Report icons
  const reportIcons: Record<ReportType, React.ReactNode> = {
    trialBalance: <BarChart2 size={20} className="text-primary-600" />,
    incomeStatement: <TrendingUp size={20} className="text-success-600" />,
    balanceSheet: <DollarSign size={20} className="text-secondary-600" />,
    generalLedger: <FileText size={20} className="text-accent-600" />,
    transactionList: <Calendar size={20} className="text-primary-600" />
  };
  
  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
  
  // Generate report data based on selected type
  const generateReport = () => {
    // This is a simplified implementation
    // In a real-world app, you would generate the appropriate report based on the selected type
    switch (selectedReportType) {
      case 'trialBalance':
        if (exportFormat === 'pdf') {
          generateTrialBalancePDF();
        } else {
          exportTrialBalanceCSV();
        }
        break;
      case 'incomeStatement':
        if (exportFormat === 'pdf') {
          generateIncomeStatementPDF();
        } else {
          exportIncomeStatementCSV();
        }
        break;
      case 'balanceSheet':
        if (exportFormat === 'pdf') {
          generateBalanceSheetPDF();
        } else {
          exportBalanceSheetCSV();
        }
        break;
      case 'generalLedger':
        if (exportFormat === 'pdf') {
          generateGeneralLedgerPDF();
        } else {
          exportGeneralLedgerCSV();
        }
        break;
      case 'transactionList':
        if (exportFormat === 'pdf') {
          generateTransactionListPDF();
        } else {
          exportTransactionListCSV();
        }
        break;
    }
  };
  
  // Generate trial balance PDF
  const generateTrialBalancePDF = () => {
    // Calculate account balances
    const accountBalances = accounts.map(account => {
      // Calculate balance based on transactions
      const accountTransactions = filteredTransactions.filter(t => t.accountId === account.id);
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
    
    generatePDF({
      title: 'Trial Balance',
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
  
  // Export trial balance CSV
  const exportTrialBalanceCSV = () => {
    // Similar implementation to PDF but using CSV export
    const accountBalances = accounts.map(account => {
      // Calculate balance based on transactions
      const accountTransactions = filteredTransactions.filter(t => t.accountId === account.id);
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
        "Account Number": account.number,
        "Account Name": account.name,
        "Debit": debitBalance > 0 ? debitBalance.toFixed(2) : '',
        "Credit": creditBalance > 0 ? creditBalance.toFixed(2) : ''
      };
    });
    
    exportCSV(accountBalances, 'trial_balance');
  };
  
  // Generate income statement PDF
  const generateIncomeStatementPDF = () => {
    // Calculate account balances
    const accountBalances = accounts.map(account => {
      // Calculate balance based on transactions
      const accountTransactions = filteredTransactions.filter(t => t.accountId === account.id);
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
    
    const revenueAccounts = accountBalances.filter(account => account.type === 'revenue');
    const expenseAccounts = accountBalances.filter(account => account.type === 'expense');
    
    const totalRevenue = revenueAccounts.reduce((sum, account) => sum + account.balance, 0);
    const totalExpenses = expenseAccounts.reduce((sum, account) => sum + account.balance, 0);
    const netIncome = totalRevenue - totalExpenses;
    
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
  };
  
  // Export income statement CSV
  const exportIncomeStatementCSV = () => {
    // Similar implementation to PDF but using CSV export
    // Implementation omitted for brevity
    const data = [{ dummy: 'data' }];
    exportCSV(data, 'income_statement');
  };
  
  // Generate balance sheet PDF
  const generateBalanceSheetPDF = () => {
    // Similar implementation to income statement
    // Implementation omitted for brevity
    generatePDF({
      title: 'Balance Sheet',
      subtitle: `As of ${endDate.toLocaleDateString()}`,
      data: { dummy: 'data' },
      type: 'balanceSheet'
    });
  };
  
  // Export balance sheet CSV
  const exportBalanceSheetCSV = () => {
    // Implementation omitted for brevity
    const data = [{ dummy: 'data' }];
    exportCSV(data, 'balance_sheet');
  };
  
  // Generate general ledger PDF
  const generateGeneralLedgerPDF = () => {
    // Implementation omitted for brevity
    generatePDF({
      title: 'General Ledger',
      subtitle: `Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      data: { dummy: 'data' },
      type: 'generalLedger'
    });
  };
  
  // Export general ledger CSV
  const exportGeneralLedgerCSV = () => {
    // Implementation omitted for brevity
    const data = [{ dummy: 'data' }];
    exportCSV(data, 'general_ledger');
  };
  
  // Generate transaction list PDF
  const generateTransactionListPDF = () => {
    // Implementation omitted for brevity
    generatePDF({
      title: 'Transaction List',
      subtitle: `Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      data: { dummy: 'data' },
      type: 'transactionList'
    });
  };
  
  // Export transaction list CSV
  const exportTransactionListCSV = () => {
    // Implementation omitted for brevity
    const data = [{ dummy: 'data' }];
    exportCSV(data, 'transaction_list');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Report Type</h2>
          <div className="space-y-2">
            {(['trialBalance', 'incomeStatement', 'balanceSheet', 'generalLedger', 'transactionList'] as ReportType[]).map((type) => (
              <div
                key={type}
                onClick={() => setSelectedReportType(type)}
                className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                  selectedReportType === type 
                    ? 'bg-primary-50 border border-primary-200' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="mr-3">{reportIcons[type]}</div>
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {type === 'trialBalance' 
                      ? 'Trial Balance' 
                      : type === 'incomeStatement' 
                        ? 'Income Statement' 
                        : type === 'balanceSheet' 
                          ? 'Balance Sheet' 
                          : type === 'generalLedger' 
                            ? 'General Ledger'
                            : 'Transaction List'}
                  </h3>
                  <p className="text-sm text-gray-500">{reportDescriptions[type]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Date Range</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={formatDate(startDate)}
                onChange={handleStartDateChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={formatDate(endDate)}
                onChange={handleEndDateChange}
                className="input"
              />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Export Format</h2>
          <div className="space-y-4">
            <div
              onClick={() => setExportFormat('pdf')}
              className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                exportFormat === 'pdf' 
                  ? 'bg-primary-50 border border-primary-200' 
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="mr-3">
                <FileText size={20} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">PDF</h3>
                <p className="text-sm text-gray-500">
                  Generate a formatted PDF document ideal for printing or sharing.
                </p>
              </div>
            </div>
            
            <div
              onClick={() => setExportFormat('csv')}
              className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                exportFormat === 'csv' 
                  ? 'bg-primary-50 border border-primary-200' 
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="mr-3">
                <FileSpreadsheet size={20} className="text-success-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">CSV</h3>
                <p className="text-sm text-gray-500">
                  Export raw data to CSV for spreadsheet analysis or import into other systems.
                </p>
              </div>
            </div>
            
            <button
              onClick={generateReport}
              className="btn btn-primary w-full mt-4 flex items-center justify-center"
            >
              <Download size={18} className="mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Report Preview</h2>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
          <p className="text-gray-500">
            Select a report type and date range, then click "Generate Report" to export your report.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;