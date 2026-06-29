"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitController = void 0;
const UnitService_1 = require("../../application/services/UnitService");
const unitService = new UnitService_1.UnitService();
class UnitController {
    async create(req, res) {
        try {
            const { name, address } = req.body;
            // Validações detalhadas
            if (!name || name.trim() === '') {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'O campo "name" é obrigatório e não pode estar vazio',
                    details: [{ field: 'name', issue: 'Campo obrigatório' }],
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            if (!address || address.trim() === '') {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'O campo "address" é obrigatório e não pode estar vazio',
                    details: [{ field: 'address', issue: 'Campo obrigatório' }],
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            const unit = await unitService.create({ name, address });
            return res.status(201).json(unit);
        }
        catch (error) {
            if (error.message.includes('obrigatório')) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao criar unidade',
                timestamp: new Date().toISOString(),
                path: req.path
            });
        }
    }
    async findAll(req, res) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const units = includeInactive
                ? await unitService.findAllIncludingInactive()
                : await unitService.findAll();
            return res.status(200).json(units);
        }
        catch (error) {
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao listar unidades',
                timestamp: new Date().toISOString(),
                path: req.path
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
                    path: req.path
                });
            }
            const unit = await unitService.findById(id);
            if (!unit) {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: `Unidade com ID ${id} não encontrada`,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            return res.status(200).json(unit);
        }
        catch (error) {
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao buscar unidade',
                timestamp: new Date().toISOString(),
                path: req.path
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
                    path: req.path
                });
            }
            const { name, address } = req.body;
            const data = {};
            if (name !== undefined) {
                if (name.trim() === '') {
                    return res.status(422).json({
                        error: 'VALIDATION_ERROR',
                        message: 'Nome não pode estar vazio',
                        details: [{ field: 'name', issue: 'Campo não pode estar vazio' }],
                        timestamp: new Date().toISOString(),
                        path: req.path
                    });
                }
                data.name = name.trim();
            }
            if (address !== undefined) {
                if (address.trim() === '') {
                    return res.status(422).json({
                        error: 'VALIDATION_ERROR',
                        message: 'Endereço não pode estar vazio',
                        details: [{ field: 'address', issue: 'Campo não pode estar vazio' }],
                        timestamp: new Date().toISOString(),
                        path: req.path
                    });
                }
                data.address = address.trim();
            }
            const unit = await unitService.update(id, data);
            return res.status(200).json(unit);
        }
        catch (error) {
            if (error.message === 'Unidade não encontrada') {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            if (error.message.includes('obrigatório') || error.message.includes('vazio')) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao atualizar unidade',
                timestamp: new Date().toISOString(),
                path: req.path
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
                    path: req.path
                });
            }
            const unit = await unitService.delete(id);
            return res.status(200).json({
                message: `Unidade ${unit.name} inativada com sucesso`,
                unit
            });
        }
        catch (error) {
            if (error.message === 'Unidade não encontrada') {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao inativar unidade',
                timestamp: new Date().toISOString(),
                path: req.path
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
            const unit = await unitService.reactivate(id);
            return res.status(200).json({
                message: `Unidade "${unit.name}" reativada com sucesso`,
                unit
            });
        }
        catch (error) {
            if (error.message === 'Unidade não encontrada') {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl || req.path
                });
            }
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao reativar unidade',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
    async findAllIncludingInactive(req, res) {
        try {
            const units = await unitService.findAllIncludingInactive();
            return res.status(200).json(units);
        }
        catch (error) {
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Erro ao listar todas as unidades',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.path
            });
        }
    }
}
exports.UnitController = UnitController;
