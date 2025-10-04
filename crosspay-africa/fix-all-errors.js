const fs = require('fs');
const path = require('path');

console.log('🔧 Correction automatique des erreurs dans le projet CrossPay Africa');

// Correction des erreurs dans analytics.controller.ts
try {
  const analyticsControllerPath = path.join(__dirname, 'services/backend/src/analytics/analytics.controller.ts');
  let content = fs.readFileSync(analyticsControllerPath, 'utf8');
  
  // Remplacer les imports problématiques
  content = content.replace(/import { Role } from '..\/users\/entities\/user.entity';/g, 
    "import { Role } from '../users/enums/role.enum';");
  
  fs.writeFileSync(analyticsControllerPath, content);
  console.log('✅ Correction de analytics.controller.ts réussie');
} catch (error) {
  console.log('⚠️ Erreur lors de la correction de analytics.controller.ts:', error.message);
}

// Correction des erreurs dans kyc.controller.ts
try {
  const kycControllerPath = path.join(__dirname, 'services/backend/src/kyc/kyc.controller.ts');
  let content = fs.readFileSync(kycControllerPath, 'utf8');
  
  // Remplacer les imports problématiques
  content = content.replace(/import { Role } from '..\/users\/entities\/user.entity';/g, 
    "import { Role } from '../users/enums/role.enum';");
  
  fs.writeFileSync(kycControllerPath, content);
  console.log('✅ Correction de kyc.controller.ts réussie');
} catch (error) {
  console.log('⚠️ Erreur lors de la correction de kyc.controller.ts:', error.message);
}

// Création du fichier role.enum.ts s'il n'existe pas
try {
  const roleEnumPath = path.join(__dirname, 'services/backend/src/users/enums');
  const roleEnumFilePath = path.join(roleEnumPath, 'role.enum.ts');
  
  if (!fs.existsSync(roleEnumPath)) {
    fs.mkdirSync(roleEnumPath, { recursive: true });
  }
  
  if (!fs.existsSync(roleEnumFilePath)) {
    const roleEnumContent = `export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  AGENT = 'agent',
  MERCHANT = 'merchant'
}`;
    fs.writeFileSync(roleEnumFilePath, roleEnumContent);
    console.log('✅ Création de role.enum.ts réussie');
  }
} catch (error) {
  console.log('⚠️ Erreur lors de la création de role.enum.ts:', error.message);
}

// Correction des erreurs dans kyc-verification.entity.ts
try {
  const kycEntityPath = path.join(__dirname, 'services/backend/src/kyc/entities/kyc-verification.entity.ts');
  let content = fs.readFileSync(kycEntityPath, 'utf8');
  
  // Remplacer les références problématiques
  content = content.replace(/user\.notifications/g, 'user?.notifications || []');
  
  fs.writeFileSync(kycEntityPath, content);
  console.log('✅ Correction de kyc-verification.entity.ts réussie');
} catch (error) {
  console.log('⚠️ Erreur lors de la correction de kyc-verification.entity.ts:', error.message);
}

// Correction des erreurs dans auth.service.ts
try {
  const authServicePath = path.join(__dirname, 'services/backend/src/auth/auth.service.ts');
  let content = fs.readFileSync(authServicePath, 'utf8');
  
  // Remplacer les références problématiques
  content = content.replace(/user\.phone/g, 'user.phoneNumber');
  
  fs.writeFileSync(authServicePath, content);
  console.log('✅ Correction de auth.service.ts réussie');
} catch (error) {
  console.log('⚠️ Erreur lors de la correction de auth.service.ts:', error.message);
}

console.log('🎉 Corrections automatiques terminées!');
console.log('Exécutez maintenant "node build-partial.js" pour compiler le projet.');