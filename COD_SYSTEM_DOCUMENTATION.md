# Documentation Système COD (Cash on Delivery)

## Vue d'ensemble

Le système de paiement à la livraison (COD - Cash on Delivery) a été implémenté pour remplacer complètement le système PayPal. Les clients peuvent maintenant commander sans payer en ligne et règlent en espèces lors de la réception de leur commande.

---

## Architecture Backend

### 1. Schéma Convex modifié

**Fichier** : `backend/convex/schema.ts`

#### Table `orders`
```typescript
orders: defineTable({
  // ... autres champs
  paymentMethod: v.string(),
  paymentId: v.optional(v.string()), // ✨ Maintenant optionnel pour COD
  paymentStatus: v.union(v.literal("paid"), v.literal("pending"), v.literal("failed")),
  // ... autres champs
})
```

**Changements** :
- `paymentId` est maintenant **optionnel** car les commandes COD n'ont pas de transaction en ligne
- `paymentStatus` peut être "pending" pour les commandes COD

---

### 2. Mutation `createOrder` modifiée

**Fichier** : `backend/convex/orders.ts`

#### Logique de statut automatique
```typescript
// Déterminer le statut de paiement selon la méthode
const paymentStatus = args.paymentMethod === "COD" || args.paymentMethod === "Cash on Delivery" 
  ? "pending" 
  : "paid";

// Déterminer le statut de la commande
const orderStatus = args.paymentMethod === "COD" || args.paymentMethod === "Cash on Delivery"
  ? "pending"
  : "confirmed";
```

**Comportement** :
- **COD** : `paymentStatus = "pending"`, `orderStatus = "pending"`
- **Autres** : `paymentStatus = "paid"`, `orderStatus = "confirmed"`

---

## Frontend

### 1. Page Checkout modifiée

**Fichier** : `frontend/src/pages/Checkout.jsx`

#### Changements majeurs

**Méthode de paiement par défaut** :
```javascript
const [paymentMethod, setPaymentMethod] = useState('cod')
```

**Fonction de paiement COD** :
```javascript
const handleCODPayment = async () => {
  // Validation des champs
  // Application du coupon si présent
  // Création de la commande avec paymentMethod: 'COD'
  // Redirection vers page de succès
}
```

**Interface utilisateur** :
- ✅ Une seule option de paiement : COD
- 💵 Icône et description claires
- ℹ️ Section explicative "Comment ça marche ?"
- 🔒 Badges de sécurité adaptés

---

### 2. Styles CSS ajoutés

**Fichier** : `frontend/src/pages/Checkout.css`

#### Nouveaux styles
```css
/* Bouton COD */
.cod-button {
  background: linear-gradient(135deg, #C0B4A5, #A89985);
  /* ... */
}

/* Section d'information COD */
.cod-info {
  margin: 1.2rem 0;
}

.info-box {
  background: linear-gradient(135deg, rgba(192, 180, 165, 0.1), rgba(168, 153, 133, 0.1));
  border: 2px solid rgba(192, 180, 165, 0.3);
  /* ... */
}
```

---

### 3. Module Admin PayPal remplacé

**Fichier** : `frontend/src/components/adminv2/PaymentModule.jsx`

Le module PayPal a été complètement remplacé par un module informatif sur le COD :

#### Sections du nouveau module
1. **Header** : Badge "Actif" pour COD
2. **Statut COD** : Alert de confirmation
3. **Informations COD** : 3 cartes (Paiement, Livraison, Sans risque)
4. **Avantages** : 4 points clés
5. **Processus** : 5 étapes du flux de commande
6. **Informations vendeurs** : Notes importantes

---

## Flux de commande COD

### 1. Côté Client

```
1. Client ajoute produit au panier
   ↓
2. Client accède au checkout
   ↓
3. Client remplit informations de facturation
   ↓
4. Client sélectionne COD (par défaut)
   ↓
5. Client confirme la commande
   ↓
6. Commande créée avec status "pending"
   ↓
7. Redirection vers page de succès
```

### 2. Côté Vendeur

```
1. Vendeur reçoit notification de nouvelle commande
   ↓
2. Commande visible avec status "En attente"
   ↓
3. Vendeur prépare la commande
   ↓
4. Vendeur change status à "En préparation"
   ↓
5. Vendeur expédie (status "Expédié")
   ↓
6. Livreur livre et collecte paiement
   ↓
7. Vendeur confirme livraison (status "Livré")
   ↓
8. Paiement marqué comme "paid"
```

---

## Statuts de commande COD

| Statut | Description | Paiement |
|--------|-------------|----------|
| `pending` | Commande reçue, en attente de traitement | Pending |
| `confirmed` | Commande confirmée par le vendeur | Pending |
| `preparing` | Commande en cours de préparation | Pending |
| `shipped` | Commande expédiée | Pending |
| `delivered` | Commande livrée, paiement reçu | Paid |
| `cancelled` | Commande annulée | Failed |

---

## Affichage dans les modules

### 1. Module Commandes Admin
**Fichier** : `frontend/src/components/adminv2/OrdersModule.jsx`

- Affiche `paymentMethod: "COD"`
- Affiche `paymentStatus: "pending"` ou "paid"
- Badge coloré selon le statut

### 2. Module Mes Ventes (Vendeur)
**Fichier** : `frontend/src/components/dashboardv2/OrdersModule.jsx`

