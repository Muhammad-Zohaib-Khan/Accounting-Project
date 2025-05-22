const db = require('../config/db');
const Account = require('./Account');

class Transaction {
  static async create({ userId, date, description, accountId, amount, type }) {
    // Verify account ownership
    const account = await Account.findById(accountId);
    if (!account || account.user_id !== userId) {
      throw new Error('Account not found or access denied');
    }

    // Validate transaction type
    this.validateTransactionType(account.type, type);

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Create transaction
      const [result] = await connection.execute(
        `INSERT INTO transactions (date, description, account_id, amount, type) 
         VALUES (?, ?, ?, ?, ?)`,
        [date, description, accountId, amount, type]
      );

      // Update account balance
      await Account.updateBalance(accountId, amount, type === 'credit');

      await connection.commit();

      return this.findById(result.insertId);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static validateTransactionType(accountType, transactionType) {
    const rules = {
      asset: 'debit',
      expense: 'debit',
      liability: 'credit',
      equity: 'credit',
      revenue: 'credit'
    };

    if (rules[accountType] !== transactionType) {
      throw new Error(`Invalid transaction type for ${accountType} account`);
    }
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT t.* FROM transactions t
       JOIN accounts a ON t.account_id = a.id
       WHERE a.user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async findByAccountId(userId, accountId) {
    const [rows] = await db.execute(
      `SELECT t.* FROM transactions t
       JOIN accounts a ON t.account_id = a.id
       WHERE a.user_id = ? AND t.account_id = ?`,
      [userId, accountId]
    );
    return rows;
  }

  static async update(id, userId, { date, description, amount, type }) {
    const transaction = await this.findById(id);
    if (!transaction) throw new Error('Transaction not found');

    const account = await Account.findById(transaction.account_id);
    if (!account || account.user_id !== userId) {
      throw new Error('Account not found or access denied');
    }

    this.validateTransactionType(account.type, type);

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Revert old transaction
      await Account.updateBalance(
        transaction.account_id, 
        transaction.amount, 
        transaction.type !== 'credit'
      );

      // Update transaction
      await connection.execute(
        `UPDATE transactions 
         SET date = ?, description = ?, amount = ?, type = ?
         WHERE id = ?`,
        [date, description, amount, type, id]
      );

      // Apply new transaction
      await Account.updateBalance(transaction.account_id, amount, type === 'credit');

      await connection.commit();

      return this.findById(id);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async delete(id, userId) {
    const transaction = await this.findById(id);
    if (!transaction) throw new Error('Transaction not found');

    const account = await Account.findById(transaction.account_id);
    if (!account || account.user_id !== userId) {
      throw new Error('Account not found or access denied');
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Revert transaction
      await Account.updateBalance(
        transaction.account_id, 
        transaction.amount, 
        transaction.type !== 'credit'
      );

      // Delete transaction
      await connection.execute(
        'DELETE FROM transactions WHERE id = ?',
        [id]
      );

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = Transaction;