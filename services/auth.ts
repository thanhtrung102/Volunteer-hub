import { User, UserRole, UserStatus } from '../types';
import { MOCK_USERS } from '../mockData';

// Mock response types
interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private static instance: AuthService;
  private users = MOCK_USERS;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async delay(ms: number = 800): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Authenticates a user with email and password.
   */
  public async login(email: string, password: string): Promise<AuthResponse> {
    await this.delay();

    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      // In a real app, verify password hash here.
      if (user.status === UserStatus.LOCKED) {
          throw new Error('Account is locked. Please contact support.');
      }
      
      return {
        user,
        token: 'mock-jwt-token-' + user.id + '-' + Date.now(),
      };
    }

    throw new Error('Invalid email or password');
  }

  /**
   * Registers a new user.
   */
  public async register(email: string, password: string, fullName: string, role: UserRole): Promise<AuthResponse> {
    await this.delay(1000);

    const existingUser = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const newUser: User = {
      id: Math.floor(Math.random() * 10000) + 1000,
      email,
      fullName,
      role,
      status: UserStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
    };

    // Commit to mock DB
    this.users.push(newUser);

    return {
      user: newUser,
      token: 'mock-jwt-token-' + newUser.id + '-' + Date.now(),
    };
  }
}

export const authService = AuthService.getInstance();