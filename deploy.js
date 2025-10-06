#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Déploiement Entre Coiffeur sur Vercel...\n');

// Vérifier que nous sommes dans le bon répertoire
if (!fs.existsSync('frontend') || !fs.existsSync('backend')) {
  console.error('❌ Erreur: Exécutez ce script depuis la racine du projet');
  process.exit(1);
}

try {
  // 1. Installer les dépendances du frontend
  console.log('📦 Installation des dépendances frontend...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });

  // 2. Build du frontend
  console.log('🔨 Build du frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });

  // 3. Vérifier que le build a réussi
  if (!fs.existsSync('frontend/dist')) {
    throw new Error('Le build frontend a échoué - dossier dist non trouvé');
  }

  console.log('✅ Build terminé avec succès!');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Déployez votre backend Convex: cd backend && npx convex deploy');
  console.log('2. Configurez les variables d\'environnement dans Vercel');
  console.log('3. Déployez sur Vercel: vercel --prod');
  console.log('\n🌐 Votre application sera disponible sur votre domaine Vercel!');

} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error.message);
  process.exit(1);
}
