import React from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'

// Composant CouponForm
export const CouponForm = ({ formData, setFormData, onSubmit, isLoading, products, categories, isEdit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informations de base</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code du coupon *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="EX: SUMMER20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountType">Type de réduction *</Label>
            <select
              id="discountType"
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="percentage">Pourcentage (%)</option>
              <option value="fixed">Montant fixe (DH)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discountValue">
              Valeur de la réduction * {formData.discountType === 'percentage' ? '(%)' : '(DH)'}
            </Label>
            <Input
              id="discountValue"
              type="number"
              step="0.01"
              min="0"
              max={formData.discountType === 'percentage' ? '100' : undefined}
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              required
            />
          </div>

          {formData.discountType === 'percentage' && (
            <div className="space-y-2">
              <Label htmlFor="maximumDiscount">Réduction maximale (DH)</Label>
              <Input
                id="maximumDiscount"
                type="number"
                step="0.01"
                min="0"
                value={formData.maximumDiscount}
                onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })}
                placeholder="Optionnel"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description du coupon"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Coupon actif</Label>
        </div>
      </div>

      {/* Période de validité */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Période de validité</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="validFrom">Date de début *</Label>
            <Input
              id="validFrom"
              type="datetime-local"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">Date de fin</Label>
            <Input
              id="validUntil"
              type="datetime-local"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              placeholder="Optionnel"
            />
          </div>
        </div>
      </div>

      {/* Limitations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Limitations d'utilisation</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="usageLimit">Limite globale</Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              placeholder="Illimité"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageLimitPerUser">Limite par utilisateur</Label>
            <Input
              id="usageLimitPerUser"
              type="number"
              min="1"
              value={formData.usageLimitPerUser}
              onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
              placeholder="Illimité"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimumAmount">Montant minimum de commande (DH)</Label>
          <Input
            id="minimumAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.minimumAmount}
            onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value })}
            placeholder="Aucun minimum"
          />
        </div>
      </div>

      {/* Restrictions produits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Restrictions de produits</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="applicableToAllProducts"
            checked={formData.applicableToAllProducts}
            onCheckedChange={(checked) => setFormData({ ...formData, applicableToAllProducts: checked })}
          />
          <Label htmlFor="applicableToAllProducts">S'applique à tous les produits</Label>
        </div>

        {!formData.applicableToAllProducts && (
          <div className="space-y-4 pl-6">
            <div className="space-y-2">
              <Label>Produits spécifiques</Label>
              <select
                multiple
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                value={formData.specificProductIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  setFormData({ ...formData, specificProductIds: selected })
                }}
              >
                {products?.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Maintenez Ctrl/Cmd pour sélectionner plusieurs produits
              </p>
            </div>

            <div className="space-y-2">
              <Label>Catégories spécifiques</Label>
              <select
                multiple
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                value={formData.specificCategoryIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  setFormData({ ...formData, specificCategoryIds: selected })
                }}
              >
                {categories?.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Maintenez Ctrl/Cmd pour sélectionner plusieurs catégories
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Restrictions utilisateurs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Restrictions d'utilisateurs</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="applicableToAllUsers"
            checked={formData.applicableToAllUsers}
            onCheckedChange={(checked) => setFormData({ ...formData, applicableToAllUsers: checked })}
          />
          <Label htmlFor="applicableToAllUsers">S'applique à tous les utilisateurs</Label>
        </div>

        {!formData.applicableToAllUsers && (
          <div className="space-y-2 pl-6">
            <Label>Types d'utilisateurs autorisés</Label>
            <div className="space-y-2">
              {['particulier', 'professionnel', 'grossiste'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`userType-${type}`}
                    checked={formData.specificUserTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          specificUserTypes: [...formData.specificUserTypes, type]
                        })
                      } else {
                        setFormData({
                          ...formData,
                          specificUserTypes: formData.specificUserTypes.filter(t => t !== type)
                        })
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`userType-${type}`} className="capitalize">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer le coupon')}
        </Button>
      </div>
    </form>
  )
}
