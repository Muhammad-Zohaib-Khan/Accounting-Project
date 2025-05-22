const Account = require('../models/Account');
const { validationResult } = require('express-validator');

exports.createAccount = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const account = await Account.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
};

exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.findByUserId(req.user.id);
    res.json(accounts);
  } catch (err) {
    next(err);
  }
};

exports.getAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account || account.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (err) {
    next(err);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const account = await Account.findById(req.params.id);
    if (!account || account.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const updatedAccount = await Account.update(req.params.id, req.body);
    res.json(updatedAccount);
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account || account.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await Account.delete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};