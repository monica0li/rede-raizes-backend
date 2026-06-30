import { prisma } from '../../config/prisma';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export const VALID_ROLES = ['ADMIN', 'CLIENTE', 'ATENDENTE', 'COZINHA'];

export class AuthService {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    try {
      console.log('Iniciando cadastro para:', data.email);

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      let role = 'CLIENTE'; //Role padrão caso não seja fornecida uma valida
      
      if (data.role) {
        const roleUpper = data.role.toUpperCase();
        if (VALID_ROLES.includes(roleUpper)) {
          role = roleUpper;
        } else {
          throw new Error(`Role inválida: "${data.role}". Roles permitidas: ${VALID_ROLES.join(', ')}`);
        }
      }

      const hashedPassword = await hashPassword(data.password);
      console.log('Senha criptografada com sucesso');

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: role
        }
      });
      console.log('Usuário criado com ID:', user.id);

      const token = generateToken({
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
    } catch (error: any) {
      console.error('Erro no register:', error);
      throw error;
    }
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        throw new Error('Email ou senha inválidos');
      }

      const passwordMatch = await comparePassword(data.password, user.password);

      if (!passwordMatch) {
        throw new Error('Email ou senha inválidos');
      }

      const token = generateToken({
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
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    }
  }
}