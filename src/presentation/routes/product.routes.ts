import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const productController = new ProductController();

// rotas públicas (listar)
router.get('/', productController.findAll.bind(productController));
router.get('/:id', productController.findById.bind(productController));

// rotas protegidas (ADMIN)
router.post('/', authMiddleware, adminMiddleware, productController.create.bind(productController));
router.put('/:id', authMiddleware, adminMiddleware, productController.update.bind(productController));
router.delete('/:id', authMiddleware, adminMiddleware, productController.delete.bind(productController));
router.patch('/:id/reactivate', authMiddleware, adminMiddleware, productController.reactivate.bind(productController));

export default router;