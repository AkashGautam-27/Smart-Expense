import { Router } from 'express';
import { getBudgets, setBudget, deleteBudget } from '../controllers/budgetController.js';
import { authenticateToken } from '../middleware/auth.js';
import { budgetValidator } from '../validators/budget.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getBudgets);
router.post('/', budgetValidator, setBudget);
router.delete('/:id', deleteBudget);

export default router;
