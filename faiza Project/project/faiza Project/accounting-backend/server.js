require('dotenv').config();
const express = require('express');
const cors = require('cors');
const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});