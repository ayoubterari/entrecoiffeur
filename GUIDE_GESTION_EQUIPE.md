# Guide Rapide : Gestion de l'Équipe

## Pour les Professionnels et Grossistes

Ce guide vous explique comment gérer votre équipe et attribuer des accès personnalisés à vos employés.

---

## 📋 Table des matières

1. [Accéder au module](#accéder-au-module)
2. [Créer un nouvel utilisateur](#créer-un-nouvel-utilisateur)
3. [Gérer les permissions](#gérer-les-permissions)
4. [Modifier un utilisateur](#modifier-un-utilisateur)
5. [Désactiver/Réactiver un compte](#désactiver-réactiver-un-compte)
6. [Supprimer un utilisateur](#supprimer-un-utilisateur)
7. [FAQ](#faq)

---

## 🚀 Accéder au module

1. Connectez-vous à votre compte professionnel ou grossiste
2. Dans le menu de gauche, cliquez sur **"Mon équipe"** (icône 👥)
3. Vous verrez le tableau de bord de gestion d'équipe

### Vue d'ensemble

Le tableau de bord affiche :
- **Total** : Nombre total d'utilisateurs créés
- **Actifs** : Nombre de comptes actifs
- **Gestionnaires** : Nombre de managers
- **Employés** : Nombre d'employés

---

## ➕ Créer un nouvel utilisateur

### Étape 1 : Ouvrir le formulaire

1. Cliquez sur le bouton **"Nouvel utilisateur"** en haut à droite
2. Un formulaire s'ouvre

### Étape 2 : Remplir les informations

**Informations personnelles** :
- **Prénom** : Le prénom de l'employé
- **Nom** : Le nom de famille
- **Email** : Adresse email unique (sera utilisée pour la connexion)
- **Mot de passe** : Minimum 6 caractères

**Rôle** :
Choisissez parmi :
- 🛡️ **Gestionnaire** : Accès étendu, peut gérer la plupart des modules
- 👤 **Employé** : Accès standard aux modules de base
- 👁️ **Observateur** : Accès en lecture seule

### Étape 3 : Configurer les permissions

Activez ou désactivez l'accès à chaque module :

| Module | Description |
|--------|-------------|
| **Profil** | Voir et modifier le profil |
| **Mes Produits** | Gérer le catalogue de produits |
| **Mes Ventes** | Gérer les commandes et ventes |
| **Mes Achats** | Voir l'historique des achats |
| **Messages** | Accéder à la messagerie |
| **Réclamations** | Gérer les réclamations clients |
| **Mes Coupons** | Gérer les codes de réduction |
| **Support** | Accéder au support client |
| **Statistiques** | Voir les statistiques de vente |
| **Paramètres** | Modifier les paramètres du compte |

### Étape 4 : Créer le compte

1. Vérifiez toutes les informations
2. Cliquez sur **"Créer l'utilisateur"**
3. Un message de confirmation s'affiche
4. L'utilisateur peut maintenant se connecter avec son email et mot de passe

---

## 🔐 Gérer les permissions

### Permissions recommandées par rôle

#### 🛡️ Gestionnaire (Manager)
```
✅ Profil
✅ Mes Produits
✅ Mes Ventes
✅ Messages
✅ Réclamations
✅ Support
✅ Statistiques
❌ Mes Achats
❌ Paramètres
```

#### 👤 Employé (Employee)
```
✅ Profil
✅ Mes Produits (lecture)
✅ Messages
✅ Support
❌ Mes Ventes
❌ Réclamations
❌ Mes Achats
❌ Statistiques
❌ Paramètres
```

#### 👁️ Observateur (Viewer)
```
✅ Profil
✅ Mes Produits (lecture)
❌ Tout le reste
```

### Personnalisation

Vous pouvez créer des combinaisons personnalisées selon vos besoins :

**Exemple 1 : Commercial**
- ✅ Profil
- ✅ Mes Produits
- ✅ Messages
- ✅ Support
- ❌ Reste

**Exemple 2 : Service client**
- ✅ Profil
- ✅ Messages
- ✅ Réclamations
- ✅ Support
- ❌ Reste

---

## ✏️ Modifier un utilisateur

### Changer les permissions

1. Dans la liste des utilisateurs, trouvez l'utilisateur à modifier
2. Cliquez sur le bouton **✏️ Modifier**
3. Un formulaire s'ouvre avec les permissions actuelles
4. Activez ou désactivez les modules selon vos besoins
5. Cliquez sur **"Enregistrer"**
6. Les changements sont appliqués immédiatement

### Changer le rôle

Pour changer le rôle d'un utilisateur :
1. Modifiez les permissions pour correspondre au nouveau rôle
2. Ou supprimez et recréez l'utilisateur avec le nouveau rôle

---

## 👁️ Désactiver/Réactiver un compte

### Désactiver temporairement

Si vous souhaitez désactiver un compte sans le supprimer :

1. Trouvez l'utilisateur dans la liste
2. Cliquez sur le bouton **👁️ Désactiver**
3. Le compte est désactivé
4. Le badge passe de **"Actif"** à **"Désactivé"**
5. L'utilisateur ne peut plus se connecter

### Réactiver un compte

1. Trouvez l'utilisateur désactivé
2. Cliquez sur le bouton **👁️ Activer**
3. Le compte est réactivé
4. L'utilisateur peut à nouveau se connecter

**💡 Astuce** : Utilisez la désactivation pour les absences temporaires (congés, maladie, etc.)

---

## 🗑️ Supprimer un utilisateur

### Suppression définitive

⚠️ **Attention** : Cette action est irréversible !

1. Trouvez l'utilisateur dans la liste
2. Cliquez sur le bouton **🗑️ Supprimer**
3. Confirmez la suppression dans la popup
4. L'utilisateur est supprimé de votre équipe
5. Il ne peut plus se connecter

**Note** : Le compte utilisateur principal reste dans la base de données pour conserver l'historique des actions.

---

## 🔍 Rechercher un utilisateur

Utilisez la barre de recherche en haut de la liste :
- Recherchez par **nom**
- Recherchez par **prénom**
- Recherchez par **email**

La liste se filtre automatiquement pendant que vous tapez.

---

## 📊 Comprendre les badges

### Badges de statut
- 🟢 **Actif** : Le compte est actif et fonctionnel
- ⚫ **Désactivé** : Le compte est temporairement désactivé

### Badges de rôle
- 🛡️ **Gestionnaire** : Accès étendu (bleu)
- 👤 **Employé** : Accès standard (vert)
- 👁️ **Observateur** : Lecture seule (gris)

### Nombre de modules
Sous chaque utilisateur, vous voyez :
- **"X module(s) accessible(s)"** : Nombre de modules auxquels l'utilisateur a accès

---

## ❓ FAQ

### Q : Combien d'utilisateurs puis-je créer ?
**R :** Il n'y a pas de limite. Vous pouvez créer autant d'utilisateurs que nécessaire pour votre équipe.

### Q : Les sous-utilisateurs peuvent-ils créer d'autres utilisateurs ?
**R :** Non, seul le compte principal (le vôtre) peut créer et gérer des sous-utilisateurs.

### Q : Que se passe-t-il si un employé quitte l'entreprise ?
**R :** Désactivez son compte immédiatement pour bloquer l'accès. Vous pouvez le supprimer plus tard si nécessaire.

### Q : Un sous-utilisateur peut-il modifier ses propres permissions ?
**R :** Non, seul le compte principal peut modifier les permissions des sous-utilisateurs.

### Q : Les sous-utilisateurs peuvent-ils voir les autres membres de l'équipe ?
**R :** Non, ils ne voient pas le module "Mon équipe". Seul le compte principal y a accès.

### Q : Puis-je donner accès à "Mon équipe" à un sous-utilisateur ?
**R :** Non, ce module est réservé au compte principal pour des raisons de sécurité.

### Q : Comment un sous-utilisateur se connecte-t-il ?
**R :** Avec l'email et le mot de passe que vous avez définis lors de la création du compte.

### Q : Puis-je changer le mot de passe d'un sous-utilisateur ?
**R :** Actuellement, vous devez supprimer et recréer le compte avec un nouveau mot de passe.

### Q : Les sous-utilisateurs voient-ils tous les produits/commandes ?
**R :** Oui, s'ils ont accès au module, ils voient toutes les données du compte principal.

### Q : Puis-je limiter l'accès à certains produits uniquement ?
**R :** Non, les permissions sont par module, pas par produit. C'est une amélioration future possible.

---

## 💡 Bonnes pratiques

### Sécurité
1. ✅ Donnez uniquement les accès nécessaires
2. ✅ Utilisez des mots de passe forts
3. ✅ Désactivez les comptes inutilisés
4. ✅ Révisez régulièrement les permissions
5. ✅ Supprimez les comptes des anciens employés

### Organisation
1. ✅ Utilisez des rôles cohérents (manager, employee, viewer)
2. ✅ Documentez qui a accès à quoi
3. ✅ Formez vos employés sur leurs accès
4. ✅ Vérifiez régulièrement la liste des utilisateurs
5. ✅ Utilisez la recherche pour trouver rapidement un utilisateur

### Performance
1. ✅ Désactivez plutôt que supprimer (pour l'historique)
2. ✅ Nettoyez les comptes inactifs régulièrement
3. ✅ Limitez le nombre de gestionnaires
4. ✅ Donnez des accès progressifs (commencer limité, étendre si besoin)

---

## 📞 Support

Besoin d'aide ?

- 📧 **Email** : support@entrecoiffeur.com
- 📱 **Téléphone** : +212 XXX XXX XXX
- 💬 **Chat** : Disponible dans le dashboard (module Support)

---

## 🎯 Exemples concrets

### Exemple 1 : Salon de coiffure avec 3 employés

**Propriétaire (vous)** :
- Accès complet à tout

**Responsable du salon** :
- ✅ Produits, Ventes, Messages, Réclamations
- ❌ Achats, Paramètres

**Coiffeur 1** :
- ✅ Produits (lecture), Messages
- ❌ Reste

**Coiffeur 2** :
- ✅ Produits (lecture), Messages
- ❌ Reste

### Exemple 2 : Grossiste avec équipe commerciale

**Directeur (vous)** :
- Accès complet à tout

**Chef des ventes** :
- ✅ Produits, Ventes, Messages, Support, Stats
- ❌ Achats, Paramètres

**Commercial 1** :
- ✅ Produits, Messages, Support
- ❌ Reste

**Commercial 2** :
- ✅ Produits, Messages, Support
- ❌ Reste

**Stagiaire** :
- ✅ Produits (lecture)
- ❌ Reste

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Auteur** : Équipe EntreCoiffeur
