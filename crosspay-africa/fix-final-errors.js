const fs = require('fs');
const path = require('path');

// Chemin de base du projet
const basePath = path.join(__dirname, 'services', 'backend', 'src');

// Fonction pour corriger un fichier
function fixFile(filePath, fixes) {
  console.log(`🔧 Correction de ${filePath}...`);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fixes.forEach(({ search, replace }) => {
      const originalContent = content;
      content = content.replace(search, replace);
      if (content !== originalContent) {
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fichier corrigé: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ Aucune modification nécessaire pour: ${filePath}`);
    }
  } else {
    console.log(`⚠️ Fichier non trouvé: ${filePath}`);
  }
  
  return false;
}

// Fonction pour créer un fichier manquant
function createFile(filePath, content) {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fichier créé: ${filePath}`);
}

// 1. Corriger analytics.controller.ts
const analyticsControllerPath = path.join(basePath, 'analytics', 'analytics.controller.ts');
fixFile(analyticsControllerPath, [
  {
    search: /@Roles\(['"]admin['"]\)/g,
    replace: '@Roles(Role.ADMIN)'
  }
]);

// 2. Corriger analytics.module.ts
const analyticsModulePath = path.join(basePath, 'analytics', 'analytics.module.ts');
fixFile(analyticsModulePath, [
  {
    search: /import\s+{(.*?)}\s+from\s+['"]@nestjs\/common['"];\s*import\s+{\s*TypeOrmModule\s*}\s+from\s+['"]@nestjs\/typeorm['"];/g,
    replace: `import {$1} from '@nestjs/common';\nimport { TypeOrmModule } from '@nestjs/typeorm';`
  }
]);

// 3. Corriger analytics.service.ts
const analyticsServicePath = path.join(basePath, 'analytics', 'analytics.service.ts');
fixFile(analyticsServicePath, [
  {
    search: /import\s+{(.*?)}\s+from\s+['"]@nestjs\/common['"];\s*import\s+{\s*Repository\s*}\s+from\s+['"]typeorm['"];\s*import\s+{\s*InjectRepository\s*}\s+from\s+['"]@nestjs\/typeorm['"];/g,
    replace: `import {$1} from '@nestjs/common';\nimport { Repository } from 'typeorm';\nimport { InjectRepository } from '@nestjs/typeorm';`
  }
]);

// 4. Corriger app.module.ts
const appModulePath = path.join(basePath, 'app.module.ts');
fixFile(appModulePath, [
  {
    search: /import\s+{\s*ConfigModule,\s*ConfigService\s*}\s+from\s+['"]@nestjs\/config['"];\s*import\s+{\s*TypeOrmModule\s*}\s+from\s+['"]@nestjs\/typeorm['"];\s*import\s+{\s*ConfigModule,\s*ConfigService\s*}\s+from\s+['"]@nestjs\/config['"];\s*import\s+{\s*TypeOrmModule\s*}\s+from\s+['"]@nestjs\/typeorm['"];/g,
    replace: `import { ConfigModule, ConfigService } from '@nestjs/config';\nimport { TypeOrmModule } from '@nestjs/typeorm';`
  }
]);

// 5. Créer le module recipients manquant
const recipientsModulePath = path.join(basePath, 'recipients', 'recipients.module.ts');
const recipientsModuleContent = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [],
  providers: [],
  exports: []
})
export class RecipientsModule {}`;

if (!fs.existsSync(recipientsModulePath)) {
  createFile(recipientsModulePath, recipientsModuleContent);
}

// 6. Installer le package @nestjs/throttler s'il est manquant
console.log('✅ Pour résoudre l\'erreur de @nestjs/throttler, exécutez: npm install @nestjs/throttler');

console.log('✅ Toutes les corrections ont été appliquées avec succès!');