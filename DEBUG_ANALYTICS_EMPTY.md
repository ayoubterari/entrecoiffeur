# 🐛 Debug : Onglets Produits et Utilisateurs Vides

## 📊 Situation Actuelle

D'après les captures d'écran :
- ✅ **Vue d'ensemble** : Fonctionne (7 activités en temps réel)
- ❌ **Onglet Produits** : Vide ("Aucune donnée disponible pour cette période")
- ❌ **Onglet Utilisateurs** : Vide
- ❌ **Statistiques** : 0 activités, 0s temps total, 0 utilisateurs

## 🔍 Diagnostic

### Hypothèses possibles :

1. **Les activités sont enregistrées sans `resourceId`**
   - La query `getTopViewedProducts` filtre les activités sans `resourceId` (ligne 92)
   - Si `productId` est `undefined` ou `null`, le `resourceId` ne sera pas enregistré

2. **Le `activityType` n'est pas exactement "product_view"**
   - Peut-être une faute de frappe ou un problème de casse

3. **Les activités sont enregistrées mais avec un autre type**
   - Peut-être "page_view" au lieu de "product_view"

## 🧪 Étapes de Debug

### 1. Ouvrir la Console du Navigateur

Appuyez sur **F12** et allez dans l'onglet **Console**.

### 2. Visiter une Page Produit

1. Allez sur la page d'accueil
2. Cliquez sur un produit
3. Restez **au moins 5 secondes**
4. Regardez la console

### 3. Vérifier les Logs

Vous devriez voir :

```javascript
🔍 Activity Tracking Started: {
  activityType: "product_view",
  resourceId: "k57abc123...",  // ⚠️ Vérifier que ce n'est PAS undefined
  resourceName: "Nom du produit",  // ⚠️ Vérifier que ce n'est PAS undefined
  userId: "j_abc123..." ou undefined,
  enabled: true,
  sessionId: "1730..."
}
```

**Points à vérifier** :
- ✅ `activityType` doit être exactement `"product_view"`
- ✅ `resourceId` doit avoir une valeur (pas `undefined`)
- ✅ `resourceName` doit avoir une valeur (pas `undefined`)

### 4. Quitter la Page

Changez de page ou fermez l'onglet. Vous devriez voir :

```javascript
📊 Recording Activity: {
  activityType: "product_view",
  resourceId: "k57abc123...",
  resourceName: "Nom du produit",
  timeSpent: 8,  // En secondes
  ...
}

✅ Activity Recorded Successfully: {
  success: true,
  activityId: "..."
}
```

### 5. Aller sur Analytics

1. Allez sur `/admin`
2. Cliquez sur "Analytics"
3. Regardez la console

Vous devriez voir :

```javascript
Analytics Debug: {
  stats: { totalActivities: 1, ... },
  topProducts: [...],  // ⚠️ Devrait contenir votre produit
  allActivitiesDebug: [...]  // ⚠️ Toutes les activités brutes
}

🔍 Activités brutes: [...]
🔍 Activités product_view: [...]  // ⚠️ Devrait contenir vos activités
🔍 Activités avec resourceId: [...]  // ⚠️ Devrait contenir vos activités
```

## 🔧 Solutions selon le Problème

### Problème 1 : `resourceId` est `undefined`

**Cause** : Le `productId` n'est pas passé correctement au hook.

**Solution** : Vérifier que `ProductDetail` reçoit bien le prop `productId`.

```javascript
// Dans ProductDetail.jsx, vérifier :
console.log('ProductId:', productId)
console.log('Product:', product)
```

### Problème 2 : Le hook ne s'active pas

**Cause** : `enabled` est `false` ou le produit n'est pas chargé.

**Solution** : Vérifier la condition `enabled` :

```javascript
enabled: !!productId && !!product  // Les deux doivent être true
```

### Problème 3 : Les activités sont enregistrées mais pas filtrées

**Cause** : Le `activityType` n'est pas exactement "product_view".

**Solution** : Vérifier dans les logs que `activityType === "product_view"`.

### Problème 4 : Temps trop court

**Cause** : L'utilisateur quitte trop vite (< 1 seconde).

**Solution** : Rester au moins **3-5 secondes** sur la page produit.

## 📋 Checklist de Vérification

Cochez chaque point :

- [ ] La console affiche "🔍 Activity Tracking Started"
- [ ] `resourceId` n'est PAS `undefined`
- [ ] `resourceName` n'est PAS `undefined`
- [ ] `activityType` est exactement `"product_view"`
- [ ] Je reste au moins 5 secondes sur la page
- [ ] La console affiche "📊 Recording Activity"
- [ ] La console affiche "✅ Activity Recorded Successfully"
- [ ] Dans Analytics, `allActivitiesDebug` contient des données
- [ ] Dans Analytics, "🔍 Activités product_view" contient des données
- [ ] Dans Analytics, "🔍 Activités avec resourceId" contient des données

## 🎯 Test Rapide

### Scénario de test :

```bash
1. Ouvrir la console (F12)
2. Aller sur la page d'accueil
3. Cliquer sur un produit
4. Attendre 5 secondes
5. Vérifier les logs dans la console
6. Fermer l'onglet ou changer de page
7. Vérifier "✅ Activity Recorded Successfully"
8. Aller sur /admin > Analytics
9. Vérifier les logs "Analytics Debug"
10. Vérifier l'onglet "Produits"
```

### Résultat attendu :

- ✅ L'onglet "Produits" affiche 1 produit
- ✅ Le produit a 1 vue
- ✅ Le temps passé est ~5 secondes

## 🆘 Si Ça Ne Fonctionne Toujours Pas

### Vérifier la table Convex

1. Allez sur le dashboard Convex
2. Ouvrez la table `userActivityTracking`
3. Regardez les entrées

**Vérifiez** :
- Le champ `activityType` : doit être `"product_view"`
- Le champ `resourceId` : doit avoir une valeur (pas null)
- Le champ `resourceName` : doit avoir une valeur (pas null)

### Copier les Logs

Copiez et envoyez les logs suivants :

```javascript
// Log 1 : Au démarrage du tracking
🔍 Activity Tracking Started: { ... }

// Log 2 : À l'enregistrement
📊 Recording Activity: { ... }

// Log 3 : Après l'enregistrement
✅ Activity Recorded Successfully: { ... }

// Log 4 : Dans Analytics
Analytics Debug: { ... }
🔍 Activités brutes: [...]
🔍 Activités product_view: [...]
```

## 💡 Astuce

Si vous voyez des activités dans "Vue d'ensemble" mais pas dans "Produits", c'est que :
- Les activités sont enregistrées ✅
- Mais elles n'ont pas de `resourceId` ❌
- Ou le `activityType` n'est pas "product_view" ❌

La solution est de vérifier les logs au moment de l'enregistrement pour voir exactement ce qui est envoyé.

## 📞 Prochaines Étapes

1. **Suivre ce guide** étape par étape
2. **Noter les logs** que vous voyez dans la console
3. **Identifier** lequel des 4 problèmes ci-dessus s'applique
4. **Appliquer** la solution correspondante
5. **Retester** avec le scénario de test rapide

Avec les logs de debug ajoutés, vous devriez pouvoir identifier précisément le problème ! 🎯
