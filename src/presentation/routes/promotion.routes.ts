import { Router } from 'express';
import { PromotionController } from '../controllers/PromotionController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const promotionController = new PromotionController();

// Rotas públicas
router.get('/active', promotionController.getActive.bind(promotionController));

// Rotas ADMIN com auditoria
router.get('/', authMiddleware, adminMiddleware, promotionController.findAll.bind(promotionController));
router.get('/:id', authMiddleware, adminMiddleware, promotionController.findById.bind(promotionController));
router.post('/', authMiddleware, adminMiddleware, auditLog('CREATE_PROMOTION', 'Promotion'), promotionController.create.bind(promotionController));
router.put('/:id', authMiddleware, adminMiddleware, auditLog('UPDATE_PROMOTION', 'Promotion'), promotionController.update.bind(promotionController));
router.delete('/:id', authMiddleware, adminMiddleware, auditLog('DELETE_PROMOTION', 'Promotion'), promotionController.delete.bind(promotionController));
router.patch('/:id/reactivate', authMiddleware, adminMiddleware, auditLog('REACTIVATE_PROMOTION', 'Promotion'), promotionController.reactivate.bind(promotionController));

export default router;