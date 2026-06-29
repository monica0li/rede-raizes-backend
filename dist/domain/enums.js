"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.Channel = exports.OrderStatus = exports.Roles = void 0;
// Enums para validação no código
exports.Roles = {
    CLIENTE: 'CLIENTE',
    ADMIN: 'ADMIN'
};
exports.OrderStatus = {
    AGUARDANDO_PAGAMENTO: 'AGUARDANDO_PAGAMENTO',
    PAGO: 'PAGO',
    PREPARANDO: 'PREPARANDO',
    PRONTO: 'PRONTO',
    ENTREGUE: 'ENTREGUE',
    CANCELADO: 'CANCELADO'
};
exports.Channel = {
    APP: 'APP',
    TOTEM: 'TOTEM',
    BALCAO: 'BALCAO',
    PICKUP: 'PICKUP',
    WEB: 'WEB'
};
exports.PaymentStatus = {
    PENDENTE: 'PENDENTE',
    APROVADO: 'APROVADO',
    RECUSADO: 'RECUSADO'
};
