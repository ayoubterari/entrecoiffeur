# Système de Facturation Conforme aux Normes Françaises

## Vue d'ensemble

Le système de facturation d'EntreCoiffeur génère des factures conformes aux exigences légales françaises pour toutes les opérations d'achat et de vente de commandes.

## Conformité Légale Française

### Mentions Obligatoires Incluses

1. **Numérotation unique et séquentielle**
   - Format: `FAC-YYYY-XXXXX` (ex: FAC-2025-00001)
   - Séquence continue par année civile

2. **Informations Vendeur (Émetteur)**
   - Raison sociale ou nom complet
   - Adresse complète
   - Numéro SIRET (si applicable)
   - Numéro TVA intracommunautaire (si applicable)
   - Email et téléphone

3. **Informations Acheteur (Destinataire)**
   - Nom complet ou raison sociale
   - Adresse de facturation complète
   - SIRET et TVA (si professionnel)

4. **Détail des Produits/Services**
   - Désignation précise
   - Quantité
   - Prix unitaire HT
   - Taux de TVA applicable
   - Montant TVA
   - Total HT et TTC par ligne

5. **Totaux Obligatoires**
   - Total HT (Hors Taxes)
   - Total TVA avec détail par taux
   - Total TTC (Toutes Taxes Comprises)

6. **Conditions de Paiement**
   - Modalités de paiement
   - Date d'échéance (si applicable)
   - Méthode de paiement

7. **Pénalités de Retard** (Obligatoire selon loi française)
   - Taux de pénalités: 10%
   - Indemnité forfaitaire de recouvrement: 40€
   - Texte légal complet conforme aux articles L441-6 et D441-5 du Code de commerce

8. **Mentions Légales Spécifiques**
   - TVA non applicable (si micro-entreprise): "TVA non applicable, art. 293 B du CGI"
   - Autoliquidation (si export UE)
   - Conditions d'escompte (si applicable)

## Architecture Backend

### Table Convex: `invoices`

```typescript
{
  // Identification
  invoiceNumber: string,        // FAC-2025-00001
  invoiceDate: number,          // Timestamp
  orderId: Id<"orders">,
  orderNumber: string,
  
  // Vendeur
  seller: {
    userId, companyName, firstName, lastName,
    address, city, postalCode, country,
    siret, tvaNumber, email, phone
  },
  
  // Acheteur
  buyer: {
    userId, companyName, firstName, lastName,
    address, city, postalCode, country,
    email, siret, tvaNumber
  },
  
  // Lignes de facture
  items: [{
    productId, productName, description,
    quantity, unitPriceHT, tvaRate,
    tvaAmount, totalHT, totalTTC
  }],
  
  // Totaux
  subtotalHT, shippingHT, shippingTVA,
  discountHT, discountTVA,
  totalHT, totalTVA, totalTTC,
  
  // Détail TVA par taux
  tvaBreakdown: [{
    rate, baseHT, tvaAmount
  }],
  
  // Paiement
  paymentMethod, paymentDate, paymentStatus,
  paymentTerms, paymentDueDate,
  
  // Pénalités (obligatoire)
  latePenaltyRate, latePenaltyText, recoveryIndemnity,
  
  // Mentions légales
  legalMentions: {
    noVAT, noVATReason, reverseCharge, escompte
  },
  
  // Statut
  status: "draft" | "issued" | "sent" | "paid" | "cancelled" | "credited",
  
  // Métadonnées
  generatedBy, sentAt, pdfUrl, notes,
  createdAt, updatedAt
}
```

### Mutations

#### `generateInvoiceFromOrder`
Génère automatiquement une facture à partir d'une commande.

**Arguments:**
- `orderId`: ID de la commande
- `tvaRate` (optionnel): Taux de TVA (défaut: 20%)
- `generatedBy` (optionnel): ID de l'utilisateur qui génère

**Processus:**
1. Récupère la commande et les informations vendeur/acheteur
2. Génère un numéro de facture unique et séquentiel
3. Calcule les montants HT et TVA à partir des montants TTC
4. Crée le détail TVA par taux
5. Applique les mentions légales selon le profil vendeur
6. Sauvegarde la facture avec statut approprié

#### `updateInvoiceStatus`
Met à jour le statut d'une facture.

#### `markInvoiceAsSent`
Marque une facture comme envoyée au client.

#### `cancelInvoice`
Annule une facture avec raison.

#### `createCreditNote`
Crée un avoir (credit note) pour une facture.

**Processus:**
1. Récupère la facture originale
2. Génère un nouveau numéro de facture
3. Inverse tous les montants (négatifs)
4. Lie l'avoir à la facture originale
5. Met à jour le statut de la facture originale

