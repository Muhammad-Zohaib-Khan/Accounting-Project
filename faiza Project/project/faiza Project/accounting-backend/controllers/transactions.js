const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

exports.createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      ...req.body,
      accountId: req.body.account_id
    });
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.findByUserId(req.user.id);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

exports.getAccountTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.findByAccountId(
      req.user.id,
      req.params.accountId
    );
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify account ownership
    const account = await Account.findById(transaction.account_id);
    if (!account || account.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.update(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    await Transaction.delete(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};