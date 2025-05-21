/*
  # Initial Schema Setup

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `number` (text, unique)
      - `name` (text)
      - `description` (text)
      - `type` (text)
      - `balance` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `date` (date)
      - `description` (text)
      - `account_id` (uuid, foreign key)
      - `amount` (numeric)
      - `type` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  description text NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('debit', 'credit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own accounts"
  ON accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = transactions.account_id
    AND accounts.id = auth.uid()
  ));

CREATE POLICY "Users can insert their own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = transactions.account_id
    AND accounts.id = auth.uid()
  ));

CREATE POLICY "Users can update their own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = transactions.account_id
    AND accounts.id = auth.uid()
  ));

CREATE POLICY "Users can delete their own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = transactions.account_id
    AND accounts.id = auth.uid()
  ));