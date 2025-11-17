"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, CheckCircle2 } from "lucide-react"
import Image from "next/image"
// Backup of the previous animated cards has been moved to components/newsletter-cards-backup.tsx
import { getUser, setUser, getAuthToken } from "@/lib/auth"
import { apiClient } from "@/lib/api"
import { Notification } from "@/components/ui/notification"

export default function NewsletterPage() {
  const [email, setEmail] = useState("")
  const [source, setSource] = useState("homepage")
  const [customSource, setCustomSource] = useState("")
  const [inscrit, setInscrit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [checkingSubscription, setCheckingSubscription] = useState(true)
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  })

  useEffect(() => {
    const user = getUser()
    console.log('Newsletter - User from localStorage:', user)
    
    if (user?.email) {
      setEmail(user.email)
      // IMPORTANT: Vérifier strictement si === true
      const abonne = user.est_abonne_newsletter === true
      console.log('Newsletter - est_abonne_newsletter:', user.est_abonne_newsletter, 'type:', typeof user.est_abonne_newsletter, '-> isSubscribed:', abonne)
      setIsSubscribed(abonne)
      setCheckingSubscription(false)
    } else {
      console.log('Newsletter - No user found, allowing anonymous subscription')
      setCheckingSubscription(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const finalSource = source === "Autre" ? customSource : source

      console.log('Subscribing with email:', email, 'source:', finalSource)

      // POST /api/newsletter via apiClient
      const data = await apiClient.post('/api/newsletter', { email, source: finalSource })
      console.log('Subscribe response:', data)

      if ((data as any)?.success) {
        setInscrit(true)
        setIsSubscribed(true)
        
        // Mettre à jour le profil utilisateur en localStorage
        const user = getUser()
        console.log('Current user before update:', user)
        if (user) {
          const updatedUser = { ...user, est_abonne_newsletter: true }
          console.log('Updating user with:', updatedUser)
          setUser(updatedUser)
        }
        
        setNotification({
          show: true,
          message: "Inscription réussie ! Vous recevrez bientôt nos actualités.",
          type: "success"
        })
        setTimeout(() => {
          setSource("homepage")
          setCustomSource("")
          setInscrit(false)
        }, 5000)
      } else {
        setNotification({
          show: true,
          message: (data as any)?.message || "Erreur lors de l'inscription",
          type: "error"
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setNotification({
        show: true,
        message: "Erreur de connexion au serveur",
        type: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!email) {
      setNotification({
        show: true,
        message: "Veuillez entrer votre email",
        type: "error"
      })
      return
    }

    setLoading(true)

    try {
      console.log('Unsubscribing email:', email)

      // DELETE /api/newsletter/{email}
      const data = await apiClient.delete(`/api/newsletter/${encodeURIComponent(email)}`)
      console.log('Unsubscribe response:', data)

      if ((data as any)?.success) {
        setIsSubscribed(false)
        
        // Mettre à jour le profil utilisateur en localStorage
        const user = getUser()
        console.log('Current user before unsubscribe update:', user)
        if (user) {
          const updatedUser = { ...user, est_abonne_newsletter: false }
          console.log('Updating user with:', updatedUser)
          setUser(updatedUser)
        }
        
        setNotification({
          show: true,
          message: "Désabonnement réussi !",
          type: "success"
        })
      } else {
        setNotification({
          show: true,
          message: (data as any)?.message || "Erreur lors du désabonnement",
          type: "error"
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setNotification({
        show: true,
        message: "Erreur de connexion au serveur",
        type: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  const images = [
    '/picture1.JPG',
    '/picture2.png',
    '/picture3.JPG',
    '/picture4.JPG',
  ]

  return (
    <main className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 animate-fade-in text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight">Newsletter</h1>
            <p className="text-xl text-muted-foreground">
              Inscrivez-vous pour être informé en avant-première de nos nouveaux drops et collections exclusives.
            </p>
          </div>

          <Card className="animate-slide-in rounded-2xl shadow-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Newsletter Arseet</CardTitle>
              <CardDescription>
                Recevez les dernières nouvelles, drops exclusifs et offres spéciales directement dans votre boîte mail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkingSubscription ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : isSubscribed ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                    <CheckCircle2 className="mb-4 h-16 w-16 text-black" />
                    <h3 className="mb-2 text-2xl font-semibold">Vous êtes inscrit à la newsletter</h3>
                    <p className="text-muted-foreground mb-4">
                      Vous recevez déjà nos dernières actualités et drops exclusifs.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Email: <span className="font-semibold">{email}</span>
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleUnsubscribe}
                    disabled={loading}
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    {loading ? "Désabonnement en cours..." : "Se désabonner"}
                  </Button>
                </div>
              ) : inscrit ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                  <CheckCircle2 className="mb-4 h-16 w-16 text-black" />
                  <h3 className="mb-2 text-2xl font-semibold">Merci de votre inscription !</h3>
                  <p className="text-muted-foreground">
                    Vous recevrez bientôt nos dernières actualités et drops exclusifs.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source">Comment avez-vous découvert notre newsletter ?</Label>
                    <Select value={source} onValueChange={setSource}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Choisir une réponse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homepage">Page d'accueil du site</SelectItem>
                        <SelectItem value="footer">Bas de page (Footer)</SelectItem>
                        <SelectItem value="newsletter-page">Page Newsletter</SelectItem>
                        <SelectItem value="popup">Pop-up sur le site</SelectItem>
                        <SelectItem value="reseaux-sociaux">Réseaux sociaux</SelectItem>
                        <SelectItem value="bouche-a-oreille">Bouche à oreille</SelectItem>
                        <SelectItem value="publicite">Publicité</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    {source === "Autre" && (
                      <Input
                        type="text"
                        placeholder="Précisez comment vous nous avez découvert"
                        value={customSource}
                        onChange={(e) => setCustomSource(e.target.value)}
                        required
                        className="mt-2 rounded-xl"
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl bg-muted p-4">
                      <h4 className="mb-2 font-semibold">Ce que vous recevrez :</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>✓ Accès anticipé aux nouveaux drops</li>
                        <li>✓ Offres exclusives réservées aux abonnés</li>
                        <li>✓ Actualités de la marque et collaborations</li>
                        <li>✓ Conseils de style et lookbooks</li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="w-full rounded-xl text-lg transition-all hover:scale-105"
                    >
                      {loading ? "Inscription en cours..." : "S'inscrire à la Newsletter"}
                    </Button>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    En vous inscrivant, vous acceptez de recevoir nos emails marketing. Vous pouvez vous désabonner à
                    tout moment.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </main>
  )
}
