"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
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
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
