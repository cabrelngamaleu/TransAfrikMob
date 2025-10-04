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

// Correction des erreurs de type dans analytics.service.ts
function fixAnalyticsService() {
  const filePath = path.join(basePath, 'analytics', 'analytics.service.ts');
  let content = readFile(filePath);
  
  // Ajouter l'import de VerificationStatus
  if (!content.includes('import { VerificationStatus }')) {
    const importStatement = `import { VerificationStatus } from '../kyc/entities/kyc-verification.entity';\n`;
    content = content.replace('import { Injectable } from', importStatement + 'import { Injectable } from');
  }
  
  // Corriger les erreurs de type
  content = content.replace(/status: 'pending'/g, "status: VerificationStatus.PENDING");
  content = content.replace(/where: { status }/g, "where: { status: status as VerificationStatus }");
  
  writeFile(filePath, content);
}

// Correction de l'erreur de ThrottlerModule dans app.module.ts
function fixAppModule() {
  const filePath = path.join(basePath, 'app.module.ts');
  let content = readFile(filePath);
  
  // Corriger la configuration du ThrottlerModule
  const oldConfig = /useFactory: \(configService: ConfigService\) => \(\{[\s\S]*?ttl: configService\.get[\s\S]*?limit: configService\.get[\s\S]*?\}\)/;
  const newConfig = `useFactory: async (configService: ConfigService) => ({
      ttl: configService.get('THROTTLE_TTL', 60),
      limit: configService.get('THROTTLE_LIMIT', 10),
    })`;
  
  content = content.replace(oldConfig, newConfig);
  
  writeFile(filePath, content);
}

// Exécution des corrections
console.log('🔧 Correction des erreurs de type...');
fixAnalyticsService();
fixAppModule();
console.log('✅ Toutes les corrections ont été appliquées avec succès!');