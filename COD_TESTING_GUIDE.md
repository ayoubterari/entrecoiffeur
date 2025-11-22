# Guide de Test - Système COD

## 🧪 Tests à effectuer

Ce guide détaille tous les tests à effectuer pour valider le système COD.

---

## 1. Tests Backend

### Test 1.1 : Création de commande COD

**Objectif** : Vérifier que les commandes COD sont créées correctement

**Étapes** :
1. Ouvrir Convex Dashboard
2. Aller dans la table `orders`
3. Créer une commande via l'interface
4. Vérifier les champs :
   - `paymentMethod: "COD"`
   - `paymentId: undefined` ou `null`
   - `paymentStatus: "pending"`
   - `status: "pending"`

**Résultat attendu** : ✅ Commande créée avec les bons statuts

---

### Test 1.2 : Changement de statut

**Objectif** : Vérifier que le changement de statut fonctionne

**Étapes** :
1. Prendre une commande COD existante
2. Utiliser la mutation `updateOrderStatus`
3. Changer le statut à "delivered"
4. Vérifier que `paymentStatus` passe à "paid"

**Résultat attendu** : ✅ Statut mis à jour automatiquement

---

## 2. Tests Frontend - Checkout

### Test 2.1 : Affichage de la page

**Objectif** : Vérifier l'interface COD

**Étapes** :
1. Ajouter un produit au panier
2. Cliquer sur "Commander"
3. Vérifier l'affichage :
   - ✅ Option COD visible
   - ✅ Section "Comment ça marche ?" visible
   - ✅ Badges de sécurité affichés
   - ✅ Bouton "Confirmer la commande" visible

**Résultat attendu** : ✅ Interface complète et claire

---

### Test 2.2 : Validation des champs

**Objectif** : Vérifier la validation du formulaire

**Étapes** :
1. Aller au checkout
2. Essayer de confirmer sans remplir les champs
3. Vérifier le message d'erreur
4. Remplir tous les champs
5. Confirmer la commande

**Résultat attendu** : 
- ❌ Erreur si champs vides
- ✅ Succès si champs remplis

---

### Test 2.3 : Création de commande

**Objectif** : Tester le flux complet

**Étapes** :
1. Remplir le formulaire :
   - Prénom : "Test"
   - Nom : "User"
   - Email : "test@example.com"
   - Adresse : "123 rue Test"
   - Ville : "Casablanca"
   - Code postal : "20000"
2. Cliquer sur "Confirmer la commande"
3. Attendre la redirection
4. Vérifier la page de succès

**Résultat attendu** : 
- ✅ Commande créée
- ✅ Redirection vers /order-success
- ✅ Message de confirmation affiché

---

### Test 2.4 : Application de coupon

**Objectif** : Vérifier que les coupons fonctionnent avec COD

**Étapes** :
1. Créer un coupon de test
2. Aller au checkout
3. Appliquer le coupon
4. Vérifier la réduction
5. Confirmer la commande
6. Vérifier que le coupon est enregistré

**Résultat attendu** : ✅ Coupon appliqué correctement

---

## 3. Tests Frontend - Module Admin

### Test 3.1 : Module Paiement

**Objectif** : Vérifier le nouveau module COD

**Étapes** :
1. Se connecter en tant qu'admin
2. Aller dans "Paiement"
3. Vérifier l'affichage :
   - ✅ Badge "Actif" visible
   - ✅ Section informations COD
   - ✅ Section avantages
   - ✅ Section processus
   - ✅ Section informations vendeurs

**Résultat attendu** : ✅ Toutes les sections affichées

---

### Test 3.2 : Module Commandes

**Objectif** : Vérifier l'affichage des commandes COD

**Étapes** :
1. Aller dans "Commandes"
2. Trouver une commande COD
3. Vérifier l'affichage :
   - ✅ `paymentMethod: "COD"` visible
   - ✅ Badge de statut correct
   - ✅ Détails complets

