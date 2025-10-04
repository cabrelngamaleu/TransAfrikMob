import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { KycService } from './kyc.service';
import { CreateKycVerificationDto } from './dto/create-kyc-verification.dto';
import { UpdateKycVerificationDto } from './dto/update-kyc-verification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createKycVerificationDto: CreateKycVerificationDto, @Request() req) {
    // Si l'utilisateur n'est pas admin, forcer l'userId à celui de l'utilisateur connecté
    if (!req.user.roles.includes(Role.ADMIN)) {
      createKycVerificationDto.userId = req.user.id;
    }
    return this.kycService.create(createKycVerificationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.kycService.findAll();
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getPendingVerifications() {
    return this.kycService.getPendingVerifications();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  findAllForCurrentUser(@Request() req) {
    return this.kycService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.kycService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateKycVerificationDto: UpdateKycVerificationDto) {
    return this.kycService.update(id, updateKycVerificationDto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  approve(@Param('id') id: string, @Request() req) {
    return this.kycService.approveVerification(id, req.user.id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  reject(@Param('id') id: string, @Body('rejectionReason') rejectionReason: string, @Request() req) {
    return this.kycService.rejectVerification(id, req.user.id, rejectionReason);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.kycService.remove(id);
  }
}