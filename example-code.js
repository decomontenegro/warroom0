// Exemplo de código para testar o DAG Visualizer

import { Database } from './database';
import { UserService } from './services/UserService';
import { AuthService } from './services/AuthService';
import { Logger } from './utils/Logger';

class UserController {
  constructor() {
    this.db = new Database();
    this.userService = new UserService(this.db);
    this.authService = new AuthService();
    this.logger = new Logger('UserController');
  }

  async createUser(userData) {
    try {
      this.logger.info('Creating new user');
      const user = await this.userService.create(userData);
      return { success: true, user };
    } catch (error) {
      this.logger.error('Failed to create user', error);
      return { success: false, error: error.message };
    }
  }

  async login(email, password) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const isValid = await this.authService.validatePassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid password' };
    }
    
    const token = this.authService.generateToken(user);
    return { success: true, token };
  }
}

export default UserController;