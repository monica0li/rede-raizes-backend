import swaggerJsdoc from 'swagger-jsdoc';

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
    ],
    paths: {
      // ============ HEALTH ============
      '/health': {
        get: {
          summary: 'Verificar se a API está no ar',
          tags: ['Health'],
          responses: {
            200: { description: 'API funcionando' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },

      // ============ AUTH ============
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
            201: { description: 'Usuario criado com sucesso' },
            400: { description: 'Requisicao invalida' },
            409: { description: 'Email ja cadastrado' },
            422: { description: 'Erro de validacao (ex: role invalida, campos faltando)' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/auth/login': {
        post: {
          summary: 'Login do usuario',
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
            200: { description: 'Login realizado com sucesso' },
            400: { description: 'Requisicao invalida' },
            401: { description: 'Credenciais invalidas' },
            422: { description: 'Campos obrigatorios faltando' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },

      // ============ UNITS ============
      '/units': {
        get: {
          summary: 'Listar unidades ativas',
          tags: ['Units'],
          responses: {
            200: { description: 'Lista de unidades retornada com sucesso' },
            500: { description: 'Erro interno do servidor' }
          }
        },
        post: {
          summary: 'Criar unidade',
          tags: ['Units'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'address'],
                  properties: {
                    name: { type: 'string' },
                    address: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Unidade criada com sucesso' },
            400: { description: 'Requisicao invalida' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            422: { description: 'Campos obrigatorios faltando' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/units/{id}': {
        get: {
          summary: 'Buscar unidade por ID',
          tags: ['Units'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: { description: 'Unidade encontrada' },
            404: { description: 'Unidade nao encontrada' },
            500: { description: 'Erro interno do servidor' }
          }
        },
        put: {
          summary: 'Atualizar unidade',
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
            200: { description: 'Unidade atualizada' },
            400: { description: 'Requisicao invalida' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Unidade nao encontrada' },
            422: { description: 'Campos obrigatorios faltando' },
            500: { description: 'Erro interno do servidor' }
          }
        },
        delete: {
          summary: 'Inativar unidade (soft delete)',
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
            200: { description: 'Unidade inativada com sucesso' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Unidade nao encontrada' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/units/{id}/reactivate': {
        patch: {
          summary: 'Reativar unidade',
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
            200: { description: 'Unidade reativada com sucesso' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Unidade nao encontrada' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },

      // ============ PRODUCTS ============
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
            },
            {
              in: 'query',
              name: 'includeInactive',
              schema: { type: 'boolean' },
              description: 'Incluir produtos inativos'
            }
          ],
          responses: {
            200: { description: 'Lista de produtos retornada' },
            500: { description: 'Erro interno do servidor' }
          }
        },
        post: {
          summary: 'Criar produto',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'price', 'unitId'],
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
            201: { description: 'Produto criado com sucesso' },
            400: { description: 'Requisicao invalida' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Unidade nao encontrada' },
            409: { description: 'Unidade inativa' },
            422: { description: 'Campos obrigatorios faltando' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/products/{id}': {
        get: {
          summary: 'Buscar produto por ID',
          tags: ['Products'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: { description: 'Produto encontrado' },
            404: { description: 'Produto nao encontrado' },
            500: { description: 'Erro interno do servidor' }
          }
        },
        put: {
          summary: 'Atualizar produto',
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
            200: { description: 'Produto atualizado' },
            400: { description: 'Requisicao invalida' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Produto nao encontrado' },
            422: { description: 'Campos obrigatorios faltando' },
            500: { description: 'Erro interno do servidor' }
          }
        },
        delete: {
          summary: 'Inativar produto (soft delete)',
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
            200: { description: 'Produto inativado com sucesso' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Produto nao encontrado' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },

      // ============ STOCK ============
      '/stock/add': {
        post: {
          summary: 'Adicionar estoque',
          tags: ['Stock'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productId', 'unitId', 'quantity'],
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
            200: { description: 'Estoque atualizado com sucesso' },
            400: { description: 'Requisicao invalida' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Produto nao encontrado' },
            422: { description: 'Campos obrigatorios faltando ou quantidade invalida' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/stock/{productId}': {
        get: {
          summary: 'Consultar estoque de um produto',
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
            200: { description: 'Estoque encontrado' },
            401: { description: 'Nao autenticado' },
            404: { description: 'Estoque nao encontrado' },
            500: { description: 'Erro interno do servidor' }
          }
        },
        put: {
          summary: 'Atualizar estoque',
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
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantity'],
                  properties: {
                    quantity: { type: 'integer' },
                    unitId: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Estoque atualizado' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Produto nao encontrado' },
            422: { description: 'Campos obrigatorios faltando' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },

      // ============ PROMOTIONS ============
      '/promotions/active': {
        get: {
          summary: 'Listar promocoes ativas',
          tags: ['Promotions'],
          responses: {
            200: { description: 'Lista de promocoes ativas retornada' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/promotions': {
        get: {
          summary: 'Listar todas as promocoes',
          tags: ['Promotions'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de promocoes retornada' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            500: { description: 'Erro interno do servidor' }
          }
        },
        post: {
          summary: 'Criar promocao',
          tags: ['Promotions'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'type', 'value', 'startDate', 'endDate'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    type: { type: 'string', enum: ['PERCENTUAL', 'FIXO'] },
                    value: { type: 'number' },
                    minOrderValue: { type: 'number' },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' },
                    productIds: {
                      type: 'array',
                      items: { type: 'integer' }
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Promocao criada com sucesso' },
            400: { description: 'Requisicao invalida' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Produto(s) nao encontrado(s)' },
            422: { description: 'Campos obrigatorios faltando ou data invalida' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/promotions/{id}': {
        put: {
          summary: 'Atualizar promocao',
          tags: ['Promotions'],
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
                    name: { type: 'string' },
                    description: { type: 'string' },
                    type: { type: 'string', enum: ['PERCENTUAL', 'FIXO'] },
                    value: { type: 'number' },
                    minOrderValue: { type: 'number' },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' },
                    active: { type: 'boolean' },
                    productIds: {
                      type: 'array',
                      items: { type: 'integer' }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Promocao atualizada' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Promocao nao encontrada' },
            422: { description: 'Dados invalidos' },
            500: { description: 'Erro interno do servidor' }
          }
        },
        delete: {
          summary: 'Inativar promocao (soft delete)',
          tags: ['Promotions'],
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
            200: { description: 'Promocao inativada' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Promocao nao encontrada' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },

      // ============ ORDERS ============
      '/orders': {
        get: {
          summary: 'Listar pedidos',
          tags: ['Orders'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'channel',
              schema: { type: 'string', enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'] },
              description: 'Filtrar por canal'
            },
            {
              in: 'query',
              name: 'status',
              schema: { type: 'string', enum: ['AGUARDANDO_PAGAMENTO', 'PAGO', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'] },
              description: 'Filtrar por status'
            }
          ],
          responses: {
            200: { description: 'Lista de pedidos retornada' },
            401: { description: 'Nao autenticado' },
            500: { description: 'Erro interno do servidor' }
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
                  required: ['unitId', 'channel', 'items'],
                  properties: {
                    unitId: { type: 'integer' },
                    channel: { type: 'string', enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'] },
                    usePoints: { type: 'integer' },
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['productId', 'quantity'],
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
            201: { description: 'Pedido criado com sucesso' },
            400: { description: 'Requisicao invalida' },
            401: { description: 'Nao autenticado' },
            404: { description: 'Usuario, unidade ou produto nao encontrado' },
            409: { description: 'Estoque insuficiente, unidade inativa ou produto inativo' },
            422: { description: 'Canal invalido ou campos obrigatorios faltando' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/orders/{id}': {
        get: {
          summary: 'Buscar pedido por ID',
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
            200: { description: 'Pedido encontrado' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao para ver este pedido' },
            404: { description: 'Pedido nao encontrado' },
            500: { description: 'Erro interno do servidor' }
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
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['AGUARDANDO_PAGAMENTO', 'PAGO', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'] }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Status atualizado com sucesso' },
            400: { description: 'Requisicao invalida' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao para alterar este pedido' },
            404: { description: 'Pedido nao encontrado' },
            409: { description: 'Pedido ja cancelado/entregue ou nao pode ser alterado' },
            422: { description: 'Status invalido ou campo obrigatorio faltando' },
            500: { description: 'Erro interno do servidor' }
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
            200: { description: 'Pedido cancelado com sucesso' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao para cancelar este pedido' },
            404: { description: 'Pedido nao encontrado' },
            409: { description: 'Pedido ja entregue, ja cancelado ou ja pago (para clientes)' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },

      // ============ PAYMENTS ============
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
                  required: ['orderId'],
                  properties: {
                    orderId: { type: 'integer' },
                    forceStatus: { type: 'string', enum: ['APROVADO', 'RECUSADO'] }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Pagamento processado com sucesso (aprovado ou recusado)' },
            400: { description: 'Requisicao invalida' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao para pagar este pedido' },
            404: { description: 'Pedido nao encontrado' },
            409: { description: 'Pedido cancelado, entregue ou ja pago' },
            422: { description: 'Campos obrigatorios faltando' },
            500: { description: 'Erro interno do servidor' }
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
            200: { description: 'Status do pagamento retornado' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao para ver este pedido' },
            404: { description: 'Pedido nao encontrado ou pagamento nao encontrado' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },

      // ============ LOYALTY ============
      '/loyalty/balance': {
        get: {
          summary: 'Consultar saldo de pontos',
          tags: ['Loyalty'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Saldo de pontos retornado' },
            401: { description: 'Nao autenticado' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/loyalty/history': {
        get: {
          summary: 'Consultar historico de transacoes',
          tags: ['Loyalty'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer' },
              description: 'Numero de registros por pagina (padrao: 50)'
            }
          ],
          responses: {
            200: { description: 'Historico de transacoes retornado' },
            401: { description: 'Nao autenticado' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },

      // ============ AUDIT ============
      '/audit-logs': {
        get: {
          summary: 'Listar logs de auditoria',
          tags: ['Audit'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer' },
              description: 'Numero da pagina (padrao: 1)'
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer' },
              description: 'Registros por pagina (padrao: 20)'
            },
            {
              in: 'query',
              name: 'userId',
              schema: { type: 'integer' },
              description: 'Filtrar por usuario'
            },
            {
              in: 'query',
              name: 'action',
              schema: { type: 'string' },
              description: 'Filtrar por acao'
            },
            {
              in: 'query',
              name: 'entity',
              schema: { type: 'string' },
              description: 'Filtrar por entidade'
            },
            {
              in: 'query',
              name: 'startDate',
              schema: { type: 'string', format: 'date-time' },
              description: 'Data inicial (ISO 8601)'
            },
            {
              in: 'query',
              name: 'endDate',
              schema: { type: 'string', format: 'date-time' },
              description: 'Data final (ISO 8601)'
            }
          ],
          responses: {
            200: { description: 'Lista de logs retornada' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/audit-logs/order/{orderId}': {
        get: {
          summary: 'Listar logs por pedido',
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
            200: { description: 'Logs do pedido retornados' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Pedido nao encontrado' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      },
      '/audit-logs/user/{userId}': {
        get: {
          summary: 'Listar logs por usuario',
          tags: ['Audit'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'userId',
              required: true,
              schema: { type: 'integer' }
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer' },
              description: 'Registros por pagina (padrao: 20)'
            }
          ],
          responses: {
            200: { description: 'Logs do usuario retornados' },
            401: { description: 'Nao autenticado' },
            403: { description: 'Sem permissao (apenas ADMIN)' },
            404: { description: 'Usuario nao encontrado' },
            500: { description: 'Erro interno do servidor' }
          }
        }
      }
    }
  },
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);