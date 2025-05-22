-- Create database
CREATE DATABASE IF NOT EXISTS accounting_system;
USE accounting_system;

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type ENUM('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  account_id CHAR(36) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type ENUM('debit', 'credit') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  INDEX (account_id),
  INDEX (date)
);