const fs = require('fs');
const path = require('path');

// Chemin de base du projet
const basePath = path.join(__dirname, 'services', 'backend', 'src');

// Fonction pour lire un fichier
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Fonction pour écrire dans un fichier
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fichier corrigé: ${filePath}`);
}

// Correction de app.module.ts pour TypeOrmModule
function fixAppModule() {
  const filePath = path.join(basePath, 'app.module.ts');
  let content = readFile(filePath);
  
  // Corriger la configuration du TypeOrmModule
  const typeOrmConfig = `useFactory: async (configService: ConfigService) => {
      return {
        type: configService.get('DB_TYPE', 'postgres'),
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'crosspay'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE', true),
      } as TypeOrmModuleOptions;
    }`;
  
  // Ajouter l'import de TypeOrmModuleOptions s'il n'existe pas
  if (!content.includes('TypeOrmModuleOptions')) {
    content = content.replace(
      'import { TypeOrmModule } from',
      'import { TypeOrmModule, TypeOrmModuleOptions } from'
    );
  }
  
  // Remplacer la configuration existante
  content = content.replace(
    /useFactory: async \(configService: ConfigService\) =>[\s\S]*?synchronize[\s\S]*?\}\)/,
    typeOrmConfig
  );
  
  writeFile(filePath, content);
}

// Correction de analytics.service.ts
function fixAnalyticsService() {
  const filePath = path.join(basePath, 'analytics', 'analytics.service.ts');
  let content = readFile(filePath);
  
  // Créer le fichier VerificationStatus s'il n'existe pas
  const kycVerificationPath = path.join(basePath, 'kyc', 'entities', 'kyc-verification.entity.ts');
  const kycDir = path.dirname(kycVerificationPath);
  
  if (!fs.existsSync(kycDir)) {
    fs.mkdirSync(kycDir, { recursive: true });
  }
  
  if (!fs.existsSync(kycVerificationPath)) {
    const kycVerificationContent = `import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity()
export class KycVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING
  })
  status: VerificationStatus;

  @ManyToOne(() => User, user => user.kycVerifications)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`;
    
    fs.writeFileSync(kycVerificationPath, kycVerificationContent, 'utf8');
    console.log(`✅ Fichier créé: ${kycVerificationPath}`);
  }
  
  // Corriger les erreurs de type dans analytics.service.ts
  content = content.replace(/status: 'pending'/g, "status: VerificationStatus.PENDING");
  content = content.replace(/where: { status }/g, "where: { status: status as VerificationStatus }");
  
  writeFile(filePath, content);
}

// Exécution des corrections
console.log('🔧 Correction des erreurs TypeORM...');
fixAppModule();
fixAnalyticsService();
console.log('✅ Toutes les corrections ont été appliquées avec succès!');