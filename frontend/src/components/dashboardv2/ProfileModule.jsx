import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Camera, Save, X, MapPin } from 'lucide-react'
import { frenchCities } from '../../data/frenchCities'

const ProfileModule = ({ userId, userEmail, userFirstName, userLastName, userType, companyName }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: userFirstName || '',
    lastName: userLastName || '',
    phone: '',
    address: '',
    city: '',
    companyName: companyName || '',
    siret: '',
    tvaNumber: '',
    rib: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  // Get user data
  const userData = useQuery(api.auth.getUserById, userId ? { userId } : "skip")
  
  // Get avatar URL
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    userData?.avatar ? { storageId: userData.avatar } : "skip"
  )
  
  // Mutations
  const updateProfile = useMutation(api.auth.updateOwnProfile)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  // Update form when user data loads
  useEffect(() => {
    if (userData) {
      setProfileForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        companyName: userData.companyName || '',
        siret: userData.siret || '',
        tvaNumber: userData.tvaNumber || '',
        rib: userData.rib || ''
      })
    }
  }, [userData])

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId) return

    try {
      let avatarStorageId = undefined

      // Upload avatar if changed
      if (avatarFile) {
        const uploadUrl = await generateUploadUrl()
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": avatarFile.type },
          body: avatarFile,
        })
        const { storageId } = await result.json()
        avatarStorageId = storageId
      }

      // Update profile
      await updateProfile({
        userId,
        ...profileForm,
        ...(avatarStorageId && { avatar: avatarStorageId })
      })

      setIsEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
      alert('Profil mis à jour avec succès !')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      alert('Erreur lors de la mise à jour du profil')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setAvatarFile(null)
    setAvatarPreview(null)
    // Reset form to original values
    if (userData) {
      setProfileForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        companyName: userData.companyName || '',
        siret: userData.siret || '',
        tvaNumber: userData.tvaNumber || '',
        rib: userData.rib || ''
      })
    }
  }

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview
    if (avatarUrl) return avatarUrl
    return null
  }

  const getInitials = () => {
    const first = profileForm.firstName?.charAt(0) || userFirstName?.charAt(0) || ''
    const last = profileForm.lastName?.charAt(0) || userLastName?.charAt(0) || ''
    return (first + last).toUpperCase() || '?'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Profil</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez vos informations personnelles
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Modifier le profil
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du Profil</CardTitle>
          <CardDescription>
            {isEditing ? 'Modifiez vos informations personnelles' : 'Vos informations personnelles'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={getAvatarUrl()} alt="Photo de profil" />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                      <Camera className="h-4 w-4" />
                      <span className="text-sm">Changer la photo</span>
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  {avatarFile && (
                    <span className="text-sm text-muted-foreground">{avatarFile.name}</span>
                  )}
                </div>
              )}
            </div>

            {/* Personal Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userEmail || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                disabled={!isEditing}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={profileForm.address}
                onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                disabled={!isEditing}
                placeholder="123 Rue de la Paix, 75001 Paris"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                <MapPin className="inline h-4 w-4 mr-1" />
                Ville
              </Label>
              {isEditing ? (
                <select
                  id="city"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Sélectionnez votre ville</option>
                  {frenchCities.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="city"
                  value={profileForm.city || 'Non renseignée'}
                  disabled
                  className="bg-muted"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">Type de compte</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="userType"
                  value={
                    userType === 'particulier' ? '👤 Particulier' :
                    userType === 'professionnel' ? '💼 Professionnel' :
                    userType === 'grossiste' ? '🏢 Grossiste' : 'Non défini'
                  }
                  disabled
                  className="bg-muted"
                />
                <Badge variant="secondary">Non modifiable</Badge>
              </div>
            </div>

            {/* Company Info (for pro/grossiste) */}
            {(userType === 'professionnel' || userType === 'grossiste') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={profileForm.companyName}
                    onChange={(e) => setProfileForm({...profileForm, companyName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input
                      id="siret"
                      value={profileForm.siret}
                      onChange={(e) => setProfileForm({...profileForm, siret: e.target.value})}
                      disabled={!isEditing}
                      placeholder="123 456 789 00010"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tvaNumber">Numéro de TVA</Label>
                    <Input
                      id="tvaNumber"
                      value={profileForm.tvaNumber}
                      onChange={(e) => setProfileForm({...profileForm, tvaNumber: e.target.value})}
                      disabled={!isEditing}
                      placeholder="FR 12 345678901"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rib">RIB (Relevé d'Identité Bancaire)</Label>
                  <Input
                    id="rib"
                    value={profileForm.rib}
                    onChange={(e) => setProfileForm({...profileForm, rib: e.target.value})}
                    disabled={!isEditing}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                    maxLength={27}
                  />
                  <p className="text-xs text-muted-foreground">Format IBAN : 27 caractères</p>
                </div>
              </>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileModule
