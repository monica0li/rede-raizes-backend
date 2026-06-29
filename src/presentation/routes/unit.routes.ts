import { Router } from 'express';
import { UnitController } from '../controllers/UnitController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const unitController = new UnitController();

// rotas públicas (apenas listar ativas)
router.get('/', unitController.findAll.bind(unitController));
router.get('/:id', unitController.findById.bind(unitController));

//rota admin para ver ativas e inativas
router.get(
  '/all',
  authMiddleware,
  adminMiddleware,
  unitController.findAllIncludingInactive.bind(unitController)
);

// rotas protegidas (admin)
router.post('/', authMiddleware, adminMiddleware, unitController.create.bind(unitController));
router.put('/:id', authMiddleware, adminMiddleware, unitController.update.bind(unitController));
router.delete('/:id', authMiddleware, adminMiddleware, unitController.delete.bind(unitController));
router.patch('/:id/reactivate', authMiddleware, adminMiddleware, unitController.reactivate.bind(unitController));

export default router;