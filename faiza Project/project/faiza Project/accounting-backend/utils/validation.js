const { body, param } = require('express-validator');

exports.validateAccount = [
  body('number').trim().notEmpty().withMessage('Account number is required'),
  body('name').trim().notEmpty().withMessage('Account name is required'),
  body('type')
    .isIn(['asset', 'liability', 'equity', 'revenue', 'expense'])
    .withMessage('Invalid account type'),
  body('description').optional().trim()
];

exports.validateTransaction = [
  body('date').isISO8601().withMessage('Invalid date format'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('account_id').notEmpty().withMessage('Account ID is required'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['debit', 'credit'])
    .withMessage('Invalid transaction type')
];

exports.validateIdParam = [
  param('id').notEmpty().isString().withMessage('Invalid ID parameter')
];