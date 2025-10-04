const fs = require('fs');
const path = require('path');

// Chemins des fichiers à corriger
const analyticsServicePath = path.join(__dirname, 'services', 'backend', 'src', 'analytics', 'analytics.service.ts');
const analyticsControllerPath = path.join(__dirname, 'services', 'backend', 'src', 'analytics', 'analytics.controller.ts');
const analyticsModulePath = path.join(__dirname, 'services', 'backend', 'src', 'analytics', 'analytics.module.ts');
const kycVerificationEntityPath = path.join(__dirname, 'services', 'backend', 'src', 'kyc', 'entities', 'kyc-verification.entity.ts');

// Fonction pour vérifier si un fichier existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Fonction pour créer les répertoires nécessaires
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Fonction pour corriger le fichier analytics.service.ts
function fixAnalyticsService() {
  console.log('🔧 Correction de analytics.service.ts...');
  
  if (!fileExists(analyticsServicePath)) {
    console.error(`❌ Le fichier ${analyticsServicePath} n'existe pas.`);
    return false;
  }

  // Lire le contenu du fichier
  let content = fs.readFileSync(analyticsServicePath, 'utf8');

  // Corriger les imports en double
  content = content.replace(/import { Repository } from 'typeorm';\s*import { Repository, Between } from 'typeorm';/g, 
    `import { Repository, Between } from 'typeorm';`);
  
  // Autre cas possible de duplication
  content = content.replace(/import { Repository } from 'typeorm';([\s\S]*?)import { Repository,/g, 
    `import {$1import {`);
  
  // Corriger les références à 'amount' et 'status'
  content = content.replace(/'amount'/g, `'verificationAmount'`);
  content = content.replace(/t.amount/g, `t.verificationAmount`);
  content = content.replace(/t.status === 'completed'/g, `t.status === VerificationStatus.COMPLETED`);

  // S'assurer que VerificationStatus est correctement importé
  if (!content.includes('import { VerificationStatus }')) {
    content = content.replace(/import {/, 
      `import { VerificationStatus } from '../kyc/verification-status.enum';\nimport {`);
  }

  // Écrire le contenu corrigé
  fs.writeFileSync(analyticsServicePath, content);
  console.log(`✅ Fichier corrigé: ${analyticsServicePath}`);
  return true;
}

// Fonction pour corriger le fichier analytics.controller.ts
function fixAnalyticsController() {
  console.log('🔧 Correction de analytics.controller.ts...');
  
  if (!fileExists(analyticsControllerPath)) {
    console.error(`❌ Le fichier ${analyticsControllerPath} n'existe pas.`);
    return false;
  }

  // Lire le contenu du fichier
  let content = fs.readFileSync(analyticsControllerPath, 'utf8');

  // Corriger l'import de Role
  if (!content.includes('import { Role } from')) {
    content = content.replace(/import {/, 
      `import { Role } from '../auth/role.enum';\nimport {`);
  }

  // Corriger l'import de Roles
  if (!content.includes('import { Roles } from')) {
    content = content.replace(/import {/, 
      `import { Roles } from '../auth/roles.decorator';\nimport {`);
  }

  // Écrire le contenu corrigé
  fs.writeFileSync(analyticsControllerPath, content);
  console.log(`✅ Fichier corrigé: ${analyticsControllerPath}`);
  return true;
}

// Fonction pour corriger le fichier analytics.module.ts
function fixAnalyticsModule() {
  console.log('🔧 Correction de analytics.module.ts...');
  
  if (!fileExists(analyticsModulePath)) {
    console.error(`❌ Le fichier ${analyticsModulePath} n'existe pas.`);
    return false;
  }

  // Lire le contenu du fichier
  let content = fs.readFileSync(analyticsModulePath, 'utf8');

  // Corriger les imports pour éviter les conflits avec Transaction
  content = content.replace(/import { Transaction } from [^;]+;/g, '');
  
  // Remplacer les références à Transaction par KycVerification
  content = content.replace(/\bTransaction\b/g, 'KycVerification');
  
  // S'assurer que KycVerification est correctement importé
  if (!content.includes('import { KycVerification }')) {
    content = content.replace(/import {/, 
      `import { KycVerification } from '../kyc/entities/kyc-verification.entity';\nimport {`);
  }

  // Écrire le contenu corrigé
  fs.writeFileSync(analyticsModulePath, content);
  console.log(`✅ Fichier corrigé: ${analyticsModulePath}`);
  return true;
}

// Fonction pour créer ou mettre à jour l'entité KycVerification
function createKycVerificationEntity() {
  console.log('🔧 Création/mise à jour de kyc-verification.entity.ts...');
  
  // S'assurer que le répertoire existe
  ensureDirectoryExists(kycVerificationEntityPath);
  
  // Contenu de l'entité KycVerification
  const content = `import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VerificationStatus } from '../verification-status.enum';

@Entity('kyc_verifications')
export class KycVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  verificationAmount: number;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING
  })
  status: VerificationStatus;

  @ManyToOne(() => User, user => user.kycVerifications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`;

  // Écrire le contenu
  fs.writeFileSync(kycVerificationEntityPath, content);
  console.log(`✅ Fichier créé/mis à jour: ${kycVerificationEntityPath}`);

  // Créer aussi l'enum VerificationStatus s'il n'existe pas
  const verificationStatusPath = path.join(__dirname, 'services', 'backend', 'src', 'kyc', 'verification-status.enum.ts');
  ensureDirectoryExists(verificationStatusPath);
  
  if (!fileExists(verificationStatusPath)) {
    const enumContent = `export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}`;
    fs.writeFileSync(verificationStatusPath, enumContent);
    console.log(`✅ Fichier créé: ${verificationStatusPath}`);
  }

  // Mettre à jour l'entité User si elle existe
  const userEntityPath = path.join(__dirname, 'services', 'backend', 'src', 'users', 'entities', 'user.entity.ts');
  if (fileExists(userEntityPath)) {
    let userContent = fs.readFileSync(userEntityPath, 'utf8');
    
    // Ajouter la relation avec KycVerification si elle n'existe pas
    if (!userContent.includes('kycVerifications')) {
      // Ajouter l'import de KycVerification
      if (!userContent.includes('import { KycVerification }')) {
        userContent = userContent.replace(/import {/, 
          `import { KycVerification } from '../../kyc/entities/kyc-verification.entity';\nimport {`);
      }
      
      // Ajouter la relation OneToMany
      userContent = userContent.replace(/export class User {/, 
        `export class User {
  @OneToMany(() => KycVerification, kycVerification => kycVerification.user)
  kycVerifications: KycVerification[];`);
      
      // S'assurer que OneToMany est importé
      if (!userContent.includes('OneToMany')) {
        userContent = userContent.replace(/import { Entity, Column, PrimaryGeneratedColumn/,
          `import { Entity, Column, PrimaryGeneratedColumn, OneToMany`);
      }
      
      fs.writeFileSync(userEntityPath, userContent);
      console.log(`✅ Fichier mis à jour: ${userEntityPath}`);
    }
  }

  return true;
}

// Exécution des corrections
console.log('🔧 Application des corrections finales complètes...');

let success = true;
success = fixAnalyticsService() && success;
success = fixAnalyticsController() && success;
success = fixAnalyticsModule() && success;
success = createKycVerificationEntity() && success;

if (success) {
  console.log('✅ Toutes les corrections ont été appliquées avec succès!');
} else {
  console.error('❌ Certaines corrections n\'ont pas pu être appliquées.');
}