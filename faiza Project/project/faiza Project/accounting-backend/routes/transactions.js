const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions');
const { validateTransaction } = require('../utils/validation');

router.post('/', validateTransaction, transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/account/:accountId', transactionController.getAccountTransactions);
router.get('/:id', transactionController.getTransaction);
router.put('/:id', validateTransaction, transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;