#### `attachInvoicePDF`
Attache un PDF généré à une facture.

### Queries

#### `getAllInvoices`
Récupère toutes les factures (admin).

#### `getSellerInvoices`
Récupère les factures d'un vendeur.

#### `getBuyerInvoices`
Récupère les factures d'un acheteur.

#### `getInvoiceById`
Récupère une facture par son ID.

#### `getInvoiceByNumber`
Récupère une facture par son numéro.

#### `getInvoiceByOrder`
Récupère la facture d'une commande.

#### `getInvoicesStats`
Statistiques globales des factures (admin).

#### `getSellerInvoicesStats`
Statistiques des factures d'un vendeur.

#### `searchInvoices`
Recherche de factures avec filtres.

#### `getUnpaidInvoices`
Factures non payées.

#### `getOverdueInvoices`
Factures en retard de paiement.

## Génération PDF

### Bibliothèque: jsPDF + jspdf-autotable

### Fonctions (`utils/invoiceGenerator.js`)

#### `generateInvoicePDF(invoice)`
Génère le document PDF complet.

**Sections du PDF:**
1. **En-tête**
   - Logo EntreCoiffeur
   - Informations vendeur complètes
   - Titre "FACTURE"
   - Numéro et date de facture

2. **Informations Client**
   - Bloc "FACTURÉ À"
   - Adresse complète
   - SIRET/TVA si applicable

3. **Conditions de Paiement**
   - Modalités
   - Méthode
   - Statut

4. **Tableau des Articles**
   - Colonnes: Désignation, Qté, Prix HT, TVA, Total HT, Montant TVA, Total TTC
   - Lignes produits
   - Frais de port
   - Réductions (si applicable)

5. **Détail TVA**
   - Par taux de TVA
   - Base HT et montant TVA

6. **Totaux**
   - Total HT
   - Total TVA
   - **Total TTC** (en gras)

7. **Mentions Légales**
   - TVA non applicable (si micro-entreprise)
   - Autoliquidation (si export UE)
   - **Pénalités de retard** (obligatoire)
   - Escompte (si applicable)

8. **Pied de page**
   - Date et heure de génération

#### `downloadInvoicePDF(invoice)`
Télécharge la facture en PDF.

#### `previewInvoicePDF(invoice)`
Ouvre la facture dans un nouvel onglet.

#### `invoicePDFToBlob(invoice)`
Convertit en Blob pour upload.

## Interface Utilisateur

### Dashboard Vendeur (`/dashboard`)

**Module: InvoicesModule**

**Fonctionnalités:**
- Statistiques personnelles:
  - Total factures
  - Factures payées
  - En attente
  - Revenu total HT/TTC
- Recherche par numéro, commande ou client
- Filtres par statut
- Actions:
  - 👁️ Prévisualiser (nouvel onglet)
  - 📥 Télécharger PDF

**Accès:**
- Visible uniquement pour professionnels et grossistes
- Onglet "Mes Factures" avec icône FileText (📄)
- Position: Après "Mes ventes", avant "Réclamations"

### Admin (`/admin`)

**Module: InvoicesModule**

**Fonctionnalités:**
- Statistiques globales:
  - Total factures plateforme
  - Factures payées
  - En attente
  - Revenu total HT
  - TVA collectée
  - Revenu TTC
- Recherche avancée (numéro, commande, client, vendeur)
- Filtres par statut
- Affichage enrichi:
  - Informations vendeur et acheteur
  - Montants HT et TTC
  - Badges de statut et paiement
- Actions:
  - 👁️ Prévisualiser
  - 📥 Télécharger PDF

**Accès:**
- Permission "invoices" requise
- Onglet "Factures" dans la sidebar
- Position: Après "Commandes", avant "Commissions"

## Taux de TVA Français

```javascript
const TVA_RATES = {
  NORMAL: 20,           // Taux normal
  INTERMEDIATE: 10,     // Taux intermédiaire
  REDUCED: 5.5,         // Taux réduit
  SUPER_REDUCED: 2.1    // Taux super réduit
}
```

**Par défaut:** 20% (taux normal)

## Calcul des Montants

### Conversion TTC → HT + TVA

```javascript
function calculateHTFromTTC(ttc, tvaRate) {
  const ht = ttc / (1 + tvaRate / 100)
  const tva = ttc - ht
  return {
    ht: Math.round(ht * 100) / 100,
    tva: Math.round(tva * 100) / 100
  }
}
```

### Exemple

**Produit TTC:** 120€  
**TVA:** 20%

