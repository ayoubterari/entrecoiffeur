import React, { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Download, Printer, X } from 'lucide-react'

const CouponQRCode = ({ coupon, isOpen, onClose }) => {
  const qrRef = useRef(null)

  // Générer les données du QR code (JSON avec toutes les infos du coupon)
  const qrData = JSON.stringify({
    code: coupon.code,
    type: 'coupon',
    sellerId: coupon.sellerId,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  })

  // Télécharger le QR code en PNG
  const handleDownloadPNG = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `coupon-${coupon.code}.png`
    link.href = url
    link.click()
  }

  // Télécharger le QR code avec design complet (carte)
  const handleDownloadCard = () => {
    // Créer un canvas plus grand pour la carte complète
    const cardCanvas = document.createElement('canvas')
    const ctx = cardCanvas.getContext('2d')
    
    // Dimensions de la carte
    cardCanvas.width = 800
    cardCanvas.height = 1000
    
    // Fond blanc
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height)
    
    // Bordure
    ctx.strokeStyle = '#C0B4A5'
    ctx.lineWidth = 4
    ctx.strokeRect(20, 20, cardCanvas.width - 40, cardCanvas.height - 40)
    
    // Titre
    ctx.fillStyle = '#2d2d2d'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('COUPON DE RÉDUCTION', cardCanvas.width / 2, 100)
    
    // Code du coupon
    ctx.fillStyle = '#C0B4A5'
    ctx.font = 'bold 64px Arial'
    ctx.fillText(coupon.code, cardCanvas.width / 2, 180)
    
    // Valeur de la réduction
    ctx.fillStyle = '#2d2d2d'
    ctx.font = 'bold 56px Arial'
    const discountText = coupon.discountType === 'percentage' 
      ? `${coupon.discountValue}% DE RÉDUCTION`
      : `${coupon.discountValue} DH DE RÉDUCTION`
    ctx.fillText(discountText, cardCanvas.width / 2, 260)
    
    // Description si disponible
    if (coupon.description) {
      ctx.font = '28px Arial'
      ctx.fillStyle = '#666666'
      const words = coupon.description.split(' ')
      let line = ''
      let y = 320
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > 700 && i > 0) {
          ctx.fillText(line, cardCanvas.width / 2, y)
          line = words[i] + ' '
          y += 35
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, cardCanvas.width / 2, y)
    }
    
    // QR Code
    const qrCanvas = qrRef.current?.querySelector('canvas')
    if (qrCanvas) {
      const qrSize = 400
      const qrX = (cardCanvas.width - qrSize) / 2
      const qrY = 400
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize)
    }
    
    // Instructions
    ctx.font = '24px Arial'
    ctx.fillStyle = '#666666'
    ctx.fillText('Scannez ce QR code pour appliquer le coupon', cardCanvas.width / 2, 850)
    
    // Période de validité
    ctx.font = '20px Arial'
    const validFrom = new Date(coupon.validFrom).toLocaleDateString('fr-FR')
    const validUntil = coupon.validUntil 
      ? new Date(coupon.validUntil).toLocaleDateString('fr-FR')
      : 'Pas de limite'
    ctx.fillText(`Valide du ${validFrom} au ${validUntil}`, cardCanvas.width / 2, 920)
    
    // Logo/Nom du vendeur
    ctx.font = 'bold 28px Arial'
    ctx.fillStyle = '#C0B4A5'
    ctx.fillText('EntreCoiffeur', cardCanvas.width / 2, 970)
    
    // Télécharger
    const url = cardCanvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `coupon-card-${coupon.code}.png`
    link.href = url
    link.click()
  }

  // Imprimer le QR code
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const canvas = qrRef.current?.querySelector('canvas')
    
    if (!canvas || !printWindow) return
    
    const dataUrl = canvas.toDataURL('image/png')
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Coupon ${coupon.code}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px;
            }
            .coupon-card {
              border: 4px solid #C0B4A5;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
            }
            h1 {
              color: #2d2d2d;
              margin-bottom: 10px;
            }
            .code {
              color: #C0B4A5;
              font-size: 48px;
              font-weight: bold;
              margin: 20px 0;
            }
            .discount {
              color: #2d2d2d;
              font-size: 36px;
              font-weight: bold;
              margin: 20px 0;
            }
            .description {
              color: #666;
              font-size: 18px;
              margin: 20px 0;
            }
            .qr-code {
              margin: 30px 0;
            }
            .instructions {
              color: #666;
              font-size: 16px;
              margin: 20px 0;
            }
            .validity {
              color: #666;
              font-size: 14px;
              margin: 10px 0;
            }
            .footer {
              color: #C0B4A5;
              font-size: 20px;
              font-weight: bold;
              margin-top: 30px;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="coupon-card">
            <h1>COUPON DE RÉDUCTION</h1>
            <div class="code">${coupon.code}</div>
            <div class="discount">
              ${coupon.discountType === 'percentage' 
                ? `${coupon.discountValue}% DE RÉDUCTION`
                : `${coupon.discountValue} DH DE RÉDUCTION`
              }
            </div>
            ${coupon.description ? `<div class="description">${coupon.description}</div>` : ''}
            <div class="qr-code">
              <img src="${dataUrl}" alt="QR Code" style="width: 300px; height: 300px;" />
            </div>
            <div class="instructions">
              Scannez ce QR code pour appliquer le coupon
            </div>
            <div class="validity">
              Valide du ${new Date(coupon.validFrom).toLocaleDateString('fr-FR')} 
              au ${coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString('fr-FR') : 'Pas de limite'}
            </div>
            <div class="footer">EntreCoiffeur</div>
          </div>
          <div class="no-print" style="margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
              Imprimer
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">
              Fermer
            </button>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>QR Code du coupon</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Téléchargez ou imprimez le QR code pour utiliser ce coupon en magasin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aperçu du coupon */}
          <div className="border-4 border-primary rounded-lg p-8 text-center bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              COUPON DE RÉDUCTION
            </h2>
            <div className="text-4xl font-bold text-primary my-4">
              {coupon.code}
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-4">
              {coupon.discountType === 'percentage' 
                ? `${coupon.discountValue}% DE RÉDUCTION`
                : `${coupon.discountValue} DH DE RÉDUCTION`
              }
            </div>
            {coupon.description && (
              <p className="text-gray-600 mb-6">{coupon.description}</p>
            )}
            
            {/* QR Code */}
            <div ref={qrRef} className="flex justify-center my-6">
              <QRCodeCanvas
                value={qrData}
                size={300}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/logo.png",
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            
            <p className="text-gray-600 text-sm mb-2">
              Scannez ce QR code pour appliquer le coupon
            </p>
            <p className="text-gray-500 text-xs">
              Valide du {formatDate(coupon.validFrom)} 
              {coupon.validUntil ? ` au ${formatDate(coupon.validUntil)}` : ' (pas de limite)'}
            </p>
            <p className="text-primary font-bold mt-4">EntreCoiffeur</p>
          </div>

          {/* Boutons d'action */}
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={handleDownloadPNG}
              className="w-full"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              QR Code seul
            </Button>
            
            <Button
              onClick={handleDownloadCard}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Carte complète
            </Button>
            
            <Button
              onClick={handlePrint}
              className="w-full"
              variant="outline"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </div>

          {/* Informations supplémentaires */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p className="font-semibold mb-2">💡 Conseils d'utilisation :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Imprimez la carte complète pour l'afficher en magasin</li>
              <li>Téléchargez le QR code seul pour l'intégrer à vos supports</li>
              <li>Le QR code contient toutes les informations du coupon</li>
              <li>Les clients peuvent scanner le code avec leur smartphone</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CouponQRCode
