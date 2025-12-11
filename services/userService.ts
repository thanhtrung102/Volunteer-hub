import { User, UserStatus } from '../types';
import { MOCK_USERS } from '../mockData';

class UserService {
  private static instance: UserService;
  private users = MOCK_USERS;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async getAllUsers(): Promise<User[]> {
    await this.delay();
    return [...this.users];
  }

  public async getUserById(id: number): Promise<User | undefined> {
    // No delay needed for internal lookups often
    return this.users.find(u => u.id === id);
  }

  public async updateUserStatus(userId: number, status: UserStatus): Promise<User> {
    await this.delay();
    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');

    const updatedUser = {
      ...this.users[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    this.users[index] = updatedUser;
    return updatedUser;
  }

  public async exportUsers(): Promise<string> {
      await this.delay();
      const headers = "ID,Name,Email,Role,Status\n";
      const rows = this.users.map(u => `${u.id},"${u.fullName}",${u.email},${u.role},${u.status}`).join("\n");
      return headers + rows;
  }
}

export const userService = UserService.getInstance();