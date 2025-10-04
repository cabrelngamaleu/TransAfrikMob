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

// Correction de analytics.controller.ts
function fixAnalyticsController() {
  const filePath = path.join(basePath, 'analytics', 'analytics.controller.ts');
  let content = readFile(filePath);
  
  // Corriger les imports
  content = content.replace(
    /import\s+{\s*Roles\s*}\s+from\s+['"].*['"]/,
    "import { Roles } from '../auth/roles.decorator'"
  );
  
  if (!content.includes("import { Role } from '../auth/role.enum'")) {
    // Ajouter l'import de Role
    const importLines = content.split('\n');
    let newContent = '';
    let importAdded = false;
    
    for (const line of importLines) {
      newContent += line + '\n';
      if (line.includes('import') && !importAdded) {
        newContent += "import { Role } from '../auth/role.enum';\n";
        importAdded = true;
      }
    }
    
    content = newContent;
  }
  
  writeFile(filePath, content);
}

// Correction de analytics.service.ts
function fixAnalyticsService() {
  const filePath = path.join(basePath, 'analytics', 'analytics.service.ts');
  let content = readFile(filePath);
  
  // Supprimer les imports en double
  const lines = content.split('\n');
  const uniqueImports = new Map();
  const newLines = [];
  
  for (const line of lines) {
    if (line.trim().startsWith('import ')) {
      const importKey = line.trim().replace(/\s+/g, ' ');
      if (!uniqueImports.has(importKey)) {
        uniqueImports.set(importKey, true);
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }
  
  let newContent = newLines.join('\n');
  
  // Remplacer les références à Transaction
  newContent = newContent.replace(/@InjectRepository\(Transaction\)/g, '@InjectRepository(KycVerification)');
  newContent = newContent.replace(/Repository<Transaction>/g, 'Repository<KycVerification>');
  newContent = newContent.replace(/transactionsRepository/g, 'kycVerificationsRepository');
  
  writeFile(filePath, newContent);
}

// Correction de transaction.entity.ts
function fixTransactionEntity() {
  const filePath = path.join(basePath, 'transactions', 'entities', 'transaction.entity.ts');
  let content = readFile(filePath);
  
  // Corriger la référence à user.transactions
  content = content.replace(
    /user => user.transactions/,
    'user => user.id'
  );
  
  writeFile(filePath, content);
}

// Correction de user.entity.ts
function createUserEntity() {
  const filePath = path.join(basePath, 'users', 'entities', 'user.entity.ts');
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    const content = `import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { KycVerification } from '../../kyc/entities/kyc-verification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column()
  password: string;

  @OneToMany(() => KycVerification, kycVerification => kycVerification.user)
  kycVerifications: KycVerification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`;
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fichier créé: ${filePath}`);
  }
}

// Exécution des corrections
console.log('🔧 Application des corrections finales...');
fixAnalyticsController();
fixAnalyticsService();
fixTransactionEntity();
createUserEntity();
console.log('✅ Toutes les corrections ont été appliquées avec succès!');