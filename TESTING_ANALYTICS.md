# Guide de Test - Système Analytics

## 🧪 Comment tester le système de tracking

### Étape 1 : Vérifier l'intégration

Le hook `useActivityTracking` est déjà intégré dans **ProductDetail.jsx**. Chaque fois qu'un utilisateur visite une page produit, son activité est automatiquement enregistrée.

### Étape 2 : Générer des données de test

Pour tester le système, vous devez générer des activités en naviguant sur le site :

1. **Visitez plusieurs produits** :
   - Allez sur la page d'accueil
   - Cliquez sur différents produits
   - Restez au moins 5-10 secondes sur chaque produit
   - Naviguez entre plusieurs produits

2. **Testez avec différents appareils** :
   - Ouvrez le site sur mobile (ou mode responsive)
   - Ouvrez le site sur desktop
   - Le système détectera automatiquement le type d'appareil

3. **Testez avec et sans connexion** :
   - Naviguez en tant qu'utilisateur connecté
   - Naviguez en mode anonyme (le système utilisera un sessionId)

### Étape 3 : Vérifier les données dans la console

Ouvrez la console du navigateur (F12) et vous verrez :

```javascript
Analytics Debug: {
  stats: { totalActivities: 5, totalTimeSpent: 120, ... },
  topProducts: [...],
  topPages: [...],
  topUsers: [...],
  realtimeActivity: { ... }
}
```

### Étape 4 : Consulter les Analytics

1. Connectez-vous en tant qu'admin
2. Allez sur `/admin`
3. Cliquez sur "Analytics" dans la sidebar
4. Vous devriez voir :
   - **Vue d'ensemble** : Statistiques globales
   - **Produits** : Top produits consultés
   - **Utilisateurs** : Top utilisateurs actifs
   - **Pages** : Top pages visitées

## 🔍 Debugging

### Si les onglets sont vides

**Causes possibles** :

1. **Aucune donnée enregistrée** :
   - Solution : Naviguez sur plusieurs produits pour générer des données
   - Attendez au moins 5 secondes sur chaque produit

2. **Problème de queries** :
   - Ouvrez la console et vérifiez les logs "Analytics Debug"
   - Vérifiez que les queries retournent des données

3. **Problème de dates** :
   - Essayez de changer la période (7j, 30j, Tout)
   - Le filtre "Tout" devrait afficher toutes les données

### Vérifier les données dans Convex

1. Allez sur le dashboard Convex
2. Ouvrez la table `userActivityTracking`
3. Vérifiez qu'il y a des entrées

## 📊 Données attendues

### Après avoir visité 3 produits pendant 10 secondes chacun :

**Vue d'ensemble** :
- Total Activités : 3
- Temps Total : 30s
- Utilisateurs Uniques : 1
- Temps Moyen : 10s

**Onglet Produits** :
- 3 produits listés
- Chacun avec 1 vue
- Temps moyen : ~10s

**Onglet Utilisateurs** :
- 1 utilisateur (vous)
- 3 activités
- Temps total : 30s

**Onglet Pages** :
- 3 URLs de produits
- 1 visite chacune

## 🎯 Test Complet

### Scénario de test recommandé :

```bash
1. Ouvrir le site en mode incognito
2. Visiter la page d'accueil (15 secondes)
3. Cliquer sur un produit A (20 secondes)
4. Revenir et cliquer sur un produit B (25 secondes)
5. Revenir et cliquer sur un produit C (15 secondes)
6. Se connecter en tant qu'admin
7. Aller sur /admin > Analytics
8. Vérifier que les 4 activités sont enregistrées
```

### Résultat attendu :

- **Total Activités** : 4 (1 page_view + 3 product_view)
- **Temps Total** : 75 secondes
- **Top Produits** : Produit B (25s), Produit A (20s), Produit C (15s)
- **Top Pages** : 4 URLs différentes

## 🐛 Problèmes connus et solutions

### Problème : Les queries retournent undefined

**Solution** : Les arguments optionnels doivent être omis, pas passés comme undefined.

✅ **Correct** :
```javascript
const args = { limit: 10 }
if (startDate) args.startDate = startDate
useQuery(api.query, args)
```

❌ **Incorrect** :
```javascript
useQuery(api.query, {
  limit: 10,
  startDate: undefined  // ❌ Ne pas passer undefined
})
```

### Problème : Le temps n'est pas enregistré

**Causes** :
- L'utilisateur quitte trop vite (< 1 seconde)
- Le beforeunload n'est pas déclenché
- Le hook n'est pas activé (enabled: false)

**Solution** :
- Rester au moins 2-3 secondes sur la page
- Vérifier que `enabled` est true
- Vérifier les logs dans la console

### Problème : Les données n'apparaissent pas immédiatement

**Explication** : C'est normal ! Les données sont enregistrées :
- Quand l'utilisateur quitte la page
- Quand la page perd le focus
- Toutes les 30 secondes (enregistrement périodique)

**Solution** : Attendez quelques secondes ou changez de page.

## 📝 Checklist de vérification

Avant de considérer que le système ne fonctionne pas, vérifiez :

- [ ] Le hook `useActivityTracking` est bien appelé dans le composant
- [ ] Le prop `enabled` est `true`
- [ ] L'utilisateur reste au moins 1 seconde sur la page
- [ ] Les mutations Convex sont bien déployées
- [ ] La table `userActivityTracking` existe dans Convex
- [ ] Les queries sont bien importées dans AnalyticsModule
- [ ] La console affiche les logs "Analytics Debug"
- [ ] Il y a au moins une entrée dans la table Convex

## 🎉 Confirmation que ça fonctionne

Vous saurez que le système fonctionne quand :

1. ✅ La console affiche "Analytics Debug" avec des données
2. ✅ L'onglet "Vue d'ensemble" affiche des statistiques > 0
3. ✅ L'onglet "Produits" liste les produits visités
4. ✅ L'onglet "Utilisateurs" liste les utilisateurs actifs
5. ✅ L'onglet "Pages" liste les URLs visitées
6. ✅ Le temps réel affiche les activités des dernières 24h

## 🔧 Commandes utiles

### Vérifier les données dans Convex (via CLI) :
```bash
npx convex dev
# Puis dans un autre terminal
npx convex run functions/queries/activityTracking:getActivityStats
```

### Supprimer les données de test :
```bash
npx convex run functions/mutations/activityTracking:deleteOldActivities '{"olderThanDays": 0}'
```

## 📞 Support

Si après avoir suivi ce guide, les données n'apparaissent toujours pas :

1. Vérifiez la console pour les erreurs
2. Vérifiez que Convex est bien connecté
3. Vérifiez que les mutations sont déployées
4. Consultez la documentation ACTIVITY_TRACKING_SYSTEM.md
