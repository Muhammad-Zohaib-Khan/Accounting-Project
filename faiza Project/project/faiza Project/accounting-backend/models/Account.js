const db = require('../config/db');

class Account {
  static async create({ userId, number, name, description, type }) {
    const [result] = await db.execute(
      `INSERT INTO accounts (user_id, number, name, description, type) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, number, name, description, type]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM accounts WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM accounts WHERE user_id = ?',
      [userId]
    );
    return rows;
  }

  static async update(id, { number, name, description, type }) {
    await db.execute(
      `UPDATE accounts 
       SET number = ?, name = ?, description = ?, type = ?
       WHERE id = ?`,
      [number, name, description, type, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await db.execute(
      'DELETE FROM accounts WHERE id = ?',
      [id]
    );
    return true;
  }

  static async updateBalance(accountId, amount, isCredit) {
    const operator = isCredit ? '+' : '-';
    await db.execute(
      `UPDATE accounts 
       SET balance = balance ${operator} ?
       WHERE id = ?`,
      [amount, accountId]
    );
    return this.findById(accountId);
  }
}

module.exports = Account;