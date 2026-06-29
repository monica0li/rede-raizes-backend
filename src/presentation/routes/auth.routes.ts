import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { auditLog } from '../middlewares/audit';

const router = Router();
const authController = new AuthController();

console.log('Rotas de autenticacao carregadas!');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cadastrar um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CLIENTE, ATENDENTE, COZINHA]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       422:
 *         description: Erro de validação
 *       409:
 *         description: Email já cadastrado
 */
router.post('/register', auditLog('REGISTER_USER', 'User'), authController.register.bind(authController));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', auditLog('LOGIN_USER', 'User'), authController.login.bind(authController));

export default router;