**Résultat attendu** : ✅ Commande COD bien affichée

---

### Test 3.3 : Changement de statut

**Objectif** : Tester le changement de statut depuis l'admin

**Étapes** :
1. Sélectionner une commande COD
2. Ouvrir les détails
3. Changer le statut à "Confirmé"
4. Vérifier la mise à jour
5. Changer à "En préparation"
6. Changer à "Expédié"
7. Changer à "Livré"
8. Vérifier que `paymentStatus` = "paid"

**Résultat attendu** : ✅ Tous les changements fonctionnent

---

## 4. Tests Frontend - Dashboard Vendeur

### Test 4.1 : Module Mes Ventes

**Objectif** : Vérifier l'affichage pour le vendeur

**Étapes** :
1. Se connecter en tant que vendeur
2. Aller dans "Mes Ventes"
3. Trouver une commande COD
4. Vérifier l'affichage :
   - ✅ Badge COD visible
   - ✅ Statut de paiement "En attente"
   - ✅ Actions disponibles

**Résultat attendu** : ✅ Interface claire pour le vendeur

---

### Test 4.2 : Génération de facture

**Objectif** : Vérifier que les factures COD sont correctes

**Étapes** :
1. Sélectionner une commande COD
2. Cliquer sur "Télécharger facture"
3. Ouvrir le PDF
4. Vérifier :
   - ✅ Mention "COD" ou "Paiement à la livraison"
   - ✅ Statut de paiement correct
   - ✅ Toutes les informations présentes

**Résultat attendu** : ✅ Facture PDF correcte

---

## 5. Tests Frontend - Dashboard Client

### Test 5.1 : Module Mes Achats

**Objectif** : Vérifier l'affichage pour le client

**Étapes** :
1. Se connecter en tant que client
2. Aller dans "Mes Achats"
3. Trouver la commande COD
4. Vérifier l'affichage :
   - ✅ Méthode de paiement "COD"
   - ✅ Statut de la commande
   - ✅ Instructions de paiement

**Résultat attendu** : ✅ Client voit bien sa commande COD

---

## 6. Tests d'intégration

### Test 6.1 : Flux complet E2E

**Objectif** : Tester le flux de bout en bout

**Scénario** :
```
1. Client crée un compte
2. Client ajoute un produit au panier
3. Client va au checkout
4. Client remplit les informations
5. Client confirme avec COD
6. Vendeur reçoit la notification
7. Vendeur change le statut à "Confirmé"
8. Vendeur change à "En préparation"
9. Vendeur change à "Expédié"
10. Vendeur change à "Livré"
11. Client voit le statut "Livré"
12. Admin voit la commande comme "Payée"
```

**Résultat attendu** : ✅ Tout le flux fonctionne

---

### Test 6.2 : Commissions

**Objectif** : Vérifier le calcul des commissions

**Étapes** :
1. Créer une commande COD de 100 DH
2. Aller dans "Commissions"
3. Vérifier :
   - Commission plateforme : 10 DH (10%)
   - Net vendeur : 90 DH (90%)

**Résultat attendu** : ✅ Commissions calculées correctement

---

### Test 6.3 : Affiliation

**Objectif** : Vérifier que l'affiliation fonctionne avec COD

**Étapes** :
1. Créer un lien d'affiliation
2. Utiliser le lien pour commander
3. Confirmer avec COD
4. Vérifier que l'affiliation est enregistrée
5. Changer le statut à "Livré"
6. Vérifier que les points sont crédités

**Résultat attendu** : ✅ Affiliation fonctionne avec COD

---

## 7. Tests de performance

### Test 7.1 : Charge

**Objectif** : Vérifier les performances

**Étapes** :
1. Créer 10 commandes COD simultanément
2. Vérifier les temps de réponse
3. Vérifier qu'il n'y a pas d'erreurs

**Résultat attendu** : ✅ Système stable

---

