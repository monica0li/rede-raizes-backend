import { Router } from 'express';
import { StockController } from '../controllers/StockController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const stockController = new StockController();

// Apenas ADMIN com auditoria
router.post('/add', authMiddleware, adminMiddleware, auditLog('ADD_STOCK', 'Stock'), stockController.addStock.bind(stockController));
router.put('/:productId', authMiddleware, adminMiddleware, auditLog('UPDATE_STOCK', 'Stock'), stockController.updateStock.bind(stockController));
router.get('/:productId', authMiddleware, stockController.getStock.bind(stockController));

export default router;