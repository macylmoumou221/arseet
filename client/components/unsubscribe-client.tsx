"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Notification } from "@/components/ui/notification"

interface Props {
  email: string | null
}

export default function UnsubscribeClient({ email }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  })

  const handleUnsubscribe = async () => {
    if (!email) {
      setNotification({ show: true, message: "Email manquant dans l'URL", type: "error" })
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/newsletter/${encodeURIComponent(email)}`, { method: "DELETE" })
      const data = await res.json().catch(() => null)

      if (res.ok && data?.success) {
        setSuccess(true)
        setNotification({ show: true, message: "Désabonnement réussi !", type: "success" })
      } else {
        const msg = (data && data.message) || "Erreur lors du désabonnement"
        setError(msg)
        setNotification({ show: true, message: msg, type: "error" })
      }
    } catch (e) {
      console.error(e)
      const msg = "Erreur de connexion au serveur"
      setError(msg)
      setNotification({ show: true, message: msg, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <main className="min-h-screen bg-background flex items-center justify-center py-20 px-4">
        <Card className="max-w-md w-full rounded-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Désabonnement Newsletter</CardTitle>
            <CardDescription>{email ? `Email: ${email}` : "Aucun email fourni"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!email ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <XCircle className="mb-4 h-16 w-16 text-red-500" />
                <h3 className="mb-2 text-xl font-semibold">Email manquant</h3>
                <p className="text-muted-foreground">Veuillez utiliser le lien de désabonnement envoyé par email.</p>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                <CheckCircle2 className="mb-4 h-16 w-16 text-black" />
                <h3 className="mb-2 text-2xl font-semibold">Désabonnement réussi !</h3>
                <p className="text-muted-foreground mb-4">Vous ne recevrez plus nos emails marketing.</p>
                <p className="text-sm text-muted-foreground">Vous pouvez vous réabonner à tout moment sur notre site.</p>
                <Button onClick={() => (window.location.href = "/")} className="mt-6 rounded-xl">
                  Retour à l'accueil
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">Êtes-vous sûr de vouloir vous désabonner de notre newsletter ?</p>
                  <p className="text-sm text-muted-foreground">Vous ne recevrez plus nos nouveaux drops et offres exclusives.</p>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-sm">{error}</div>}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex-1 rounded-xl" disabled={loading}>
                    Annuler
                  </Button>
                  <Button onClick={handleUnsubscribe} disabled={loading} className="flex-1 rounded-xl bg-black hover:bg-gray-800">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Désabonnement...
                      </>
                    ) : (
                      "Confirmer"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Notification message={notification.message} type={notification.type} show={notification.show} onClose={() => setNotification({ ...notification, show: false })} />
    </>
  )
}
