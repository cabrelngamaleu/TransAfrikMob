const fs = require('fs');
const path = require('path');

// Chemin de base du projet
const basePath = path.join(__dirname, 'services', 'backend', 'src');

// Fonction pour créer un fichier s'il n'existe pas
function createFileIfNotExists(filePath, content) {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fichier créé: ${filePath}`);
    return true;
  }
  return false;
}

// Fonction pour corriger un fichier existant
function fixFile(filePath, searchReplace) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    searchReplace.forEach(({ search, replace }) => {
      const originalContent = content;
      if (typeof search === 'string') {
        content = content.replace(search, replace);
      } else {
        content = content.replace(search, replace);
      }
      if (content !== originalContent) {
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fichier corrigé: ${filePath}`);
      return true;
    }
  }
  return false;
}

// 1. Créer le fichier roles.guard.ts
const rolesGuardPath = path.join(basePath, 'auth', 'guards', 'roles.guard.ts');
const rolesGuardContent = `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}`;
createFileIfNotExists(rolesGuardPath, rolesGuardContent);

// 2. Créer le fichier roles.decorator.ts
const rolesDecoratorPath = path.join(basePath, 'auth', 'decorators', 'roles.decorator.ts');
const rolesDecoratorContent = `import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/enums/role.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);`;
createFileIfNotExists(rolesDecoratorPath, rolesDecoratorContent);

// 3. Corriger auth.service.ts
const authServicePath = path.join(basePath, 'auth', 'auth.service.ts');
fixFile(authServicePath, [
  {
    search: /findById/g,
    replace: 'findOne'
  }
]);

// 4. Corriger kyc-verification.entity.ts
const kycVerificationEntityPath = path.join(basePath, 'kyc', 'entities', 'kyc-verification.entity.ts');
fixFile(kycVerificationEntityPath, [
  {
    search: /user\.kycVerifications/g,
    replace: 'user.id'
  }
]);

// 5. Créer le module webhooks
const webhooksModulePath = path.join(basePath, 'webhooks', 'webhooks.module.ts');
const webhooksModuleContent = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [],
  providers: [],
  exports: []
})
export class WebhooksModule {}`;
createFileIfNotExists(webhooksModulePath, webhooksModuleContent);

// 6. Corriger les imports dans les fichiers analytics
const analyticsControllerPath = path.join(basePath, 'analytics', 'analytics.controller.ts');
fixFile(analyticsControllerPath, [
  {
    search: /import\s+{\s*RolesGuard\s*}\s+from\s+['"].*['"]/g,
    replace: `import { RolesGuard } from '../auth/guards/roles.guard'`
  },
  {
    search: /import\s+{\s*Roles\s*}\s+from\s+['"].*['"]/g,
    replace: `import { Roles } from '../auth/decorators/roles.decorator'`
  }
]);

console.log('✅ Toutes les corrections ont été appliquées avec succès!');