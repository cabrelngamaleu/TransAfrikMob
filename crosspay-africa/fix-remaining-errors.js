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

// Fonction pour créer un fichier s'il n'existe pas
function createFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fichier créé: ${filePath}`);
    return true;
  }
  return false;
}

// Correction de analytics.controller.ts
function fixAnalyticsController() {
  const filePath = path.join(basePath, 'analytics', 'analytics.controller.ts');
  let content = readFile(filePath);
  
  // Vérifier si le fichier contient déjà l'import correct
  if (!content.includes("import { Role } from '../auth/role.enum'")) {
    // Remplacer l'import incorrect par le bon
    content = content.replace(
      /import\s+{\s*Role\s*}\s+from\s+['"].*['"]/,
      "import { Role } from '../auth/role.enum'"
    );
    
    writeFile(filePath, content);
  } else {
    console.log(`ℹ️ Aucune modification nécessaire pour: ${filePath}`);
  }
}

// Correction de analytics.module.ts
function fixAnalyticsModule() {
  const filePath = path.join(basePath, 'analytics', 'analytics.module.ts');
  let content = readFile(filePath);
  
  // Supprimer les imports en double
  const importLines = content.split('\n');
  const uniqueImports = new Map();
  
  const newLines = [];
  for (const line of importLines) {
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
  
  const newContent = newLines.join('\n');
  if (newContent !== content) {
    writeFile(filePath, newContent);
  } else {
    console.log(`ℹ️ Aucune modification nécessaire pour: ${filePath}`);
  }
}

// Correction de analytics.service.ts
function fixAnalyticsService() {
  const filePath = path.join(basePath, 'analytics', 'analytics.service.ts');
  let content = readFile(filePath);
  
  // 1. Supprimer les imports en double
  const importLines = content.split('\n');
  const uniqueImports = new Map();
  
  const newLines = [];
  for (const line of importLines) {
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
  
  // 2. Ajouter l'import manquant pour Transaction
  let newContent = newLines.join('\n');
  if (!newContent.includes("import { Transaction } from '../transactions/entities/transaction.entity'")) {
    // Créer le fichier transaction.entity.ts s'il n'existe pas
    const transactionEntityPath = path.join(basePath, 'transactions', 'entities', 'transaction.entity.ts');
    const transactionEntityDir = path.dirname(transactionEntityPath);
    
    if (!fs.existsSync(transactionEntityDir)) {
      fs.mkdirSync(transactionEntityDir, { recursive: true });
    }
    
    const transactionEntityContent = `import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => User, user => user.transactions)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`;
    
    createFileIfNotExists(transactionEntityPath, transactionEntityContent);
  }
  
  writeFile(filePath, newContent);
}

// Correction de app.module.ts
function fixAppModule() {
  const filePath = path.join(basePath, 'app.module.ts');
  let content = readFile(filePath);
  
  // Corriger la configuration du TypeOrmModule
  const oldTypeOrmConfig = /useFactory: async \(configService: ConfigService\) => \(\{[\s\S]*?ttl: configService\.get[\s\S]*?limit: configService\.get[\s\S]*?\}\)/;
  const newTypeOrmConfig = `useFactory: async (configService: ConfigService) => ({
      type: configService.get('DB_TYPE', 'postgres'),
      host: configService.get('DB_HOST', 'localhost'),
      port: configService.get('DB_PORT', 5432),
      username: configService.get('DB_USERNAME', 'postgres'),
      password: configService.get('DB_PASSWORD', 'postgres'),
      database: configService.get('DB_DATABASE', 'crosspay'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: configService.get('DB_SYNCHRONIZE', true),
    })`;
  
  content = content.replace(oldTypeOrmConfig, newTypeOrmConfig);
  
  writeFile(filePath, content);
}

// Exécution des corrections
console.log('🔧 Correction des erreurs restantes...');
fixAnalyticsController();
fixAnalyticsModule();
fixAnalyticsService();
fixAppModule();
console.log('✅ Toutes les corrections ont été appliquées avec succès!');