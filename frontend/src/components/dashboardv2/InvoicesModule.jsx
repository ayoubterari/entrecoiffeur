import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../lib/convex';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Euro,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { downloadInvoicePDF, previewInvoicePDF } from '../../utils/invoiceGenerator';

const InvoicesModule = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Récupérer les factures du vendeur
  const invoices = useQuery(api.functions.queries.invoices.getSellerInvoices, {
    sellerId: userId
  });

  // Récupérer les statistiques
  const stats = useQuery(api.functions.queries.invoices.getSellerInvoicesStats, {
    sellerId: userId
  });

  // Filtrer les factures
  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${invoice.buyer.firstName} ${invoice.buyer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Fonction pour télécharger la facture
  const handleDownload = (invoice) => {
    downloadInvoicePDF(invoice);
  };

  // Fonction pour prévisualiser la facture
  const handlePreview = (invoice) => {
    previewInvoicePDF(invoice);
  };

  // Badges de statut
  const getStatusBadge = (status) => {
    const badges = {
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
      issued: { label: 'Émise', color: 'bg-blue-100 text-blue-800' },
      sent: { label: 'Envoyée', color: 'bg-purple-100 text-purple-800' },
      paid: { label: 'Payée', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
      credited: { label: 'Avoir émis', color: 'bg-orange-100 text-orange-800' }
    };
    
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  // Badges de paiement
  const getPaymentBadge = (paymentStatus) => {
    const badges = {
      paid: { label: 'Payé', icon: CheckCircle, color: 'text-green-600' },
      pending: { label: 'En attente', icon: Clock, color: 'text-yellow-600' },
      partial: { label: 'Partiel', icon: Clock, color: 'text-orange-600' },
      cancelled: { label: 'Annulé', icon: XCircle, color: 'text-red-600' }
    };
    
    const badge = badges[paymentStatus] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <div className={`flex items-center gap-1 ${badge.color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm">{badge.label}</span>
      </div>
    );
  };

  if (!invoices || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Mes Factures
        </h2>
        <p className="text-muted-foreground mt-2">
          Gérez vos factures conformes aux normes françaises
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Factures</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures Payées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total HT</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenueHT.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground mt-1">
              TTC: {stats.totalRevenueTTC.toFixed(2)} €
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher et filtrer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro, commande ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre par statut */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="issued">Émise</option>
                <option value="sent">Envoyée</option>
                <option value="paid">Payée</option>
                <option value="cancelled">Annulée</option>
                <option value="credited">Avoir émis</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des factures */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
          <CardDescription>
            {filteredInvoices?.length || 0} facture(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvoices && filteredInvoices.length > 0 ? (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Informations principales */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Commande: {invoice.orderNumber}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Client: </span>
                          <span className="font-medium">
                            {invoice.buyer.firstName} {invoice.buyer.lastName}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Montant: </span>
                          <span className="font-bold text-primary">
                            {invoice.totalTTC.toFixed(2)} € TTC
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(invoice.status)}
                        {getPaymentBadge(invoice.paymentStatus)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(invoice)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownload(invoice)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Aucune facture ne correspond à vos critères'
                  : 'Aucune facture pour le moment'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesModule;
