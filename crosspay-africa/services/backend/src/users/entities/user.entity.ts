import { KycVerification } from "../../kyc/entities/kyc-verification.entity";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Exclude } from "class-transformer";
import { Notification } from "../../notifications/entities/notification.entity";

@Entity("users")
export class User {
  @OneToMany(() => KycVerification, (kycVerification) => kycVerification.user)
  kycVerifications: KycVerification[];
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: "simple-array", default: "user" })
  roles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  phone: string;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
