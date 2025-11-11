# Guide d'Intégration - Paramètres Système

## ✅ Modifications Effectuées

L'onglet "Paramètres Système" a été ajouté au dashboard admin pour permettre la configuration des limites de produits.

### Fichiers Modifiés

#### 1. `frontend/src/pages/AdminV2.jsx`

**Import du composant** (ligne 25) :
```javascript
import SystemSettingsModule from '../components/dashboardv2/SystemSettingsModule'
```

**Ajout dans la liste des modules** (ligne 133) :
```javascript
const modules = ['dashboard', 'users', 'products', 'categories', 'orders', 'commissions', 'netvendeur', 'paiement', 'blog', 'coupons', 'reviews', 'newsletter', 'analytics', 'support', 'stats', 'system-settings', 'settings']
```

**Rendu conditionnel** (lignes 272-274) :
```javascript
{activeTab === 'system-settings' && hasAccess('system-settings') && (
  <SystemSettingsModule />
)}
```

#### 2. `frontend/src/components/adminv2/Sidebar.jsx`

**Import de l'icône** (ligne 22) :
```javascript
import { 
  // ... autres icônes
  Sliders
} from 'lucide-react'
```

**Ajout dans le menu** (ligne 54) :
```javascript
const menuItems = [
  // ... autres items
  { id: 'system-settings', label: 'Paramètres Système', icon: Sliders },
  { id: 'settings', label: 'Paramètres', icon: Settings },
  // ...
]
```

## 📍 Localisation dans le Menu

L'onglet "Paramètres Système" apparaît dans le menu latéral entre :
- **Statistiques** (au-dessus)
- **Paramètres** (en-dessous)

```
Menu Admin
├─ Dashboard
├─ Utilisateurs
├─ Produits
├─ Catégories
├─ Commandes
├─ Factures
├─ Commissions
├─ Net Vendeur
├─ Paiement
├─ Blog
├─ Coupons
├─ Avis
├─ Newsletter
├─ Analytics
├─ Support
├─ Statistiques
├─ ⚙️ Paramètres Système  ← NOUVEAU
├─ Paramètres
└─ Demandes de compte
```

## 🔒 Permissions

### Accès par Défaut

- ✅ **Superadmin** : Accès complet automatique
- ❌ **Autres admins** : Nécessite permission explicite

### Configuration des Permissions

Pour donner accès à un admin modérateur, ajouter la permission dans `adminUsers` :

```javascript
permissions: {
  // ... autres permissions
  'system-settings': true
}
```

## 🎨 Icône Utilisée

**Icône** : `Sliders` (lucide-react)
- Représente les paramètres de configuration
- Différente de l'icône `Settings` pour éviter la confusion

## 🚀 Utilisation

### Pour Accéder au Module

1. Se connecter en tant que **superadmin**
2. Accéder au dashboard admin : `http://localhost:3000/admin`
3. Cliquer sur **"Paramètres Système"** dans le menu latéral
4. Interface de configuration s'affiche

### Fonctionnalités Disponibles

- ✅ Voir les limites actuelles
- ✅ Modifier la limite pour les professionnels
- ✅ Modifier la limite pour les grossistes
- ✅ Définir une limite illimitée (-1)
- ✅ Enregistrer les modifications
- ✅ Réinitialiser les valeurs

## 📊 Interface

```
┌─────────────────────────────────────────────────────┐
│ ⚙️ Paramètres Système                               │
│ Configurez les paramètres globaux de la plateforme │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📦 Limites d'Ajout de Produits                     │
│                                                     │
│ Limites Actuelles:                                  │
│ • Professionnels: 2 produits                       │
│ • Grossistes: Illimité                             │
│                                                     │
│ 👥 Limite pour les Professionnels                  │
│ [    5    ] [Illimité]                             │
│                                                     │
│ 👥 Limite pour les Grossistes                      │
│ [   -1    ] [Illimité]                             │
│                                                     │
│ [💾 Enregistrer] [🔄 Réinitialiser]                │
│                                                     │
│ ℹ️ Informations Importantes                         │
│ • Les modifications prennent effet immédiatement    │
│ • Une valeur de -1 signifie "illimité"             │
│ • Une valeur de 0 empêche l'ajout de produits      │
└─────────────────────────────────────────────────────┘
```

## 🔧 Dépannage

### Problème : L'onglet n'apparaît pas

**Cause possible** : Vous n'êtes pas connecté en tant que superadmin

**Solution** :
1. Vérifier votre type d'utilisateur dans le localStorage
2. Se connecter avec un compte superadmin
3. Vérifier les permissions dans la base de données

### Problème : Erreur lors de l'enregistrement

**Cause possible** : Permissions insuffisantes côté backend

**Solution** :
1. Vérifier que l'utilisateur est bien superadmin
2. Vérifier les logs du backend
3. S'assurer que la table `systemSettings` existe

### Problème : Les limites ne s'appliquent pas

**Cause possible** : Cache ou valeurs par défaut utilisées

**Solution** :
1. Recharger la page
2. Vérifier que les valeurs sont bien enregistrées dans `systemSettings`
3. Vérifier que `products.ts` utilise bien les limites dynamiques

## 📝 Notes Techniques

### Architecture

```
Frontend (AdminV2.jsx)
    ↓
SystemSettingsModule.jsx
    ↓
useQuery(getProductLimits)
    ↓
Backend (systemSettings.ts)
    ↓
Database (systemSettings table)
```

### Flux de Données

```
1. Admin modifie les limites
   ↓
2. Mutation updateProductLimits
   ↓
3. Validation superadmin
   ↓
4. Mise à jour systemSettings
   ↓
5. Query getProductLimits rafraîchie
   ↓
6. Interface mise à jour
   ↓
7. Limites appliquées immédiatement
```

## ✨ Prochaines Étapes

Pour étendre le système de paramètres :

1. **Ajouter d'autres paramètres** :
   ```javascript
   // Dans SystemSettingsModule.jsx
   - Limites de commandes
   - Taux de commission
   - Durée de validité des coupons
   - etc.
   ```

2. **Créer des sections** :
   ```javascript
   <Card>
     <CardTitle>Paramètres Produits</CardTitle>
     // Limites, catégories, etc.
   </Card>
   
   <Card>
     <CardTitle>Paramètres Commandes</CardTitle>
     // Délais, statuts, etc.
   </Card>
   ```

3. **Ajouter l'historique** :
   ```javascript
   // Tracer qui a modifié quoi et quand
   settingsHistory: defineTable({
     settingKey: v.string(),
     oldValue: v.any(),
     newValue: v.any(),
     changedBy: v.id("users"),
     changedAt: v.number()
   })
   ```

## 🎉 Résultat

L'onglet "Paramètres Système" est maintenant accessible dans le dashboard admin !

**Pour y accéder** :
1. Allez sur `http://localhost:3000/admin`
2. Cliquez sur "Paramètres Système" dans le menu
3. Configurez les limites de produits
4. Enregistrez → Effet immédiat !

Les administrateurs peuvent maintenant gérer les limites sans toucher au code ! 🚀
