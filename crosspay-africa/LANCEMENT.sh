#!/bin/bash

echo "🌍 CrossPay Africa - Script de Lancement"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Installation des dépendances...${NC}"
cd /workspace/crosspay-africa/apps/admin
npm install

echo ""
echo -e "${GREEN}✅ Dépendances installées !${NC}"
echo ""
echo -e "${YELLOW}🚀 Options de lancement :${NC}"
echo ""
echo "1️⃣  Pour voir la DÉMO VISUELLE immédiatement :"
echo "   Ouvrez le fichier : apps/admin/demo.html dans votre navigateur"
echo ""
echo "2️⃣  Pour lancer l'application REACT complète :"
echo "   cd /workspace/crosspay-africa/apps/admin"
echo "   npm run dev"
echo "   Puis ouvrez : http://localhost:3000"
echo ""
echo "3️⃣  Pour un build de production :"
echo "   cd /workspace/crosspay-africa/apps/admin"
echo "   npm run build"
echo "   npm start"
echo ""
echo -e "${GREEN}✨ La démo HTML est prête à être visualisée !${NC}"
echo "   📁 Chemin : /workspace/crosspay-africa/apps/admin/demo.html"