### Test 7.2 : Base de données

**Objectif** : Vérifier l'impact sur la base

**Étapes** :
1. Créer 100 commandes COD
2. Vérifier la taille de la table
3. Vérifier les performances des queries

**Résultat attendu** : ✅ Pas de dégradation

---

## 8. Tests de sécurité

### Test 8.1 : Validation

**Objectif** : Vérifier la validation côté serveur

**Étapes** :
1. Essayer de créer une commande sans champs requis
2. Essayer avec des données invalides
3. Vérifier les messages d'erreur

**Résultat attendu** : ✅ Validation stricte

---

### Test 8.2 : Permissions

**Objectif** : Vérifier les permissions

**Étapes** :
1. Essayer de modifier une commande d'un autre vendeur
2. Essayer d'accéder à des commandes sans être connecté
3. Vérifier les messages d'erreur

**Résultat attendu** : ✅ Accès refusé

---

## 9. Tests de compatibilité

### Test 9.1 : Anciennes commandes

**Objectif** : Vérifier que les anciennes commandes fonctionnent

**Étapes** :
1. Trouver une commande PayPal existante
2. Vérifier qu'elle s'affiche correctement
3. Vérifier que toutes les actions fonctionnent

**Résultat attendu** : ✅ Rétrocompatibilité totale

---

### Test 9.2 : Navigateurs

**Objectif** : Tester sur différents navigateurs

**Navigateurs à tester** :
- ✅ Chrome (dernière version)
- ✅ Firefox (dernière version)
- ✅ Safari (dernière version)
- ✅ Edge (dernière version)
- ✅ Chrome Mobile
- ✅ Safari Mobile

**Résultat attendu** : ✅ Fonctionne partout

---

## 10. Tests utilisateurs

### Test 10.1 : Feedback clients

**Objectif** : Recueillir les retours

**Méthode** :
1. Sélectionner 10 clients beta
2. Leur demander de commander avec COD
3. Recueillir leurs retours
4. Noter les points d'amélioration

**Résultat attendu** : Feedback positif

---

### Test 10.2 : Feedback vendeurs

**Objectif** : Recueillir les retours vendeurs

**Méthode** :
1. Sélectionner 5 vendeurs beta
2. Leur demander de gérer des commandes COD
3. Recueillir leurs retours
4. Noter les points d'amélioration

**Résultat attendu** : Feedback positif

---

## 📊 Rapport de test

### Template de rapport

```
# Rapport de test COD

**Date** : [Date]
**Testeur** : [Nom]
**Version** : 1.0

## Résumé
- Tests réussis : X/Y
- Tests échoués : Z
- Bugs trouvés : N

## Détails

### Backend
- [ ] Test 1.1 : [✅/❌]
- [ ] Test 1.2 : [✅/❌]

### Frontend Checkout
- [ ] Test 2.1 : [✅/❌]
- [ ] Test 2.2 : [✅/❌]
- [ ] Test 2.3 : [✅/❌]
- [ ] Test 2.4 : [✅/❌]

[...]

## Bugs trouvés
1. [Description du bug]
2. [Description du bug]

## Recommandations
1. [Recommandation]
2. [Recommandation]

## Conclusion
[Prêt pour production / Nécessite des corrections]
```

---

## 🐛 Bugs connus

### Liste des bugs à surveiller

1. **Aucun bug connu actuellement**

---

## ✅ Validation finale

### Checklist avant production

- [ ] Tous les tests backend passés
- [ ] Tous les tests frontend passés
- [ ] Tests d'intégration réussis
- [ ] Tests de performance OK
- [ ] Tests de sécurité OK
- [ ] Tests de compatibilité OK
- [ ] Feedback utilisateurs positif
- [ ] Aucun bug bloquant
- [ ] Documentation complète
- [ ] Équipe formée

---

**Statut** : ✅ Prêt pour les tests  
**Prochaine étape** : Tests utilisateurs beta
