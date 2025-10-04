import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de famille est requis' })
  lastName: string;

  @ApiProperty({ example: '+233500000000' })
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phoneNumber: string;
}