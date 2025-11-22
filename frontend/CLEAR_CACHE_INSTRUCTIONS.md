# Instructions pour vider le cache et corriger le style

## Problème identifié
Le Service Worker PWA met en cache les anciens fichiers CSS, empêchant TailwindCSS de se charger correctement.

## Solution rapide (à faire dans le navigateur)

### Option 1 : Vider le cache du Service Worker (RECOMMANDÉ)

1. **Ouvrir les DevTools** : Appuyez sur `F12`
2. **Aller dans l'onglet "Application"** (ou "Application" en français)
3. **Dans le menu de gauche** :
   - Cliquez sur "Service Workers"
   - Cochez la case "Update on reload"
   - Cliquez sur "Unregister" pour tous les service workers
4. **Vider le cache** :
   - Dans le menu de gauche, cliquez sur "Storage"
   - Cliquez sur "Clear site data"
5. **Recharger la page** : `Ctrl + Shift + R` (rechargement forcé)

### Option 2 : Mode navigation privée

1. Ouvrez une fenêtre de navigation privée : `Ctrl + Shift + N` (Chrome) ou `Ctrl + Shift + P` (Firefox)
2. Allez sur `localhost:3000/dashboard`
3. Le style devrait fonctionner

### Option 3 : Vider tout le cache du navigateur

1. Appuyez sur `Ctrl + Shift + Delete`
2. Sélectionnez "Tout" ou "Depuis toujours"
3. Cochez "Images et fichiers en cache"
4. Cliquez sur "Effacer les données"
5. Rechargez la page : `Ctrl + Shift + R`

## Vérification

Une fois le cache vidé, vous devriez voir :
- ✅ Sidebar avec fond blanc et bordures
- ✅ Boutons avec couleur beige (#C0B4A5)
- ✅ Cards avec ombres et bordures arrondies
- ✅ Textes avec les bonnes polices et tailles

## Si le problème persiste

Ouvrez la console (F12 > Console) et vérifiez :
1. Qu'il n'y a pas d'erreurs CSS
2. Que `globals.css` est bien chargé
3. Que les classes TailwindCSS sont appliquées (inspectez un élément)

## Changements effectués

1. ✅ Créé `tailwind.config.js`
2. ✅ Créé `postcss.config.js`
3. ✅ Installé `tailwindcss-animate`
4. ✅ Inversé l'ordre d'import CSS dans `main.jsx` (globals.css en dernier)
