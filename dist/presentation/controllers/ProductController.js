"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const ProductService_1 = require("../../application/services/ProductService");
const productService = new ProductService_1.ProductService();
class ProductController {
    async create(req, res) {
        try {
            console.log('📥 ProductController.create recebeu:', req.body);
            const { name, price, description, unitId } = req.body;
            // Validações
            if (!name || name.trim() === '') {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'O campo "name" é obrigatório',
                    details: [{ field: 'name', issue: 'Campo obrigatório' }],
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            if (price === undefined || price === null || isNaN(Number(price)) || Number(price) <= 0) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'O campo "price" é obrigatório e deve ser maior que zero',
                    details: [{ field: 'price', issue: 'Deve ser maior que zero' }],
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            if (!unitId) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'O campo "unitId" é obrigatório',
                    details: [{ field: 'unitId', issue: 'Campo obrigatório' }],
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            const data = {
                name: name.trim(),
                price: Number(price),
                description: description ? description.trim() : undefined,
                unitId: Number(unitId)
            };
            const product = await productService.create(data);
            return res.status(201).json(product);
        }
        catch (error) {
            console.error('ERRO no ProductController.create:', error.message);
            console.error('Stack:', error.stack);
            if (error.message === 'Produto não encontrado') {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            if (error.message.includes('obrigatório') || error.message.includes('vazio') || error.message.includes('maior que zero')) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            if (error.message.includes('Unidade não encontrada')) {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Erro ao criar produto',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
    async findAll(req, res) {
        try {
            const unitId = req.query.unitId ? parseInt(req.query.unitId) : undefined;
            const includeInactive = req.query.includeInactive === 'true';
            const products = await productService.findAll(unitId, includeInactive);
            return res.status(200).json(products);
        }
        catch (error) {
            console.error('Erro ao listar produtos:', error);
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao listar produtos',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
    async findById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'ID inválido',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            const product = await productService.findById(id);
            if (!product) {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: `Produto com ID ${id} não encontrado`,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            return res.status(200).json(product);
        }
        catch (error) {
            console.error('Erro ao buscar produto:', error);
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao buscar produto',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'ID inválido',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            const { name, price, description, unitId } = req.body;
            const data = {};
            if (name !== undefined) {
                if (name.trim() === '') {
                    return res.status(422).json({
                        error: 'VALIDATION_ERROR',
                        message: 'Nome não pode estar vazio',
                        timestamp: new Date().toISOString(),
                        path: req.originalUrl || req.path
                    });
                }
                data.name = name.trim();
            }
            if (price !== undefined) {
                if (isNaN(Number(price)) || Number(price) <= 0) {
                    return res.status(422).json({
                        error: 'VALIDATION_ERROR',
                        message: 'Price deve ser maior que zero',
                        timestamp: new Date().toISOString(),
                        path: req.originalUrl || req.path
                    });
                }
                data.price = Number(price);
            }
            if (description !== undefined) {
                data.description = description.trim() || null;
            }
            if (unitId !== undefined) {
                data.unitId = Number(unitId);
            }
            const product = await productService.update(id, data);
            return res.status(200).json(product);
        }
        catch (error) {
            console.error('Erro ao atualizar produto:', error);
            if (error.message === 'Produto não encontrado') {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            if (error.message.includes('obrigatório') || error.message.includes('vazio') || error.message.includes('maior que zero')) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Erro ao atualizar produto',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'ID inválido',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            const product = await productService.delete(id);
            return res.status(200).json({
                message: `Produto "${product.name}" inativado com sucesso`,
                product
            });
        }
        catch (error) {
            console.error('Erro ao inativar produto:', error);
            if (error.message === 'Produto não encontrado') {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Erro ao inativar produto',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
    async reactivate(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'ID inválido',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            const product = await productService.reactivate(id);
            return res.status(200).json({
                message: `Produto "${product.name}" reativado com sucesso`,
                product
            });
        }
        catch (error) {
            console.error('Erro ao reativar produto:', error);
            if (error.message === 'Produto não encontrado') {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Erro ao reativar produto',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
}
exports.ProductController = ProductController;
