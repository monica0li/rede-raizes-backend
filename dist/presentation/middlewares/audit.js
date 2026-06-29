"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
const AuditService_1 = require("../../application/services/AuditService");
const auditService = new AuditService_1.AuditService();
// Middleware para registrar ações sensíveis
function auditLog(action, entity) {
    return async (req, res, next) => {
        // Salvar dados originais para depois comparar
        const originalSend = res.send;
        const startTime = Date.now();
        res.send = function (body) {
            // Registrar após a resposta
            try {
                const userId = req.user?.id;
                // Corrigir: garantir que entityId seja number ou undefined
                let entityId;
                if (req.params.id) {
                    const parsed = parseInt(req.params.id);
                    if (!isNaN(parsed)) {
                        entityId = parsed;
                    }
                }
                else if (req.body?.id) {
                    const parsed = parseInt(req.body.id);
                    if (!isNaN(parsed)) {
                        entityId = parsed;
                    }
                }
                const metadata = {
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    method: req.method,
                    path: req.path,
                    duration: Date.now() - startTime
                };
                // Corrigir: usar o método log com um objeto
                auditService.log({
                    userId,
                    action,
                    entity,
                    entityId,
                    oldValue: req.body,
                    newValue: body,
                    metadata
                });
            }
            catch (error) {
                console.error('Erro no audit middleware:', error);
            }
            return originalSend.call(this, body);
        };
        next();
    };
}
