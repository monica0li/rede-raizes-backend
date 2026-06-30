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
            description: 'API para rede de lanchonetes Raízes do Nordeste'
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
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        paths: {
            // 1. HEALTH
            '/health': {
                get: {
                    summary: 'Verificação de saúde da API',
                    tags: ['Health'],
                    responses: {
                        200: { description: 'API funcionando' }
                    }
                }
            },
            // 2. AUTH
            '/auth/register': {
                post: {
                    summary: 'Cadastrar usuario',
                    tags: ['Auth'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        email: { type: 'string' },
                                        password: { type: 'string' },
                                        name: { type: 'string' },
                                        role: { type: 'string', enum: ['ADMIN', 'CLIENTE', 'ATENDENTE', 'COZINHA'] }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Usuario criado' },
                        422: { description: 'Erro de validacao' },
                        409: { description: 'Email ja cadastrado' }
                    }
                }
            },
            '/auth/login': {
                post: {
                    summary: 'Login',
                    tags: ['Auth'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        email: { type: 'string' },
                                        password: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Login realizado' },
                        401: { description: 'Credenciais invalidas' }
                    }
                }
            },
            // 3. UNITS
            '/units': {
                get: {
                    summary: 'Listar unidades ativas',
                    tags: ['Units'],
                    responses: {
                        200: { description: 'Lista de unidades' }
                    }
                },
                post: {
                    summary: 'Criar unidade (ADMIN)',
                    tags: ['Units'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        address: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Unidade criada' },
                        401: { description: 'Nao autenticado' },
                        403: { description: 'Sem permissao' }
                    }
                }
            },
            '/units/{id}': {
                delete: {
                    summary: 'Inativar unidade (ADMIN)',
                    tags: ['Units'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Unidade inativada' },
                        404: { description: 'Unidade nao encontrada' }
                    }
                }
            },
            '/units/{id}/reactivate': {
                patch: {
                    summary: 'Reativar unidade (ADMIN)',
                    tags: ['Units'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Unidade reativada' },
                        404: { description: 'Unidade nao encontrada' }
                    }
                }
            },
            // 4. PRODUCTS
            '/products': {
                get: {
                    summary: 'Listar produtos',
                    tags: ['Products'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'unitId',
                            schema: { type: 'integer' },
                            description: 'Filtrar por unidade'
                        }
                    ],
                    responses: {
                        200: { description: 'Lista de produtos' }
                    }
                },
                post: {
                    summary: 'Criar produto (ADMIN)',
                    tags: ['Products'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        price: { type: 'number' },
                                        description: { type: 'string' },
                                        unitId: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Produto criado' },
                        401: { description: 'Nao autenticado' },
                        403: { description: 'Sem permissao' }
                    }
                }
            },
            '/products/{id}': {
                delete: {
                    summary: 'Inativar produto (ADMIN)',
                    tags: ['Products'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Produto inativado' },
                        404: { description: 'Produto nao encontrado' }
                    }
                }
            },
            // 5. STOCK
            '/stock/add': {
                post: {
                    summary: 'Adicionar estoque (ADMIN)',
                    tags: ['Stock'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        productId: { type: 'integer' },
                                        unitId: { type: 'integer' },
                                        quantity: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Estoque atualizado' },
                        404: { description: 'Produto nao encontrado' }
                    }
                }
            },
            '/stock/{productId}': {
                get: {
                    summary: 'Consultar estoque',
                    tags: ['Stock'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'productId',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Dados do estoque' },
                        404: { description: 'Estoque nao encontrado' }
                    }
                }
            },
            // 6. PROMOTIONS
            '/promotions/active': {
                get: {
                    summary: 'Listar promocoes ativas',
                    tags: ['Promotions'],
                    responses: {
                        200: { description: 'Lista de promocoes ativas' }
                    }
                }
            },
            '/promotions': {
                get: {
                    summary: 'Listar todas promocoes (ADMIN)',
                    tags: ['Promotions'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Lista de promocoes' }
                    }
                },
                post: {
                    summary: 'Criar promocao (ADMIN)',
                    tags: ['Promotions'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        type: { type: 'string', enum: ['PERCENTUAL', 'FIXO'] },
                                        value: { type: 'number' },
                                        minOrderValue: { type: 'number' },
                                        startDate: { type: 'string' },
                                        endDate: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Promocao criada' }
                    }
                }
            },
            // 7. ORDERS
            '/orders': {
                get: {
                    summary: 'Listar pedidos',
                    tags: ['Orders'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'query',
                            name: 'channel',
                            schema: { type: 'string' },
                            description: 'Filtrar por canal'
                        },
                        {
                            in: 'query',
                            name: 'status',
                            schema: { type: 'string' },
                            description: 'Filtrar por status'
                        }
                    ],
                    responses: {
                        200: { description: 'Lista de pedidos' }
                    }
                },
                post: {
                    summary: 'Criar pedido',
                    tags: ['Orders'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        unitId: { type: 'integer' },
                                        channel: { type: 'string', enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'] },
                                        usePoints: { type: 'integer' },
                                        items: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    productId: { type: 'integer' },
                                                    quantity: { type: 'integer' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Pedido criado' },
                        409: { description: 'Estoque insuficiente' },
                        422: { description: 'Canal invalido' }
                    }
                }
            },
            '/orders/{id}/status': {
                patch: {
                    summary: 'Atualizar status do pedido',
                    tags: ['Orders'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', enum: ['AGUARDANDO_PAGAMENTO', 'PAGO', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'] }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Status atualizado' },
                        404: { description: 'Pedido nao encontrado' }
                    }
                }
            },
            '/orders/{id}/cancel': {
                patch: {
                    summary: 'Cancelar pedido',
                    tags: ['Orders'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Pedido cancelado' },
                        404: { description: 'Pedido nao encontrado' }
                    }
                }
            },
            // 8. PAYMENTS
            '/payments/process': {
                post: {
                    summary: 'Processar pagamento (mock)',
                    tags: ['Payments'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        orderId: { type: 'integer' },
                                        forceStatus: { type: 'string', enum: ['APROVADO', 'RECUSADO'] }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Pagamento processado' },
                        404: { description: 'Pedido nao encontrado' },
                        409: { description: 'Pedido ja pago' }
                    }
                }
            },
            '/payments/status/{orderId}': {
                get: {
                    summary: 'Consultar status do pagamento',
                    tags: ['Payments'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'orderId',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Status do pagamento' },
                        404: { description: 'Pedido nao encontrado' }
                    }
                }
            },
            // 9. LOYALTY
            '/loyalty/balance': {
                get: {
                    summary: 'Consultar saldo de pontos',
                    tags: ['Loyalty'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Saldo de pontos' }
                    }
                }
            },
            '/loyalty/history': {
                get: {
                    summary: 'Consultar historico de transacoes',
                    tags: ['Loyalty'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Historico de pontos' }
                    }
                }
            },
            // 10. AUDIT
            '/audit-logs': {
                get: {
                    summary: 'Listar logs de auditoria (ADMIN)',
                    tags: ['Audit'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'query',
                            name: 'page',
                            schema: { type: 'integer' }
                        },
                        {
                            in: 'query',
                            name: 'limit',
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Lista de logs' },
                        403: { description: 'Sem permissao' }
                    }
                }
            },
            '/audit-logs/order/{orderId}': {
                get: {
                    summary: 'Listar logs por pedido (ADMIN)',
                    tags: ['Audit'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'orderId',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Logs do pedido' },
                        403: { description: 'Sem permissao' }
                    }
                }
            },
            '/audit-logs/user/{userId}': {
                get: {
                    summary: 'Listar logs por usuario (ADMIN)',
                    tags: ['Audit'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'userId',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Logs do usuario' },
                        403: { description: 'Sem permissao' }
                    }
                }
            }
        }
    },
    apis: []
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
