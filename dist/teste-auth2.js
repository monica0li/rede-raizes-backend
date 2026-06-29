"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = require("./application/services/AuthService");
const authService = new AuthService_1.AuthService();
async function testar() {
    try {
        console.log('🔍 Testando cadastro...');
        const result = await authService.register({
            email: 'teste-email@teste.com',
            password: 'Senha@123',
            name: 'Usuário Teste',
            role: 'CLIENTE'
        });
        console.log('Sucesso:', result);
    }
    catch (error) {
        console.error('Erro:', error.message);
    }
}
testar();