- Liste des commandes COD avec badge spécial
- Génération de facture PDF avec mention COD
- Statut de paiement visible

### 3. Module Mes Achats (Client)
**Fichier** : `frontend/src/components/dashboardv2/PurchasesModule.jsx`

- Affichage de la méthode de paiement COD
- Instructions de paiement à la livraison
- Suivi de commande

---

## Avantages du système COD

### Pour les clients
- ✅ Pas besoin de carte bancaire
- ✅ Vérification du produit avant paiement
- ✅ Aucune donnée bancaire en ligne
- ✅ Confiance accrue

### Pour les vendeurs
- ✅ Pas de frais PayPal (0% de commission externe)
- ✅ Paiement direct en espèces
- ✅ Accessibilité à plus de clients
- ✅ Simplicité de gestion

### Pour la plateforme
- ✅ Pas de configuration PayPal nécessaire
- ✅ Pas de frais de transaction
- ✅ Système plus simple
- ✅ Adapté au marché local

---

## Sécurité et gestion des risques

### Mesures de sécurité

1. **Validation des commandes**
   - Tous les champs requis sont validés
   - Email et téléphone vérifiés

2. **Traçabilité**
   - Chaque commande a un numéro unique
   - Historique complet des changements de statut
   - Logs de toutes les actions

3. **Gestion des annulations**
   - Vendeur peut annuler avant expédition
   - Client peut annuler avant préparation
   - Statut "cancelled" avec raison

### Gestion des impayés

**Recommandations** :
- Confirmer la commande par téléphone avant expédition
- Utiliser un service de livraison fiable
- Demander une confirmation de réception
- Blacklister les clients problématiques (fonctionnalité future)

---

## Commissions

Les commissions de la plateforme (10%) sont calculées sur le montant total de la commande, indépendamment du statut de paiement.

**Calcul** :
```javascript
const commission = order.total * 0.10 // 10%
```

**Versement au vendeur** :
```javascript
const netVendeur = order.total - commission // 90%
```

---

## Tests recommandés

### 1. Test de commande complète
```
1. Créer un compte client
2. Ajouter un produit au panier
3. Aller au checkout
4. Remplir les informations
5. Confirmer avec COD
6. Vérifier la création de commande
7. Vérifier les statuts (pending/pending)
```

### 2. Test de changement de statut
```
1. Vendeur accède à "Mes Ventes"
2. Sélectionne une commande COD
3. Change le statut à "En préparation"
4. Change à "Expédié"
5. Change à "Livré"
6. Vérifier paymentStatus = "paid"
```

### 3. Test d'affichage
```
1. Vérifier dans Admin > Commandes
2. Vérifier dans Vendeur > Mes Ventes
3. Vérifier dans Client > Mes Achats
4. Vérifier les factures PDF
```

---

## Fichiers modifiés

### Backend
- ✅ `backend/convex/schema.ts` - paymentId optionnel
- ✅ `backend/convex/orders.ts` - Logique COD dans createOrder

### Frontend
- ✅ `frontend/src/pages/Checkout.jsx` - Interface COD
- ✅ `frontend/src/pages/Checkout.css` - Styles COD
- ✅ `frontend/src/components/adminv2/PaymentModule.jsx` - Module informatif COD

### Modules existants (compatibles)
- ✅ `frontend/src/components/adminv2/OrdersModule.jsx`
- ✅ `frontend/src/components/dashboardv2/OrdersModule.jsx`
- ✅ `frontend/src/components/dashboardv2/PurchasesModule.jsx`

---

## Migration depuis PayPal

### Étapes effectuées
1. ✅ Schéma modifié pour rendre paymentId optionnel
2. ✅ Mutation createOrder adaptée pour COD
3. ✅ Page Checkout remplacée par interface COD
4. ✅ Module Admin PayPal remplacé par module COD
5. ✅ Styles CSS ajoutés pour COD
6. ✅ Documentation créée

### Données existantes
Les commandes PayPal existantes restent intactes avec :
- `paymentMethod: "PayPal"` ou `"Carte bancaire"`
- `paymentId: "PAYPAL_xxx"` ou `"CARD_xxx"`
- `paymentStatus: "paid"`

---

## Prochaines améliorations possibles

### Court terme
- [ ] Confirmation SMS pour les commandes COD
- [ ] Appel téléphonique automatique de confirmation
- [ ] Système de notation des clients (fiabilité)

### Moyen terme
- [ ] Intégration avec services de livraison
- [ ] Tracking en temps réel
- [ ] Preuve de livraison (photo/signature)

### Long terme
- [ ] Option de paiement partiel en ligne
- [ ] Assurance contre les impayés
- [ ] Programme de fidélité pour clients fiables

---

## Support et maintenance

### Logs à surveiller
- Taux d'annulation des commandes COD
- Taux d'impayés
- Temps moyen de livraison
- Satisfaction client

### Métriques importantes
- Nombre de commandes COD vs total
- Montant moyen des commandes COD
- Taux de conversion checkout COD
- Taux de retour/annulation

---

## Contact et assistance

Pour toute question ou problème :
- 📧 Support technique : support@entrecoiffeur.com
- 📱 Hotline vendeurs : [À définir]
- 📚 Documentation complète : Ce fichier

---

**Date de mise en place** : Décembre 2024  
**Version** : 1.0  
**Statut** : ✅ Production Ready
