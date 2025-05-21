import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface TrialBalanceData {
  accountNumber: string;
  accountName: string;
  debit: string;
  credit: string;
}

interface IncomeStatementData {
  revenues: { accountName: string; amount: string }[];
  expenses: { accountName: string; amount: string }[];
}

interface BalanceSheetData {
  assets: { accountName: string; amount: string }[];
  liabilities: { accountName: string; amount: string }[];
  equity: { accountName: string; amount: string }[];
}

interface GeneralLedgerData {
  accountName: string;
  transactions: {
    date: string;
    description: string;
    debit: string;
    credit: string;
    balance: string;
  }[];
}

type PDFReportType = 'trialBalance' | 'incomeStatement' | 'balanceSheet' | 'generalLedger' | 'transactionList';

interface PDFReportOptions {
  title: string;
  subtitle: string;
  data: any;
  totals?: any;
  type: PDFReportType;
}

export const generatePDF = (options: PDFReportOptions) => {
  const { title, subtitle, data, totals, type } = options;
  
  // Create PDF document
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: title,
    subject: subtitle,
    creator: 'Accounting Cycle App',
  });
  
  // Add title and subtitle
  doc.setFontSize(18);
  doc.text(title, 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(subtitle, 105, 22, { align: 'center' });
  
  // Add current date
  const currentDate = format(new Date(), 'PPP');
  doc.setFontSize(10);
  doc.text(`Generated on: ${currentDate}`, 195, 10, { align: 'right' });
  
  // Generate report based on type
  switch (type) {
    case 'trialBalance':
      generateTrialBalanceReport(doc, data, totals);
      break;
    case 'incomeStatement':
      generateIncomeStatementReport(doc, data, totals);
      break;
    case 'balanceSheet':
      generateBalanceSheetReport(doc, data, totals);
      break;
    case 'generalLedger':
      generateGeneralLedgerReport(doc, data);
      break;
    case 'transactionList':
      generateTransactionListReport(doc, data);
      break;
  }
  
  // Save or open PDF
  doc.save(`${type.toLowerCase()}.pdf`);
};

// Trial Balance Report
const generateTrialBalanceReport = (doc: any, data: TrialBalanceData[], totals?: any) => {
  // Table headers
  const headers = [['Account Number', 'Account Name', 'Debit', 'Credit']];
  
  // Table body
  const body = data.map(item => [
    item.accountNumber,
    item.accountName,
    item.debit ? `$${item.debit}` : '',
    item.credit ? `$${item.credit}` : ''
  ]);
  
  // Add totals row
  if (totals) {
    body.push(['', 'Totals', `$${totals.debit}`, `$${totals.credit}`]);
  }
  
  // Generate table
  (doc as any).autoTable({
    head: headers,
    body: body,
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    footStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 248, 255] },
  });
};

// Income Statement Report
const generateIncomeStatementReport = (doc: any, data: IncomeStatementData, totals?: any) => {
  let yPosition = 30;
  
  // Revenue section
  doc.setFontSize(14);
  doc.text('Revenue', 14, yPosition);
  yPosition += 10;
  
  if (data.revenues.length > 0) {
    // Table headers
    const revenueHeaders = [['Account', 'Amount']];
    
    // Table body
    const revenueBody = data.revenues.map(item => [
      item.accountName,
      `$${item.amount}`
    ]);
    
    // Add total revenue row
    if (totals) {
      revenueBody.push(['Total Revenue', `$${totals.totalRevenue}`]);
    }
    
    // Generate table
    (doc as any).autoTable({
      head: revenueHeaders,
      body: revenueBody,
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 248, 255] },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.text('No revenue accounts found', 14, yPosition);
    yPosition += 10;
  }
  
  // Expense section
  doc.setFontSize(14);
  doc.text('Expenses', 14, yPosition);
  yPosition += 10;
  
  if (data.expenses.length > 0) {
    // Table headers
    const expenseHeaders = [['Account', 'Amount']];
    
    // Table body
    const expenseBody = data.expenses.map(item => [
      item.accountName,
      `$${item.amount}`
    ]);
    
    // Add total expenses row
    if (totals) {
      expenseBody.push(['Total Expenses', `$${totals.totalExpenses}`]);
    }
    
    // Generate table
    (doc as any).autoTable({
      head: expenseHeaders,
      body: expenseBody,
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 248, 255] },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.text('No expense accounts found', 14, yPosition);
    yPosition += 10;
  }
  
  // Net Income
  if (totals) {
    doc.setFontSize(14);
    doc.text('Net Income', 14, yPosition);
    yPosition += 10;
    
    // Table for net income
    const netIncomeHeaders = [['', 'Amount']];
    const netIncomeBody = [['Net Income', `$${totals.netIncome}`]];
    
    // Generate table
    (doc as any).autoTable({
      head: netIncomeHeaders,
      body: netIncomeBody,
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 248, 255] },
    });
  }
};

// Balance Sheet Report
const generateBalanceSheetReport = (doc: any, data: BalanceSheetData, totals?: any) => {
  // Implementation similar to Income Statement but with assets, liabilities, and equity sections
  // Omitted for brevity
};

// General Ledger Report
const generateGeneralLedgerReport = (doc: any, data: GeneralLedgerData[]) => {
  // Implementation for general ledger report
  // Omitted for brevity
};

// Transaction List Report
const generateTransactionListReport = (doc: any, data: any) => {
  // Implementation for transaction list report
  // Omitted for brevity
};

// Export data to CSV
export const exportCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }
  
  // Get headers from first data row
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV rows
  const csvRows = [];
  
  // Add headers row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values with commas, quotes, etc.
      return `"${value}"`;
    });
    csvRows.push(values.join(','));
  }
  
  // Combine all rows into a single CSV string
  const csvString = csvRows.join('\n');
  
  // Create a Blob for file download
  const blob = new Blob([csvString], { type: 'text/csv' });
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(a);
  
  // Trigger download
  a.click();
  
  // Clean up
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};