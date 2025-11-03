# 🗺️ Guide de la Carte de France Interactive

## 📋 Problème actuel

La carte ne s'affiche pas car **les vendeurs n'ont pas de ville renseignée dans leur profil**.

## ✅ Solution en 3 étapes

### Étape 1 : Ajouter des villes aux vendeurs

1. Ouvrez http://localhost:3000/explore
2. Vous verrez **2 boutons en bas de page** :
   - 🏙️ **En bas à gauche** : "Ajouter Paris aux vendeurs"
   - 🔧 **En bas à droite** : "Mettre à jour les locations"

3. **Cliquez d'abord sur le bouton de gauche** (🏙️ Ajouter Paris aux vendeurs)
4. Confirmez l'action
5. Attendez le message de succès

### Étape 2 : Mettre à jour les locations des produits

1. **Cliquez ensuite sur le bouton de droite** (🔧 Mettre à jour les locations)
2. Confirmez l'action
3. Attendez le message de succès

### Étape 3 : Voir la carte

1. **Cliquez sur le bouton "Carte"** à côté de la barre de recherche
2. La carte devrait maintenant afficher Paris avec tous les produits !

## 🎯 Résultat attendu

- Tous les vendeurs auront "Paris" comme ville par défaut
- Tous les produits seront associés à Paris
- La carte affichera un marqueur sur Paris avec le nombre total de produits

## 🔧 Pour personnaliser les villes

### Option 1 : Via le profil vendeur
Les vendeurs peuvent modifier leur ville dans leur profil :
1. Dashboard → Profil
2. Modifier le champ "Ville"
3. Choisir parmi : Paris, Lyon, Marseille, Toulouse, Nice, Bordeaux, etc.

### Option 2 : Via l'admin
Un admin peut modifier la ville d'un vendeur :
1. Admin V2 → Utilisateurs
2. Modifier un vendeur
3. Changer le champ "city"

### Option 3 : Lors de la création d'un produit
Dans le module "Mes Produits" du Dashboard V2, le champ "Localisation" permet de définir la ville du produit.

## 📍 Villes supportées (50+)

La carte supporte automatiquement ces villes françaises :
- **Grandes villes** : Paris, Lyon, Marseille, Toulouse, Nice, Bordeaux, Lille, Strasbourg, Nantes, Montpellier
- **Villes moyennes** : Rennes, Reims, Toulon, Grenoble, Dijon, Angers, Nîmes, Clermont-Ferrand
- **Autres** : Tours, Amiens, Limoges, Annecy, Perpignan, Besançon, Orléans, Metz, Rouen, Mulhouse, Caen, Nancy, Avignon, Poitiers, La Rochelle, etc.

## 🧹 Nettoyage après migration

Une fois la migration terminée, **supprimez ces fichiers** :

### Backend
- `backend/convex/updateProductLocations.ts`
- `backend/convex/updateSellerCities.ts`

### Frontend
- `frontend/src/components/UpdateProductLocations.jsx`
- `frontend/src/components/UpdateSellerCities.jsx`

Et retirez les imports dans `frontend/src/pages/Explore.jsx` :
```javascript
// SUPPRIMER ces lignes
import UpdateProductLocations from '../components/UpdateProductLocations'
import UpdateSellerCities from '../components/UpdateSellerCities'

// SUPPRIMER ces lignes
<UpdateSellerCities />
<UpdateProductLocations />
```

## 🐛 Dépannage

### La carte est toujours vide
1. Ouvrez la console du navigateur (F12)
2. Cherchez les messages :
   - `🗺️ Villes non trouvées sur la carte`
   - `🗺️ Villes avec produits`
3. Vérifiez que les villes correspondent aux villes supportées

### Une ville n'est pas reconnue
Si une ville n'apparaît pas sur la carte, ajoutez-la dans `FranceMapModal.jsx` :

```javascript
const cityCoordinates = {
  // ... villes existantes
  'ma-ville': { x: 300, y: 400, displayName: 'Ma Ville' },
}
```

Les coordonnées x et y sont relatives à un SVG de 600x700 pixels.

## 📊 Fonctionnalités de la carte

- ✅ Marqueurs proportionnels au nombre de produits
- ✅ Compteur visible sur chaque ville
- ✅ Liste détaillée des villes avec nombre de produits
- ✅ Légende explicative
- ✅ Animations au survol
- ✅ Responsive mobile et desktop
- ✅ Normalisation automatique des noms de villes (accents, casse)

## 🎨 Personnalisation

Pour modifier l'apparence de la carte, éditez :
- `frontend/src/components/FranceMapModal.module.css`

Pour ajouter des villes, éditez :
- `frontend/src/components/FranceMapModal.jsx` (objet `cityCoordinates`)
