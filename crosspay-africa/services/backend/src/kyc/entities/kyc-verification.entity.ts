import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { VerificationStatus } from "../verification-status.enum";

export { VerificationStatus };

@Entity("kyc_verifications")
export class KycVerification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  verificationAmount: number;

  @Column({
    type: "enum",
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @ManyToOne(() => User, (user) => user.kycVerifications)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  verificationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
