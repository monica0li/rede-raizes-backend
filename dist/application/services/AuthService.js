"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.VALID_ROLES = void 0;
const prisma_1 = require("../../config/prisma");
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
exports.VALID_ROLES = ['ADMIN', 'CLIENTE', 'ATENDENTE', 'COZINHA'];
class AuthService {
    async register(data) {
        try {
            console.log('🔍 Iniciando cadastro para:', data.email);
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existingUser) {
                throw new Error('Email já cadastrado');
            }
            let role = 'CLIENTE'; //Role padrão caso não seja fornecida uma valida
            if (data.role) {
                const roleUpper = data.role.toUpperCase();
                if (exports.VALID_ROLES.includes(roleUpper)) {
                    role = roleUpper;
                }
                else {
                    throw new Error(`Role inválida: "${data.role}". Roles permitidas: ${exports.VALID_ROLES.join(', ')}`);
                }
            }
            const hashedPassword = await (0, hash_1.hashPassword)(data.password);
            console.log('Senha criptografada com sucesso');
            const user = await prisma_1.prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    name: data.name,
                    role: role
                }
            });
            console.log('Usuário criado com ID:', user.id);
            const token = (0, jwt_1.generateToken)({
                id: user.id,
                email: user.email,
                role: user.role
            });
            console.log('Token gerado com sucesso');
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            };
        }
        catch (error) {
            console.error('Erro no register:', error);
            throw error;
        }
    }
    async login(data) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (!user) {
                throw new Error('Email ou senha inválidos');
            }
            const passwordMatch = await (0, hash_1.comparePassword)(data.password, user.password);
            if (!passwordMatch) {
                throw new Error('Email ou senha inválidos');
            }
            const token = (0, jwt_1.generateToken)({
                id: user.id,
                email: user.email,
                role: user.role
            });
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            };
        }
        catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }
}
exports.AuthService = AuthService;
