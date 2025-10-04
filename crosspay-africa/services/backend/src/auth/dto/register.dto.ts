import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email de l\'utilisateur' })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe de l\'utilisateur' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @ApiProperty({ example: 'John', description: 'Prénom de l\'utilisateur' })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Nom de famille de l\'utilisateur' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de famille est requis' })
  lastName: string;

  @ApiProperty({ example: '+233500000000', description: 'Numéro de téléphone de l\'utilisateur' })
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phoneNumber: string;
}