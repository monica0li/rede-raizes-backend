import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './presentation/routes/auth.routes';
import unitRoutes from './presentation/routes/unit.routes';
import productRoutes from './presentation/routes/product.routes';
import orderRoutes from './presentation/routes/order.routes';
import stockRoutes from './presentation/routes/stock.routes';
import paymentRoutes from './presentation/routes/payment.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// log de requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
//rotas
console.log('Registrando rotas...');
app.use('/auth', authRoutes);
app.use('/units', unitRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/stock', stockRoutes);
app.use('/payments', paymentRoutes);
console.log('Rotas registradas!');

// rota de saúde
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API Raízes do Nordeste está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// erros de JSON inválido
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('JSON Inválido:', err.message);
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: 'JSON inválido. Verifique a sintaxe do corpo da requisição.',
      details: [
        {
          field: 'body',
          issue: err.message
        }
      ],
      timestamp: new Date().toISOString(),
      path: req.originalUrl || req.path
    });
  }
  next(err);
});

//  rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Rota ${req.method} ${req.path} não encontrada`,
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.path
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Auth: http://localhost:${port}/auth/register e /auth/login`);
  console.log(`Auth Admin: http://localhost:${port}/auth/register-admin (ADMIN apenas)`);
  console.log(`Units: http://localhost:${port}/units`);
  console.log(`Products: http://localhost:${port}/products`);
  console.log(`Orders: http://localhost:${port}/orders`);
  console.log(`Stock: http://localhost:${port}/stock/add`);
  console.log(`Payments: http://localhost:${port}/payments/process`);
});