const fs = require('fs');
const path = require('path');

// Chemin de base du projet
const basePath = path.join(__dirname, 'services', 'backend', 'src');

// Fonction pour créer le fichier role.enum.ts s'il n'existe pas
function createRoleEnum() {
  const roleEnumPath = path.join(basePath, 'users', 'enums');
  const roleEnumFile = path.join(roleEnumPath, 'role.enum.ts');
  
  // Créer le dossier enums s'il n'existe pas
  if (!fs.existsSync(roleEnumPath)) {
    fs.mkdirSync(roleEnumPath, { recursive: true });
  }
  
  // Créer le fichier role.enum.ts s'il n'existe pas
  if (!fs.existsSync(roleEnumFile)) {
    const roleEnumContent = `export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  MERCHANT = 'merchant',
  AGENT = 'agent'
}`;
    fs.writeFileSync(roleEnumFile, roleEnumContent);
    console.log('✅ Fichier role.enum.ts créé avec succès');
  }
}

// Fonction pour corriger les imports de Role dans les fichiers
function fixRoleImports(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer les imports incorrects de Role
    content = content.replace(
      /import\s+{\s*Role\s*}\s+from\s+['"].*['"]/g,
      `import { Role } from '../users/enums/role.enum'`
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Imports de Role corrigés dans ${filePath}`);
  }
}

// Fonction pour corriger les erreurs dans analytics.controller.ts
function fixAnalyticsController() {
  const filePath = path.join(basePath, 'analytics', 'analytics.controller.ts');
  fixRoleImports(filePath);
}

// Fonction pour corriger les erreurs dans analytics.module.ts
function fixAnalyticsModule() {
  const filePath = path.join(basePath, 'analytics', 'analytics.module.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ajouter les imports manquants
    if (!content.includes('import { TypeOrmModule }')) {
      content = content.replace(
        /import\s+{(.*?)}\s+from\s+['"]@nestjs\/common['"];/,
        `import {$1} from '@nestjs/common';\nimport { TypeOrmModule } from '@nestjs/typeorm';`
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Erreurs corrigées dans ${filePath}`);
  }
}

// Fonction pour corriger les erreurs dans analytics.service.ts
function fixAnalyticsService() {
  const filePath = path.join(basePath, 'analytics', 'analytics.service.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ajouter les imports manquants
    if (!content.includes('import { Repository }')) {
      content = content.replace(
        /import\s+{(.*?)}\s+from\s+['"]@nestjs\/common['"];/,
        `import {$1} from '@nestjs/common';\nimport { Repository } from 'typeorm';\nimport { InjectRepository } from '@nestjs/typeorm';`
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Erreurs corrigées dans ${filePath}`);
  }
}

// Fonction pour corriger les erreurs dans app.module.ts
function fixAppModule() {
  const filePath = path.join(basePath, 'app.module.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ajouter les imports manquants
    if (!content.includes('import { ConfigModule }')) {
      content = content.replace(
        /import\s+{(.*?)}\s+from\s+['"]@nestjs\/common['"];/,
        `import {$1} from '@nestjs/common';\nimport { ConfigModule, ConfigService } from '@nestjs/config';\nimport { TypeOrmModule } from '@nestjs/typeorm';`
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Erreurs corrigées dans ${filePath}`);
  }
}

// Fonction pour corriger l'erreur dans auth.service.ts
function fixAuthService() {
  const filePath = path.join(basePath, 'auth', 'auth.service.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer user.phone par user.phoneNumber
    content = content.replace(/user\.phone/g, 'user.phoneNumber');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Erreur corrigée dans ${filePath}`);
  }
}

// Fonction pour corriger l'erreur dans kyc-verification.entity.ts
function fixKycVerificationEntity() {
  const filePath = path.join(basePath, 'kyc', 'entities', 'kyc-verification.entity.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer user.notifications par user?.notifications || []
    content = content.replace(/user\.notifications/g, 'user?.notifications || []');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Erreur corrigée dans ${filePath}`);
  }
}

// Fonction pour corriger les erreurs dans kyc.controller.ts
function fixKycController() {
  const filePath = path.join(basePath, 'kyc', 'kyc.controller.ts');
  fixRoleImports(filePath);
}

// Exécution des corrections
try {
  console.log('🔧 Début des corrections...');
  
  // Créer le fichier role.enum.ts
  createRoleEnum();
  
  // Corriger les erreurs dans chaque fichier
  fixAnalyticsController();
  fixAnalyticsModule();
  fixAnalyticsService();
  fixAppModule();
  fixAuthService();
  fixKycVerificationEntity();
  fixKycController();
  
  console.log('✅ Toutes les corrections ont été appliquées avec succès!');
} catch (error) {
  console.error('❌ Une erreur est survenue:', error);
}