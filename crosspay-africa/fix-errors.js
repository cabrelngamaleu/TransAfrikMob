const fs = require('fs');
const path = require('path');

// Chemin de base du projet
const basePath = path.join(__dirname, 'services', 'backend', 'src');

// Liste des fichiers à corriger
const filesToFix = [
  'analytics/analytics.controller.ts',
  'analytics/analytics.module.ts',
  'analytics/analytics.service.ts',
  'app.module.ts',
  'auth/auth.service.ts',
  'kyc/entities/kyc-verification.entity.ts',
  'kyc/kyc.controller.ts'
];

// Corrections à appliquer
const fixes = {
  // Correction pour les imports de Role
  'analytics/analytics.controller.ts': [
    {
      search: /import\s+{\s*Role\s*}\s+from\s+['"].*['"]/g,
      replace: `import { Role } from '../users/enums/role.enum'`
    },
    {
      search: /import\s+{\s*Roles\s*}\s+from\s+['"].*['"]/g,
      replace: `import { Roles } from '../auth/decorators/roles.decorator'`
    }
  ],
  'analytics/analytics.module.ts': [
    {
      search: /import\s+{(.*?)}\s+from\s+['"]@nestjs\/common['"];/,
      replace: `import {$1} from '@nestjs/common';\nimport { TypeOrmModule } from '@nestjs/typeorm';`
    }
  ],
  'analytics/analytics.service.ts': [
    {
      search: /import\s+{(.*?)}\s+from\s+['"]@nestjs\/common['"];/,
      replace: `import {$1} from '@nestjs/common';\nimport { Repository } from 'typeorm';\nimport { InjectRepository } from '@nestjs/typeorm';`
    }
  ],
  'app.module.ts': [
    {
      search: /import\s+{(.*?)}\s+from\s+['"]@nestjs\/common['"];/,
      replace: `import {$1} from '@nestjs/common';\nimport { ConfigModule, ConfigService } from '@nestjs/config';\nimport { TypeOrmModule } from '@nestjs/typeorm';`
    }
  ],
  'auth/auth.service.ts': [
    {
      search: /user\.phone/g,
      replace: 'user.phoneNumber'
    }
  ],
  'kyc/entities/kyc-verification.entity.ts': [
    {
      search: /user\.notifications/g,
      replace: 'user?.notifications || []'
    }
  ],
  'kyc/kyc.controller.ts': [
    {
      search: /import\s+{\s*Role\s*}\s+from\s+['"].*['"]/g,
      replace: `import { Role } from '../users/enums/role.enum'`
    }
  ]
};

// Fonction pour appliquer les corrections
function applyFixes() {
  console.log('🔧 Début des corrections...');
  
  filesToFix.forEach(relativeFilePath => {
    const filePath = path.join(basePath, relativeFilePath);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      if (fixes[relativeFilePath]) {
        fixes[relativeFilePath].forEach(fix => {
          const originalContent = content;
          content = content.replace(fix.search, fix.replace);
          if (content !== originalContent) {
            modified = true;
          }
        });
        
        if (modified) {
          fs.writeFileSync(filePath, content);
          console.log(`✅ Corrections appliquées à ${relativeFilePath}`);
        } else {
          console.log(`ℹ️ Aucune correction nécessaire pour ${relativeFilePath}`);
        }
      }
    } else {
      console.log(`⚠️ Fichier non trouvé: ${relativeFilePath}`);
    }
  });
  
  console.log('✅ Toutes les corrections ont été appliquées!');
}

// Exécuter les corrections
try {
  applyFixes();
} catch (error) {
  console.error('❌ Une erreur est survenue:', error);
}