import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { auditLog } from '../middlewares/audit';

const router = Router();
const authController = new AuthController();

console.log('Rotas de autenticação carregadas');

// Rotas públicas com auditoria
router.post('/register', auditLog('REGISTER_USER', 'User'), authController.register.bind(authController));
router.post('/login', auditLog('LOGIN_USER', 'User'), authController.login.bind(authController));

export default router;