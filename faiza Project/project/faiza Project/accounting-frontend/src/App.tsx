import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import ChartOfAccounts from './pages/ChartOfAccounts';
import GeneralLedger from './pages/GeneralLedger';
import TrialBalance from './pages/TrialBalance';
import FinancialStatements from './pages/FinancialStatements';
import ClosingEntries from './pages/ClosingEntries';
import Reports from './pages/Reports';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
        <Route path="general-ledger" element={<GeneralLedger />} />
        <Route path="trial-balance" element={<TrialBalance />} />
        <Route path="financial-statements" element={<FinancialStatements />} />
        <Route path="closing-entries" element={<ClosingEntries />} />
        <Route path="reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;