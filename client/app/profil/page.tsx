"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle, Save } from "lucide-react"

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nom: "Jean Dupont",
    email: "jean.dupont@example.com",
    adresse: "123 Rue de la République, Alger",
    telephone: "+213 555 123 456",
  })

  const [editData, setEditData] = useState(formData)

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(formData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(formData)
  }

  const handleSave = () => {
    // Here you would make an API call to update the profile
    setFormData(editData)
    setIsEditing(false)
    // TODO: API call to save profile
  }

  const handleChange = (field: string, value: string) => {
    setEditData({ ...editData, [field]: value })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez vos informations personnelles
          </p>
        </div>

        <Card>
          <CardHeader className="border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
                  <UserCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle>Informations Personnelles</CardTitle>
                  <CardDescription>
                    Mettez à jour vos informations de compte
                  </CardDescription>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={handleEdit} className="bg-black hover:bg-gray-800">
                  Modifier
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom Complet</Label>
                {isEditing ? (
                  <Input
                    id="nom"
                    type="text"
                    value={editData.nom}
                    onChange={(e) => handleChange("nom", e.target.value)}
                    className="border-gray-300 focus:border-black focus:ring-black"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                    {formData.nom}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="px-3 py-2 bg-gray-100 rounded-md border border-gray-200 text-gray-500">
                  {formData.email}
                  <span className="text-xs ml-2">(non modifiable)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                {isEditing ? (
                  <Input
                    id="adresse"
                    type="text"
                    value={editData.adresse}
                    onChange={(e) => handleChange("adresse", e.target.value)}
                    className="border-gray-300 focus:border-black focus:ring-black"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                    {formData.adresse}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Numéro de Téléphone</Label>
                {isEditing ? (
                  <Input
                    id="telephone"
                    type="tel"
                    value={editData.telephone}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    className="border-gray-300 focus:border-black focus:ring-black"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                    {formData.telephone}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 bg-black hover:bg-gray-800"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les modifications
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="mt-6">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Gérez les paramètres de sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Mot de passe</h3>
                  <p className="text-sm text-gray-600">
                    Dernière modification il y a 30 jours
                  </p>
                </div>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                  Changer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
