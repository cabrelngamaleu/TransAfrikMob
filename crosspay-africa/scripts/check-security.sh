#!/bin/bash

# Script de vérification de sécurité pour CrossPay Africa
# Usage: ./scripts/check-security.sh

set -e

echo "🔐 CrossPay Africa - Security Check"
echo "===================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteur de problèmes
ISSUES=0

# 1. Vérifier les vulnérabilités npm
echo "📦 Checking npm vulnerabilities..."
if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✓${NC} No npm vulnerabilities found"
else
    echo -e "${RED}✗${NC} npm vulnerabilities detected!"
    ISSUES=$((ISSUES+1))
fi
echo ""

# 2. Vérifier les secrets en clair
echo "🔑 Checking for exposed secrets..."
if grep -r "password.*=.*['\"].*['\"]" --include="*.ts" --include="*.js" services/ apps/ 2>/dev/null | grep -v "test" | grep -v "spec" | grep -v "mock"; then
    echo -e "${RED}✗${NC} Potential hardcoded passwords found!"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✓${NC} No hardcoded passwords found"
fi
echo ""

# 3. Vérifier les fichiers .env non ignorés
echo "📁 Checking .env files..."
if git ls-files | grep -E "\.env$" 2>/dev/null; then
    echo -e "${RED}✗${NC} .env files tracked in git!"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✓${NC} No .env files in git"
fi
echo ""

# 4. Vérifier les API keys exposées
echo "🔑 Checking for exposed API keys..."
if grep -rE "(api[_-]?key|apikey|api[_-]?secret).*=.*['\"][a-zA-Z0-9]{20,}['\"]" --include="*.ts" --include="*.js" services/ apps/ 2>/dev/null | grep -v "test" | grep -v "spec" | grep -v "your_"; then
    echo -e "${RED}✗${NC} Potential exposed API keys found!"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✓${NC} No exposed API keys found"
fi
echo ""

# 5. Vérifier les dépendances obsolètes
echo "📅 Checking for outdated dependencies..."
if npm outdated; then
    echo -e "${YELLOW}⚠${NC}  Some dependencies are outdated"
fi
echo ""

# 6. Vérifier la configuration TypeScript stricte
echo "⚙️  Checking TypeScript config..."
if grep -q '"strictNullChecks": false' services/backend/tsconfig.json; then
    echo -e "${YELLOW}⚠${NC}  strictNullChecks is disabled (recommended: enable)"
    ISSUES=$((ISSUES+1))
fi

if grep -q '"noImplicitAny": false' services/backend/tsconfig.json; then
    echo -e "${YELLOW}⚠${NC}  noImplicitAny is disabled (recommended: enable)"
    ISSUES=$((ISSUES+1))
fi
echo ""

# 7. Vérifier les TODO de sécurité
echo "📝 Checking for security TODOs..."
if grep -rn "TODO.*security\|FIXME.*security" --include="*.ts" --include="*.js" services/ apps/ 2>/dev/null; then
    echo -e "${YELLOW}⚠${NC}  Security TODOs found"
fi
echo ""

# 8. Vérifier helmet et sécurité dans main.ts
echo "🛡️  Checking security middleware..."
if ! grep -q "helmet" services/backend/src/main.ts; then
    echo -e "${RED}✗${NC} Helmet middleware not found!"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✓${NC} Helmet middleware enabled"
fi

if ! grep -q "enableCors" services/backend/src/main.ts; then
    echo -e "${YELLOW}⚠${NC}  CORS not configured"
fi
echo ""

# Résumé
echo "===================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All security checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Found $ISSUES security issue(s)${NC}"
    echo ""
    echo "Please fix the issues above before deploying to production."
    exit 1
fi
