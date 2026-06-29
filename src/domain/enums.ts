export const Roles = {
  CLIENTE: 'CLIENTE',
  ADMIN: 'ADMIN'
} as const;

export const OrderStatus = {
  AGUARDANDO_PAGAMENTO: 'AGUARDANDO_PAGAMENTO',
  PAGO: 'PAGO',
  PREPARANDO: 'PREPARANDO',
  PRONTO: 'PRONTO',
  ENTREGUE: 'ENTREGUE',
  CANCELADO: 'CANCELADO'
} as const;

export const Channel = {
  APP: 'APP',
  TOTEM: 'TOTEM',
  BALCAO: 'BALCAO',
  PICKUP: 'PICKUP',
  WEB: 'WEB'
} as const;

export const PaymentStatus = {
  PENDENTE: 'PENDENTE',
  APROVADO: 'APROVADO',
  RECUSADO: 'RECUSADO'
} as const;

export type Role = typeof Roles[keyof typeof Roles];
export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];
export type ChannelType = typeof Channel[keyof typeof Channel];
export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];