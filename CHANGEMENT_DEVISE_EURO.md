# Changement de Devise - DH vers Euro (€)

## Résumé

Toutes les occurrences de "DH" (Dirham) ont été remplacées par "€" (Euro) dans l'application EntreCoiffeur.

## Fichiers modifiés

### Backend

1. **`backend/convex/orders.ts`**
   - Notifications de nouvelles commandes : `DH` → `€`
   - Ligne 175 : Notification en attente pour le vendeur

### Frontend - Hooks

2. **`frontend/src/hooks/useOrderNotifications.js`**
   - Notifications de commandes : `DH` → `€`
   - Ligne 75 : Notification affichée pour nouvelle commande

### Frontend - Pages

3. **`frontend/src/pages/ProductDetail.jsx`**
   - Frais de livraison : `DH` → `€`
   - Ligne 898 : Affichage des frais de livraison

4. **`frontend/src/pages/Checkout.jsx`**
   - Currency dans les données de paiement : `DH` → `EUR`
   - Bouton de confirmation : `DH` → `€`
   - Ligne 147 : Currency du paiement COD
   - Ligne 360 : Texte du bouton de confirmation

### Frontend - Composants Dashboard

5. **`frontend/src/components/dashboardv2/CouponsModule.jsx`**
   - Affichage des réductions fixes : `DH` → `€`
   - Ligne 348 : Fonction getDiscount()

6. **`frontend/src/components/dashboardv2/ProductsModule.jsx`**
   - Frais de livraison des produits : `DH` → `€`
   - Ligne 630 : Affichage des frais de livraison

7. **`frontend/src/components/dashboardv2/CouponQRCode.jsx`**
   - QR codes des coupons : `DH` → `€`
   - Ligne 66 : Canvas du QR code
   - Ligne 207 : HTML d'impression
   - Ligne 273 : Aperçu du QR code

8. **`frontend/src/components/dashboardv2/BusinessSalesModule.jsx`**
   - Prix de vente des fonds de commerce : `DH` → `€`
   - Placeholders des formulaires : `DH` → `€`
   - Ligne 353 : Affichage du prix
   - Ligne 564 : Placeholder CA annuel
   - Ligne 577 : Placeholder résultat net

### Frontend - Composants Admin

9. **`frontend/src/components/adminv2/CouponsModule.jsx`**
   - Statistiques de réductions : `DH` → `€`
   - Top coupons : `DH` → `€`
   - Liste des coupons : `DH` → `€`
   - Ligne 229 : Total des réductions accordées
   - Ligne 261 : Affichage dans top coupons
   - Ligne 374 : Badge de réduction

## Zones concernées

### Notifications
- ✅ Notifications push (app fermée)
- ✅ Notifications en temps réel
- ✅ Notifications backend (Convex)

### Pages publiques
- ✅ Page produit (frais de livraison)
- ✅ Page checkout (paiement)

### Dashboard vendeur
- ✅ Module Coupons
- ✅ Module Produits
- ✅ Module Fonds de commerce
- ✅ QR codes

### Admin
- ✅ Module Coupons
- ✅ Statistiques

## Symbole utilisé

**€** (symbole Euro Unicode : `\u20ac`)

## Currency code

**EUR** (au lieu de DH) pour les transactions

## Impact

- ✅ Toutes les notifications affichent maintenant "€"
- ✅ Tous les prix affichent "€"
- ✅ Tous les formulaires utilisent "€"
- ✅ Tous les QR codes affichent "€"
- ✅ Toutes les statistiques affichent "€"

## Vérification

Pour vérifier qu'il ne reste plus de "DH" :

```bash
# Rechercher dans le frontend
grep -r " DH" frontend/src --include="*.jsx" --include="*.js"

# Rechercher dans le backend
grep -r " DH" backend/convex --include="*.ts"
```

## Notes

- Le symbole "€" est utilisé partout pour la cohérence
- La currency "EUR" est utilisée dans les données de paiement
- Tous les montants restent inchangés, seul le symbole change
- Les calculs de commissions (10%) restent identiques

---

**Date de modification** : Novembre 2024  
**Version** : 1.0.0  
**Status** : ✅ Complété
