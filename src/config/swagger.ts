import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Raízes do Nordeste',
      version: '1.0.0',
      description: 'API para rede de lanchonetes com sistema de pedidos, estoque, fidelidade e pagamento.',
      contact: {
        name: 'Equipe Raízes do Nordeste'
      }
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            timestamp: { type: 'string' },
            path: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/presentation/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);