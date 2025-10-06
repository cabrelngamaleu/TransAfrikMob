import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { KycVerification } from "./entities/kyc-verification.entity";
import { VerificationStatus } from "./verification-status.enum";
import { CreateKycVerificationDto } from "./dto/create-kyc-verification.dto";
import { UpdateKycVerificationDto } from "./dto/update-kyc-verification.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KycVerification)
    private kycVerificationRepository: Repository<KycVerification>,
    private usersService: UsersService
  ) {}

  async create(
    createKycVerificationDto: CreateKycVerificationDto
  ): Promise<KycVerification> {
    // Vérifier si l'utilisateur existe
    const user = await this.usersService.findOne(
      createKycVerificationDto.userId
    );
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createKycVerificationDto.userId} not found`
      );
    }

    // Vérifier si l'utilisateur a déjà une vérification KYC en cours
    const existingVerification = await this.kycVerificationRepository.findOne({
      where: {
        user: { id: createKycVerificationDto.userId },
        status: VerificationStatus.PENDING,
      },
    });

    if (existingVerification) {
      throw new BadRequestException(
        "User already has a pending KYC verification"
      );
    }

    const kycVerification = new KycVerification();
    kycVerification.verificationAmount =
      createKycVerificationDto.verificationAmount;
    kycVerification.status = VerificationStatus.PENDING;
    kycVerification.user = user;

    return this.kycVerificationRepository.save(kycVerification);
  }

  async findAll(): Promise<KycVerification[]> {
    return this.kycVerificationRepository.find({
      relations: ["user"],
    });
  }

  async findAllByUserId(userId: string): Promise<KycVerification[]> {
    return this.kycVerificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<KycVerification> {
    const kycVerification = await this.kycVerificationRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!kycVerification) {
      throw new NotFoundException(`KYC verification with ID ${id} not found`);
    }

    return kycVerification;
  }

  async update(
    id: string,
    updateKycVerificationDto: UpdateKycVerificationDto
  ): Promise<KycVerification> {
    const kycVerification = await this.findOne(id);

    // Si le statut est mis à jour à "approved", mettre à jour la date de vérification
    if (updateKycVerificationDto.status === VerificationStatus.APPROVED) {
      updateKycVerificationDto["verificationDate"] = new Date();
    }

    // Mettre à jour l'entité
    const updatedVerification = Object.assign(
      kycVerification,
      updateKycVerificationDto
    );
    return this.kycVerificationRepository.save(updatedVerification);
  }

  async remove(id: string): Promise<void> {
    const result = await this.kycVerificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`KYC verification with ID ${id} not found`);
    }
  }

  async getPendingVerifications(): Promise<KycVerification[]> {
    return this.kycVerificationRepository.find({
      where: { status: VerificationStatus.PENDING },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });
  }

  async approveVerification(
    id: string,
    adminId: string
  ): Promise<KycVerification> {
    return this.update(id, {
      status: VerificationStatus.APPROVED,
      verifiedBy: adminId,
    });
  }

  async rejectVerification(
    id: string,
    adminId: string,
    rejectionReason: string
  ): Promise<KycVerification> {
    if (!rejectionReason) {
      throw new BadRequestException("Rejection reason is required");
    }

    return this.update(id, {
      status: VerificationStatus.REJECTED,
      verifiedBy: adminId,
      rejectionReason,
    });
  }
}
