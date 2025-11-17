"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle2 } from "lucide-react"
import { getUser, setUser } from "@/lib/auth"
import { apiClient } from "@/lib/api"
import { Notification } from "@/components/ui/notification"

// Use a native <img> here to keep the component simple and avoid next/image typing quirks
export default function NewsletterInline() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [checkingSubscription, setCheckingSubscription] = useState(true)
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: "success" | "error" }>(
    {
      show: false,
      message: "",
      type: "success",
    }
  )

  useEffect(() => {
    const user = getUser()
    if (user?.email) {
      setEmail(user.email)
      setIsSubscribed(user.est_abonne_newsletter === true)
    }
    setCheckingSubscription(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setNotification({ show: true, message: "Veuillez entrer votre email", type: "error" })
      return
    }

    setLoading(true)
    try {
      const data = await apiClient.post('/api/newsletter', { email, source: "Page d'atterrissage" })

      if ((data as any)?.success) {
        setIsSubscribed(true)
        const user = getUser()
        if (user) setUser({ ...user, est_abonne_newsletter: true })

        setNotification({ show: true, message: "Inscription réussie !", type: "success" })
      } else {
        setNotification({ show: true, message: (data as any)?.message || "Erreur lors de l'inscription", type: "error" })
      }
    } catch (error) {
      console.error('NewsletterInline error:', error)
      setNotification({ show: true, message: "Erreur de connexion au serveur", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-12 w-full max-w-6xl">
      <div className="rounded-2xl border p-6 bg-white shadow-md max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left: image */}
          <div className="w-full md:w-1/3 flex justify-start">
            <div className="w-36 h-36 md:w-56 md:h-56">
              <img src="/person45.png" alt="Person" className="object-contain w-full h-full" />
            </div>
          </div>

          {/* Right: content aligned to the right */}
          <div className="w-full md:w-2/3 text-right">
            <h4 className="text-xl font-semibold">Rejoignez Nous</h4>
            <p className="text-sm text-muted-foreground">
              Inscrivez-vous à la newsletter pour recevoir nos drops exclusifs, offres limitées et les dernières
              actualités d'Arseet.
            </p>

            {checkingSubscription ? null : isSubscribed ? (
              <div className="mt-4 flex items-center justify-end gap-3">
                <CheckCircle2 className="text-green-600" />
                <p className="text-sm">Vous êtes inscrit·e — {email}</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="mt-4 flex justify-end gap-3">
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="rounded-xl w-full md:max-w-sm text-right"
                  />
                  <Button type="submit" disabled={loading} className="rounded-xl">
                    {loading ? '...' : "S'inscrire"}
                  </Button>
                </form>

                {/* Details under the mail textbox (same as newsletter page) */}
                <div className="mt-4 rounded-xl bg-muted p-4 text-left">
                  <h4 className="mb-2 font-semibold">Ce que vous recevrez :</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✓ Accès anticipé aux nouveaux drops</li>
                    <li>✓ Offres exclusives réservées aux abonnés</li>
                    <li>✓ Actualités de la marque et collaborations</li>
                    <li>✓ Conseils de style et lookbooks</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {/* Video removed from newsletter component; landing page will host the video */}
    </section>
  )
}
