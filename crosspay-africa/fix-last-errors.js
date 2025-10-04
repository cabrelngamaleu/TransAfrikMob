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
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fichier créé: ${filePath}`);
    return true;
  }
  return false;
}

// Création du fichier transaction.entity.ts
function createTransactionEntity() {
  const filePath = path.join(basePath, 'transactions', 'entities', 'transaction.entity.ts');
  const content = `import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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
  
  createFileIfNotExists(filePath, content);
}

// Correction de analytics.controller.ts
function fixAnalyticsController() {
  const filePath = path.join(basePath, 'analytics', 'analytics.controller.ts');
  let content = readFile(filePath);
  
  // Importer Role depuis le bon fichier
  if (!content.includes("import { Role } from '../auth/role.enum'")) {
    content = content.replace(
      /import\s+{\s*Roles\s*}\s+from\s+['"].*['"]/,
      "import { Roles } from '../auth/roles.decorator';\nimport { Role } from '../auth/role.enum'"
    );
  }
  
  writeFile(filePath, content);
}

// Correction de analytics.module.ts
function fixAnalyticsModule() {
  const filePath = path.join(basePath, 'analytics', 'analytics.module.ts');
  let content = readFile(filePath);
  
  // Supprimer l'import de Transaction s'il existe
  content = content.replace(/import\s+{\s*Transaction\s*}\s+from\s+['"].*transaction\.entity['"];\s*\n/, '');
  
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
  
  // Supprimer l'import de Transaction s'il existe
  newContent = newContent.replace(/import\s+{\s*Transaction\s*}\s+from\s+['"].*transaction\.entity['"];\s*\n/, '');
  
  writeFile(filePath, newContent);
}

// Exécution des corrections
console.log('🔧 Correction des dernières erreurs...');
createTransactionEntity();
fixAnalyticsController();
fixAnalyticsModule();
fixAnalyticsService();
console.log('✅ Toutes les corrections ont été appliquées avec succès!');