"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Notification } from "@/components/ui/notification"
import { ShoppingBag, User, Mail, Phone, MapPin, Loader2, Home, Building, Settings, Lock } from "lucide-react"
import { authAPI, isAuthenticated, getUser, isAdmin } from "@/lib/auth"

export function EspaceCompte() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  
  // Profile data
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [telephone, setTelephone] = useState("")
  const [adresse, setAdresse] = useState("")
  const [ville, setVille] = useState("")
  const [codePostal, setCodePostal] = useState("")
  
  // Password refs (uncontrolled to prevent DevTools exposure)
  const ancienMotDePasseRef = useRef<HTMLInputElement>(null)
  const nouveauMotDePasseRef = useRef<HTMLInputElement>(null)
  const confirmerMotDePasseRef = useRef<HTMLInputElement>(null)
  
  // Notification states
  const [showNotification, setShowNotification] = useState(false)
  const [notifType, setNotifType] = useState<"success" | "error" | "info" | "warning">("success")
  const [notifMessage, setNotifMessage] = useState("")

  const showNotif = (type: "success" | "error" | "info" | "warning", message: string) => {
    setNotifType(type)
    setNotifMessage(message)
    setShowNotification(false)
    setTimeout(() => setShowNotification(true), 10)
  }

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/connexion")
      return
    }

    setUserIsAdmin(isAdmin())

    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile()
        if (response.success && response.data) {
          const userData = response.data.user || response.data
          setNom(userData.nom || "")
          setPrenom(userData.prenom || "")
          setEmail(userData.email || "")
          setTelephone(userData.telephone || "")
          setAdresse(userData.adresse || "")
          setVille(userData.ville || "")
          setCodePostal(userData.code_postal || "")
        } else {
          showNotif("error", "Erreur lors du chargement du profil")
        }
      } catch (error) {
        showNotif("error", "Erreur de connexion au serveur")
      } finally {
        setFetchingProfile(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSauvegarder = async () => {
    setLoading(true)
    
    try {
      const updateData: any = {}
      if (nom) updateData.nom = nom
      if (prenom) updateData.prenom = prenom
      if (telephone) updateData.telephone = telephone
      if (adresse) updateData.adresse = adresse
      if (ville) updateData.ville = ville
      if (codePostal) updateData.code_postal = codePostal

      const response = await authAPI.updateProfile(updateData)
      
      if (response.success) {
        showNotif("success", response.message || "Profil mis à jour avec succès!")
      } else {
        showNotif("error", response.message || "Erreur lors de la mise à jour")
      }
    } catch (error: any) {
      showNotif("error", error?.message || "Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    const ancienMotDePasse = ancienMotDePasseRef.current?.value || ""
    const nouveauMotDePasse = nouveauMotDePasseRef.current?.value || ""
    const confirmerMotDePasse = confirmerMotDePasseRef.current?.value || ""
    
    if (!ancienMotDePasse || !nouveauMotDePasse || !confirmerMotDePasse) {
      showNotif("error", "Veuillez remplir tous les champs")
      return
    }

    if (nouveauMotDePasse !== confirmerMotDePasse) {
      showNotif("error", "Les nouveaux mots de passe ne correspondent pas")
      return
    }

    if (nouveauMotDePasse.length < 6) {
      showNotif("error", "Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setLoading(true)
    
    try {
      const response = await authAPI.changePassword(ancienMotDePasse, nouveauMotDePasse)
      
      if (response.success) {
        showNotif("success", response.message || "Mot de passe modifié avec succès!")
        if (ancienMotDePasseRef.current) ancienMotDePasseRef.current.value = ""
        if (nouveauMotDePasseRef.current) nouveauMotDePasseRef.current.value = ""
        if (confirmerMotDePasseRef.current) confirmerMotDePasseRef.current.value = ""
      } else {
        showNotif("error", response.message || "Erreur lors du changement de mot de passe")
      }
    } catch (error: any) {
      showNotif("error", error?.message || "Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Notification
        show={showNotification}
        type={notifType}
        message={notifMessage}
        duration={5000}
        onClose={() => setShowNotification(false)}
      />
      
      <div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Mon Compte</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <Tabs defaultValue="profil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profil">
            <User className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="mr-2 h-4 w-4" />
            Mot de passe
          </TabsTrigger>
        </TabsList>

        {/* Profil Tab */}
        <TabsContent value="profil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="nom" 
                      value={nom} 
                      onChange={(e) => setNom(e.target.value)} 
                      className="pl-10" 
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="prenom" 
                      value={prenom} 
                      onChange={(e) => setPrenom(e.target.value)} 
                      className="pl-10" 
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="pl-10 bg-muted"
                    title="L'email ne peut pas être modifié"
                  />
                </div>
                <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telephone"
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="pl-10"
                    placeholder="0555123456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="adresse" 
                    value={adresse} 
                    onChange={(e) => setAdresse(e.target.value)} 
                    className="pl-10" 
                    placeholder="Rue, numéro, bâtiment..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="ville" 
                      value={ville} 
                      onChange={(e) => setVille(e.target.value)} 
                      className="pl-10" 
                      placeholder="Alger, Oran..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codePostal">Code Postal</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="codePostal" 
                      value={codePostal} 
                      onChange={(e) => setCodePostal(e.target.value)} 
                      className="pl-10" 
                      placeholder="16000"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSauvegarder} 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Sauvegarder les modifications"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Change Tab - for all users */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>Modifiez votre mot de passe de connexion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ancien-password">Ancien mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={ancienMotDePasseRef}
                    id="ancien-password"
                    type="password"
                    className="pl-10"
                    placeholder="Entrez votre ancien mot de passe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nouveau-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={nouveauMotDePasseRef}
                    id="nouveau-password"
                    type="password"
                    className="pl-10"
                    placeholder="Minimum 6 caractères"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmer-password">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={confirmerMotDePasseRef}
                    id="confirmer-password"
                    type="password"
                    className="pl-10"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </div>
              </div>

              <Button 
                onClick={handleChangePassword} 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification en cours...
                  </>
                ) : (
                  "Changer le mot de passe"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
