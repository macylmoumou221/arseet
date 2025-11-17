"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail } from "lucide-react"
import { getUser, setUser } from "@/lib/auth"
import { apiClient } from "@/lib/api"
import { Notification } from "@/components/ui/notification"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [source, setSource] = useState("footer")
  const [customSource, setCustomSource] = useState("")
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
    console.log('Footer Newsletter - User from localStorage:', user)
    
    if (user?.email) {
      setEmail(user.email)
      // Utiliser le champ est_abonne_newsletter du profil
      const abonne = user.est_abonne_newsletter === true
      console.log('Footer Newsletter - est_abonne_newsletter:', user.est_abonne_newsletter, '-> isSubscribed:', abonne)
      setIsSubscribed(abonne)
      setCheckingSubscription(false)
    } else {
      console.log('Footer Newsletter - No user found')
      setCheckingSubscription(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const finalSource = source === "Autre" ? customSource : source

      // POST /api/newsletter via apiClient
      const data = await apiClient.post('/api/newsletter', { email, source: finalSource })

  if ((data as any)?.success) {
        setIsSubscribed(true)
        
        // Mettre à jour le profil utilisateur en localStorage
        const user = getUser()
        if (user) {
          setUser({ ...user, est_abonne_newsletter: true })
        }
        
        setNotification({
          show: true,
          message: "✓ Inscription réussie !",
          type: "success"
        })
        setSource("footer")
        setCustomSource("")
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
      // DELETE /api/newsletter/{email}
      const data = await apiClient.delete(`/api/newsletter/${encodeURIComponent(email)}`)

  if ((data as any)?.success) {
        setIsSubscribed(false)
        
        // Mettre à jour le profil utilisateur en localStorage
        const user = getUser()
        if (user) {
          setUser({ ...user, est_abonne_newsletter: false })
        }
        
        setNotification({
          show: true,
          message: "✓ Désabonnement réussi !",
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

  return (
    <>
      <section className="bg-black text-white py-20 animate-fade-in">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Newsletter Arseet</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Restez informé des nouveaux drops et collections exclusives
          </p>

          {checkingSubscription ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : isSubscribed ? (
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-white text-lg">✓ Vous êtes inscrit à la newsletter</p>
              <p className="text-gray-400 text-sm">Email: {email}</p>
              <Button
                onClick={handleUnsubscribe}
                disabled={loading}
                variant="outline"
                className="rounded-xl bg-transparent border-white text-white hover:bg-white hover:text-black"
              >
                {loading ? "..." : "Se désabonner"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl"
                    required
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-white text-black hover:bg-gray-200 transition-all hover:scale-105"
                >
                  {loading ? "..." : "S'inscrire"}
                </Button>
              </div>

              <div className="space-y-2">
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                    <SelectValue placeholder="Comment nous avez-vous découvert ?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="footer">Bas de page (Footer)</SelectItem>
                    <SelectItem value="homepage">Page d'accueil du site</SelectItem>
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
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl"
                  />
                )}
              </div>
            </form>
          )}
        </div>
      </section>

      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </>
  )
}
