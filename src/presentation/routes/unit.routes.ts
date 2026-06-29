import { Router } from 'express';
import { UnitController } from '../controllers/UnitController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { auditLog } from '../middlewares/audit';

const router = Router();
const unitController = new UnitController();

/**
 * @swagger
 * /units:
 *   get:
 *     summary: Listar todas as unidades ativas
 *     tags: [Units]
 *     responses:
 *       200:
 *         description: Lista de unidades
 */
router.get('/', unitController.findAll.bind(unitController));

/**
 * @swagger
 * /units:
 *   post:
 *     summary: Criar uma nova unidade (ADMIN)
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Unidade criada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/', authMiddleware, adminMiddleware, auditLog('CREATE_UNIT', 'Unit'), unitController.create.bind(unitController));

/**
 * @swagger
 * /units/{id}:
 *   delete:
 *     summary: Inativar unidade (ADMIN)
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unidade inativada com sucesso
 *       404:
 *         description: Unidade não encontrada
 */
router.delete('/:id', authMiddleware, adminMiddleware, auditLog('DELETE_UNIT', 'Unit'), unitController.delete.bind(unitController));

/**
 * @swagger
 * /units/{id}/reactivate:
 *   patch:
 *     summary: Reativar unidade (ADMIN)
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unidade reativada com sucesso
 *       404:
 *         description: Unidade não encontrada
 */
router.patch('/:id/reactivate', authMiddleware, adminMiddleware, auditLog('REACTIVATE_UNIT', 'Unit'), unitController.reactivate.bind(unitController));

router.get('/:id', unitController.findById.bind(unitController));
router.put('/:id', authMiddleware, adminMiddleware, auditLog('UPDATE_UNIT', 'Unit'), unitController.update.bind(unitController));

export default router;