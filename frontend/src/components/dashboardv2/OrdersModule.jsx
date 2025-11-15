import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Search, X, ShoppingBag, TrendingUp, Clock, CheckCircle, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const OrdersModule = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Get seller orders and stats
  const sellerOrders = useQuery(api.orders.getSellerOrders, 
    userId ? { sellerId: userId } : "skip"
  )
  const orderStats = useQuery(api.orders.getSellerOrderStats, 
    userId ? { sellerId: userId } : "skip"
  )

  // Mutation to update order status
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus)

  // Filter orders
  const filteredOrders = sellerOrders?.filter(order => {
    // Search filter
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.billingInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.billingInfo.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesFilter = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesFilter
  })

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({
        orderId: orderId,
        status: newStatus
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  // Handle download invoice - Génère une facture PDF conforme aux normes françaises
  const handleDownloadInvoice = (order) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    
    // Couleurs modernes
    const primaryColor = [192, 180, 165] // #C0B4A5
    const accentColor = [34, 197, 94] // Vert moderne
    const darkColor = [30, 30, 30]
    const lightGray = [248, 250, 252]
    const mediumGray = [148, 163, 184]
    
    // ========== EN-TÊTE MODERNE ==========
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 50, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('ENTRECOIFFEUR', 20, 22)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Marketplace Professionnelle de Coiffure', 20, 30)
    doc.setFontSize(9)
    doc.text('www.entrecoiffeur.com', 20, 37)
    
    // Informations légales dans un encadré à droite
    const infoBoxX = pageWidth - 75
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(infoBoxX, 10, 65, 30, 2, 2, 'F')
    
    doc.setTextColor(...darkColor)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('SIRET:', infoBoxX + 3, 16)
    doc.setFont('helvetica', 'normal')
    doc.text('123 456 789 00012', infoBoxX + 3, 20)
    
    doc.setFont('helvetica', 'bold')
    doc.text('TVA:', infoBoxX + 3, 25)
    doc.setFont('helvetica', 'normal')
    doc.text('FR12345678901', infoBoxX + 3, 29)
    
    doc.setFont('helvetica', 'normal')
    doc.text('123 Avenue des Coiffeurs', infoBoxX + 3, 34)
    doc.text('75001 Paris, France', infoBoxX + 3, 38)
    
    // ========== TITRE ET INFORMATIONS FACTURE ==========
    doc.setTextColor(...darkColor)
    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURE', 20, 65)
    
    // Ligne décorative sous le titre
    doc.setDrawColor(...accentColor)
    doc.setLineWidth(2)
    doc.line(20, 68, 70, 68)
    
    // Informations de la facture dans un encadré moderne
    const invoiceDate = new Date(order.createdAt)
    doc.setFillColor(...lightGray)
    doc.roundedRect(20, 75, 85, 28, 3, 3, 'F')
    
    doc.setTextColor(...darkColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('N° Facture:', 25, 82)
    doc.setFont('helvetica', 'normal')
    doc.text(order.orderNumber, 25, 88)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Date d\'émission:', 25, 94)
    doc.setFont('helvetica', 'normal')
    doc.text(invoiceDate.toLocaleDateString('fr-FR'), 25, 100)
    
    // ========== INFORMATIONS CLIENT ==========
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(1.5)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(115, 75, 75, 45, 3, 3, 'FD')
    
    // Barre de couleur sur le côté
    doc.setFillColor(...accentColor)
    doc.rect(115, 75, 3, 45, 'F')
    
    doc.setTextColor(...darkColor)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURÉ À', 122, 82)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${order.billingInfo.firstName} ${order.billingInfo.lastName}`, 122, 90)
    
    doc.setFontSize(9)
    doc.setTextColor(...mediumGray)
    doc.text(order.billingInfo.address, 122, 96)
    doc.text(`${order.billingInfo.postalCode} ${order.billingInfo.city}`, 122, 102)
    doc.text(`Tél: ${order.billingInfo.phone}`, 122, 108)
    if (order.billingInfo.email) {
      doc.text(order.billingInfo.email, 122, 114)
    }
    
    // ========== TABLEAU DES PRODUITS ==========
    const tableStartY = 130
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['Désignation', 'Qté', 'Prix Unit. HT', 'TVA', 'Total HT']],
      body: [
        [
          order.productName,
          order.quantity.toString(),
          `${(order.productPrice / 1.20).toFixed(2)} €`,
          '20%',
          `${((order.productPrice * order.quantity) / 1.20).toFixed(2)} €`
        ]
      ],
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 6
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 6,
        textColor: darkColor
      },
      columnStyles: {
        0: { cellWidth: 90, halign: 'left' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      margin: { left: 20, right: 20 }
    })
    
    // ========== RÉCAPITULATIF FINANCIER ==========
    const summaryStartY = doc.lastAutoTable.finalY + 10
    const summaryX = pageWidth - 90
    
    doc.setFillColor(...lightGray)
    doc.roundedRect(summaryX - 5, summaryStartY - 5, 70, 50, 3, 3, 'F')
    
    doc.setTextColor(...darkColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    doc.text('Sous-total HT:', summaryX, summaryStartY)
    doc.text(`${((order.productPrice * order.quantity) / 1.20).toFixed(2)} €`, summaryX + 55, summaryStartY, { align: 'right' })
    
    doc.text('TVA (20%):', summaryX, summaryStartY + 7)
    doc.text(`${(((order.productPrice * order.quantity) / 1.20) * 0.20).toFixed(2)} €`, summaryX + 55, summaryStartY + 7, { align: 'right' })
    
    doc.text('Frais de livraison TTC:', summaryX, summaryStartY + 14)
    doc.text(`${order.shippingCost ? order.shippingCost.toFixed(2) : '0.00'} €`, summaryX + 55, summaryStartY + 14, { align: 'right' })
    
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(summaryX, summaryStartY + 18, summaryX + 60, summaryStartY + 18)
    
    doc.setFillColor(...accentColor)
    doc.roundedRect(summaryX - 5, summaryStartY + 22, 70, 12, 2, 2, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL TTC:', summaryX, summaryStartY + 30)
    doc.text(`${order.total.toFixed(2)} €`, summaryX + 55, summaryStartY + 30, { align: 'right' })
    
    // ========== INFORMATIONS DE PAIEMENT ==========
    const paymentY = summaryStartY + 45
    
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.roundedRect(20, paymentY, 85, 25, 3, 3, 'FD')
    
    doc.setTextColor(...darkColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMATIONS DE PAIEMENT', 25, paymentY + 7)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Mode: ${order.paymentMethod}`, 25, paymentY + 14)
    
    const isPaid = order.status === 'delivered'
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...(isPaid ? accentColor : [234, 179, 8]))
    doc.text(`Statut: ${isPaid ? 'Payé ✓' : 'En attente'}`, 25, paymentY + 20)
    
    // ========== PIED DE PAGE ==========
    const footerY = pageHeight - 35
    
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(20, footerY, pageWidth - 20, footerY)
    
    doc.setTextColor(...mediumGray)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.text('Mentions légales:', 20, footerY + 5)
    doc.text('En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée, à laquelle s\'ajoutera', 20, footerY + 9)
    doc.text('une indemnité forfaitaire pour frais de recouvrement de 40 euros. TVA non applicable, art. 293 B du CGI.', 20, footerY + 13)
    doc.text('Dispensé d\'immatriculation au RCS et au RM.', 20, footerY + 17)
    
    doc.setFont('helvetica', 'normal')
    doc.text('contact@entrecoiffeur.com', 20, footerY + 23)
    doc.text('Page 1/1', pageWidth - 20, footerY + 23, { align: 'right' })
    
    // Télécharger le PDF
    doc.save(`Facture_${order.orderNumber}.pdf`)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { variant: 'info', icon: '✅', label: 'Confirmée' },
      preparing: { variant: 'warning', icon: '📦', label: 'Préparation' },
      shipped: { variant: 'info', icon: '🚚', label: 'Expédiée' },
      delivered: { variant: 'success', icon: '🏠', label: 'Livrée' },
      cancelled: { variant: 'destructive', icon: '❌', label: 'Annulée' }
    }

    const config = statusConfig[status] || statusConfig.confirmed
    return (
      <Badge variant={config.variant}>
        {config.icon} {config.label}
      </Badge>
    )
  }

  const filterButtons = [
    { id: 'all', label: 'Toutes', icon: '📋' },
    { id: 'confirmed', label: 'Confirmées', icon: '✅' },
    { id: 'preparing', label: 'Préparation', icon: '📦' },
    { id: 'shipped', label: 'Expédiées', icon: '🚚' },
    { id: 'delivered', label: 'Livrées', icon: '🏠' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Mes ventes</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gérez les commandes de vos produits
        </p>
      </div>

      {/* Statistics Cards */}
      {orderStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Toutes les commandes reçues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.totalRevenue?.toFixed(2)}€</div>
              <p className="text-xs text-muted-foreground">
                Chiffre d'affaires total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.confirmedOrders}</div>
              <p className="text-xs text-muted-foreground">
                Commandes confirmées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livrées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.deliveredOrders}</div>
              <p className="text-xs text-muted-foreground">
                Commandes complétées
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par N° commande, produit, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((filter) => (
                <Button
                  key={filter.id}
                  variant={statusFilter === filter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.id)}
                >
                  {filter.icon} {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredOrders && filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Facture</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <span className="font-mono text-sm">#{order.orderNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.productPrice}€/unité
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {order.billingInfo.firstName} {order.billingInfo.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.billingInfo.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.billingInfo.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.quantity}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {order.total.toFixed(2)}€
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => handleStatusUpdate(order._id, newStatus)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Changer statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">✅ Confirmée</SelectItem>
                          <SelectItem value="preparing">📦 Préparation</SelectItem>
                          <SelectItem value="shipped">🚚 Expédiée</SelectItem>
                          <SelectItem value="delivered">🏠 Livrée</SelectItem>
                          <SelectItem value="cancelled">❌ Annulée</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {order.status === 'delivered' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(order)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Facture PDF
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Disponible après livraison</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Aucune commande reçue</h3>
              <p className="text-sm text-muted-foreground">
                Vos commandes apparaîtront ici une fois que des clients achèteront vos produits.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default OrdersModule
