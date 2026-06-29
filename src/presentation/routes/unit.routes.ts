import { Router } from 'express';
import { UnitController } from '../controllers/UnitController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const unitController = new UnitController();

// Rotas públicas
router.get('/', unitController.findAll.bind(unitController));
router.get('/:id', unitController.findById.bind(unitController));

// Rotas ADMIN com auditoria
router.get('/all', authMiddleware, adminMiddleware, unitController.findAllIncludingInactive.bind(unitController));
router.post('/', authMiddleware, adminMiddleware, auditLog('CREATE_UNIT', 'Unit'), unitController.create.bind(unitController));
router.put('/:id', authMiddleware, adminMiddleware, auditLog('UPDATE_UNIT', 'Unit'), unitController.update.bind(unitController));
router.delete('/:id', authMiddleware, adminMiddleware, auditLog('DELETE_UNIT', 'Unit'), unitController.delete.bind(unitController));
router.patch('/:id/reactivate', authMiddleware, adminMiddleware, auditLog('REACTIVATE_UNIT', 'Unit'), unitController.reactivate.bind(unitController));

export default router;