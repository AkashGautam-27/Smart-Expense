import { Router } from 'express';
import {
  getTransactions,
  getTransactionsDirectList,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { transactionValidator } from '../validators/transaction.js';

const router = Router();

router.use(authenticateToken);

// Support both paginated advanced queries and direct full list
router.get('/', getTransactions);
router.get('/all-records', getTransactionsDirectList);

router.post('/', transactionValidator, createTransaction);
router.put('/:id', transactionValidator, updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
