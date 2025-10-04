import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(userData: any) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new UnauthorizedException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Créer le nouvel utilisateur
    const newUser = await this.usersService.create({
      ...userData,
      password: hashedPassword,
      roles: ['user'], // Rôle par défaut
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...result } = newUser;
    return result;
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findOne(decoded.sub);
      
      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }
      
      const payload = { email: user.email, sub: user.id, roles: user.roles };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}