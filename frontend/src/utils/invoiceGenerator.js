import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Génère une facture PDF conforme aux normes françaises
 * @param {Object} invoice - Données de la facture
 * @returns {jsPDF} - Document PDF
 */
export function generateInvoicePDF(invoice) {
  const doc = new jsPDF();
  
  // Couleurs
  const primaryColor = [192, 180, 165]; // #C0B4A5 (beige)
  const darkColor = [45, 45, 45]; // #2d2d2d
  const lightGray = [240, 240, 240];
  
  let yPos = 20;
  
  // ========== EN-TÊTE ==========
  
  // Logo et nom de l'entreprise (vendeur)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('EntreCoiffeur', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  
  // Informations vendeur
  if (invoice.seller.companyName) {
    doc.text(invoice.seller.companyName, 20, yPos);
    yPos += 5;
  }
  doc.text(`${invoice.seller.firstName} ${invoice.seller.lastName}`, 20, yPos);
  yPos += 5;
  doc.text(invoice.seller.address, 20, yPos);
  yPos += 5;
  doc.text(`${invoice.seller.city}${invoice.seller.postalCode ? ', ' + invoice.seller.postalCode : ''}`, 20, yPos);
  yPos += 5;
  doc.text(invoice.seller.country, 20, yPos);
  yPos += 5;
  
  if (invoice.seller.siret) {
    doc.text(`SIRET: ${invoice.seller.siret}`, 20, yPos);
    yPos += 5;
  }
  if (invoice.seller.tvaNumber) {
    doc.text(`TVA: ${invoice.seller.tvaNumber}`, 20, yPos);
    yPos += 5;
  }
  
  doc.text(`Email: ${invoice.seller.email}`, 20, yPos);
  yPos += 5;
  if (invoice.seller.phone) {
    doc.text(`Tél: ${invoice.seller.phone}`, 20, yPos);
    yPos += 5;
  }
  
  // ========== TITRE FACTURE ==========
  
  yPos = 20;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('FACTURE', 150, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  doc.text(`N° ${invoice.invoiceNumber}`, 150, yPos);
  yPos += 5;
  doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}`, 150, yPos);
  yPos += 5;
  doc.text(`Commande: ${invoice.orderNumber}`, 150, yPos);
  
  // ========== INFORMATIONS CLIENT ==========
  
  yPos = 70;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À:', 20, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (invoice.buyer.companyName) {
    doc.text(invoice.buyer.companyName, 20, yPos);
    yPos += 5;
  }
  doc.text(`${invoice.buyer.firstName} ${invoice.buyer.lastName}`, 20, yPos);
  yPos += 5;
  doc.text(invoice.buyer.address, 20, yPos);
  yPos += 5;
  doc.text(`${invoice.buyer.postalCode} ${invoice.buyer.city}`, 20, yPos);
  yPos += 5;
  doc.text(invoice.buyer.country, 20, yPos);
  yPos += 5;
  doc.text(`Email: ${invoice.buyer.email}`, 20, yPos);
  yPos += 5;
  
  if (invoice.buyer.siret) {
    doc.text(`SIRET: ${invoice.buyer.siret}`, 20, yPos);
    yPos += 5;
  }
  if (invoice.buyer.tvaNumber) {
    doc.text(`TVA: ${invoice.buyer.tvaNumber}`, 20, yPos);
    yPos += 5;
  }
  
  // ========== CONDITIONS DE PAIEMENT ==========
  
  yPos = 70;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS:', 150, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paiement: ${invoice.paymentTerms}`, 150, yPos);
  yPos += 5;
  doc.text(`Méthode: ${invoice.paymentMethod}`, 150, yPos);
  yPos += 5;
  
  const statusLabels = {
    paid: 'Payée',
    pending: 'En attente',
    partial: 'Partiel',
    cancelled: 'Annulée'
  };
  doc.text(`Statut: ${statusLabels[invoice.paymentStatus] || invoice.paymentStatus}`, 150, yPos);
  
  // ========== TABLEAU DES ARTICLES ==========
  
  yPos = 120;
  
  const tableData = invoice.items.map(item => [
    item.productName,
    item.quantity.toString(),
    `${item.unitPriceHT.toFixed(2)} €`,
    `${item.tvaRate}%`,
    `${item.totalHT.toFixed(2)} €`,
    `${item.tvaAmount.toFixed(2)} €`,
    `${item.totalTTC.toFixed(2)} €`
  ]);
  
  // Ajouter les frais de port
  if (invoice.shippingHT > 0) {
    tableData.push([
      'Frais de port',
      '1',
      `${invoice.shippingHT.toFixed(2)} €`,
      `${(invoice.shippingTVA / invoice.shippingHT * 100).toFixed(1)}%`,
      `${invoice.shippingHT.toFixed(2)} €`,
      `${invoice.shippingTVA.toFixed(2)} €`,
      `${(invoice.shippingHT + invoice.shippingTVA).toFixed(2)} €`
    ]);
  }
  
  // Ajouter la réduction si applicable
  if (invoice.discountHT && invoice.discountHT > 0) {
    tableData.push([
      `Réduction${invoice.couponCode ? ` (${invoice.couponCode})` : ''}`,
      '1',
      `-${invoice.discountHT.toFixed(2)} €`,
      `${(invoice.discountTVA / invoice.discountHT * 100).toFixed(1)}%`,
      `-${invoice.discountHT.toFixed(2)} €`,
      `-${invoice.discountTVA.toFixed(2)} €`,
      `-${(invoice.discountHT + invoice.discountTVA).toFixed(2)} €`
    ]);
  }
  
  autoTable(doc, {
    startY: yPos,
    head: [['Désignation', 'Qté', 'Prix HT', 'TVA', 'Total HT', 'Montant TVA', 'Total TTC']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' }
    }
  });
  
  yPos = doc.previousAutoTable.finalY + 10;
  
  // ========== DÉTAIL TVA ==========
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAIL TVA:', 20, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  
  invoice.tvaBreakdown.forEach(breakdown => {
    doc.text(
      `TVA ${breakdown.rate}%: Base HT ${breakdown.baseHT.toFixed(2)} € - Montant TVA ${breakdown.tvaAmount.toFixed(2)} €`,
      20,
      yPos
    );
    yPos += 5;
  });
  
  // ========== TOTAUX ==========
  
  yPos += 5;
  
  // Fond gris pour les totaux
  doc.setFillColor(...lightGray);
  doc.rect(120, yPos - 5, 70, 25, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total HT:', 125, yPos);
  doc.text(`${invoice.totalHT.toFixed(2)} €`, 180, yPos, { align: 'right' });
  
  yPos += 6;
  doc.text('Total TVA:', 125, yPos);
  doc.text(`${invoice.totalTVA.toFixed(2)} €`, 180, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC:', 125, yPos);
  doc.text(`${invoice.totalTTC.toFixed(2)} €`, 180, yPos, { align: 'right' });
  
  // ========== MENTIONS LÉGALES ==========
  
  yPos += 15;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  // Mention TVA non applicable si nécessaire
  if (invoice.legalMentions.noVAT) {
    doc.text(invoice.legalMentions.noVATReason, 20, yPos);
    yPos += 4;
  }
  
  // Autoliquidation si applicable
  if (invoice.legalMentions.reverseCharge) {
    doc.text('Autoliquidation - TVA due par le client', 20, yPos);
    yPos += 4;
  }
  
  // Pénalités de retard (obligatoire)
  yPos += 2;
  const penaltyText = doc.splitTextToSize(invoice.latePenaltyText, 170);
  doc.text(penaltyText, 20, yPos);
  yPos += penaltyText.length * 4;
  
  // Escompte si applicable
  if (invoice.legalMentions.escompte) {
    yPos += 2;
    doc.text(`Escompte: ${invoice.legalMentions.escompte}`, 20, yPos);
    yPos += 4;
  }
  
  // ========== PIED DE PAGE ==========
  
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Facture générée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );
  
  return doc;
}

/**
 * Télécharge la facture en PDF
 * @param {Object} invoice - Données de la facture
 */
export function downloadInvoicePDF(invoice) {
  const doc = generateInvoicePDF(invoice);
  doc.save(`Facture_${invoice.invoiceNumber}.pdf`);
}

/**
 * Ouvre la facture dans un nouvel onglet
 * @param {Object} invoice - Données de la facture
 */
export function previewInvoicePDF(invoice) {
  const doc = generateInvoicePDF(invoice);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}

/**
 * Convertit la facture en Blob pour upload
 * @param {Object} invoice - Données de la facture
 * @returns {Blob} - Blob PDF
 */
export function invoicePDFToBlob(invoice) {
  const doc = generateInvoicePDF(invoice);
  return doc.output('blob');
}