```
HT = 120 / 1.20 = 100€
TVA = 120 - 100 = 20€
```

## Statuts de Facture

| Statut | Description | Badge |
|--------|-------------|-------|
| `draft` | Brouillon | Gris |
| `issued` | Émise | Bleu |
| `sent` | Envoyée au client | Violet |
| `paid` | Payée | Vert |
| `cancelled` | Annulée | Rouge |
| `credited` | Avoir émis | Orange |

## Statuts de Paiement

| Statut | Description | Icône |
|--------|-------------|-------|
| `paid` | Payé | ✅ CheckCircle |
| `pending` | En attente | ⏰ Clock |
| `partial` | Partiellement payé | ⏰ Clock |
| `cancelled` | Annulé | ❌ XCircle |

## Génération Automatique

### Lors de la Création de Commande

Pour activer la génération automatique de factures lors de la création de commandes, ajoutez cet appel dans la mutation `createOrder`:

```javascript
// Après la création de la commande
try {
  await ctx.runMutation(api.functions.mutations.invoices.generateInvoiceFromOrder, {
    orderId: orderId,
    tvaRate: 20, // Taux par défaut
  });
} catch (error) {
  console.error("Erreur génération facture:", error);
  // Ne pas faire échouer la commande si la facture échoue
}
```

## Cas d'Usage

### 1. Vendeur Consulte ses Factures

1. Accède à Dashboard → Mes Factures
2. Voit ses statistiques de revenus
3. Recherche une facture spécifique
4. Prévisualise ou télécharge le PDF

### 2. Admin Supervise les Factures

1. Accède à Admin → Factures
2. Voit les statistiques globales de la plateforme
3. Recherche par vendeur ou client
4. Vérifie la conformité des factures
5. Télécharge pour archivage

### 3. Génération d'Avoir

1. Admin ou vendeur identifie une facture à annuler
2. Utilise la mutation `createCreditNote`
3. Système génère un avoir avec montants négatifs
4. Facture originale marquée comme "credited"
5. Avoir téléchargeable en PDF

### 4. Micro-Entreprise (TVA non applicable)

Si le vendeur n'a pas de numéro de TVA:
- Mention automatique: "TVA non applicable, art. 293 B du CGI"
- Calculs adaptés
- Conformité légale assurée

## Avantages du Système

✅ **Conformité légale française complète**  
✅ **Génération automatique depuis les commandes**  
✅ **Numérotation séquentielle garantie**  
✅ **PDF professionnel prêt à imprimer**  
✅ **Calculs précis HT/TVA/TTC**  
✅ **Support des avoirs**  
✅ **Mentions légales obligatoires incluses**  
✅ **Gestion des pénalités de retard**  
✅ **Détail TVA par taux**  
✅ **Statistiques complètes**  
✅ **Recherche et filtres avancés**  
✅ **Interface intuitive vendeurs et admin**

## Fichiers Créés

### Backend
- `backend/convex/schema.ts` - Table invoices
- `backend/convex/functions/mutations/invoices.ts` - 6 mutations
- `backend/convex/functions/queries/invoices.ts` - 11 queries

### Frontend
- `frontend/src/utils/invoiceGenerator.js` - Génération PDF
- `frontend/src/components/dashboardv2/InvoicesModule.jsx` - Module vendeur
- `frontend/src/components/adminv2/InvoicesModule.jsx` - Module admin

### Intégrations
- `frontend/src/components/dashboardv2/Sidebar.jsx` - Onglet ajouté
- `frontend/src/pages/DashboardV2.jsx` - Module intégré
- `frontend/src/components/adminv2/Sidebar.jsx` - Onglet ajouté
- `frontend/src/pages/AdminV2.jsx` - Module intégré

## Dépendances NPM

```bash
npm install jspdf jspdf-autotable
```

## Prochaines Améliorations Possibles

- [ ] Envoi automatique par email
- [ ] Relances automatiques pour factures impayées
- [ ] Export comptable (CSV, Excel)
- [ ] Intégration avec logiciels de comptabilité
- [ ] Factures récurrentes
- [ ] Multi-devises
- [ ] Personnalisation du template PDF
- [ ] Signature électronique
- [ ] Archivage légal (10 ans)
- [ ] Tableau de bord comptable avancé

## Support

Pour toute question sur le système de facturation:
- Documentation: Ce fichier
- Code source: Voir fichiers listés ci-dessus
- Conformité: Basé sur le Code de commerce français

---

**Date de création:** 7 novembre 2025  
**Version:** 1.0.0  
**Conformité:** Normes françaises 2025
