import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({ summary: "Connexion utilisateur" })
  @ApiResponse({ status: 200, description: "Connexion réussie" })
  @ApiResponse({ status: 401, description: "Identifiants invalides" })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(req.user);
  }

  @Post("register")
  @ApiOperation({ summary: "Inscription utilisateur" })
  @ApiResponse({ status: 201, description: "Utilisateur créé avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Rafraîchir le token JWT" })
  @ApiResponse({ status: 200, description: "Token rafraîchi avec succès" })
  @ApiResponse({ status: 401, description: "Token invalide" })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtenir le profil utilisateur" })
  @ApiResponse({ status: 200, description: "Profil récupéré avec succès" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  getProfile(@Request() req) {
    return req.user;
  }
}
