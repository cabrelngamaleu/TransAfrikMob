import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer un utilisateur" })
  @ApiResponse({ status: 201, description: "Utilisateur créé avec succès" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer tous les utilisateurs" })
  @ApiResponse({
    status: 200,
    description: "Liste des utilisateurs récupérée avec succès",
  })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer un utilisateur par ID" })
  @ApiResponse({ status: 200, description: "Utilisateur récupéré avec succès" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour un utilisateur" })
  @ApiResponse({
    status: 200,
    description: "Utilisateur mis à jour avec succès",
  })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer un utilisateur" })
  @ApiResponse({ status: 200, description: "Utilisateur supprimé avec succès" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
