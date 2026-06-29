import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const productController = new ProductController();

// Rotas públicas
router.get('/', productController.findAll.bind(productController));
router.get('/:id', productController.findById.bind(productController));

// Rotas ADMIN com auditoria
router.post('/', authMiddleware, adminMiddleware, auditLog('CREATE_PRODUCT', 'Product'), productController.create.bind(productController));
router.put('/:id', authMiddleware, adminMiddleware, auditLog('UPDATE_PRODUCT', 'Product'), productController.update.bind(productController));
router.delete('/:id', authMiddleware, adminMiddleware, auditLog('DELETE_PRODUCT', 'Product'), productController.delete.bind(productController));
router.patch('/:id/reactivate', authMiddleware, adminMiddleware, auditLog('REACTIVATE_PRODUCT', 'Product'), productController.reactivate.bind(productController));

export default router;