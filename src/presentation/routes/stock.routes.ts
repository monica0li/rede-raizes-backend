import { Router } from 'express';
import { StockController } from '../controllers/StockController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const stockController = new StockController();

// apenas admin gerencia estoque
router.post('/add', authMiddleware, adminMiddleware, stockController.addStock.bind(stockController));
router.put('/:productId', authMiddleware, adminMiddleware, stockController.updateStock.bind(stockController));
router.get('/:productId', authMiddleware, stockController.getStock.bind(stockController));

export default router;