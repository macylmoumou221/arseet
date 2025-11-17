"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Send } from "lucide-react"
import { Notification } from "@/components/ui/notification"
import { apiClient } from "@/lib/api"

export function ContactForm() {
  const [nom, setNom] = useState("")
  const [email, setEmail] = useState("")
  const [sujet, setSujet] = useState("")
  const [message, setMessage] = useState("")
  const [envoye, setEnvoye] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" | "warning" }>({
    show: false,
    message: "",
    type: "info",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submit = async () => {
      try {
        setEnvoye(true)
        // Use centralized API client
        const data = await apiClient.post('/api/contact', { nom, email, sujet, message })
        console.log('Contact submit response data:', data)

        // success — prefer server-provided message when available
        const serverMessage = (data as any)?.message || 'Une Erreur est survenue. Réessayez plus tard.'
        setNom("")
        setEmail("")
        setSujet("")
        setMessage("")
  setNotification({ show: true, message: serverMessage, type: "success" })
        setTimeout(() => setEnvoye(false), 1500)
      } catch (error) {
      console.error('Contact submit exception:', error)
      setNotification({ show: true, message: 'Erreur réseau. Réessayez plus tard.', type: "error" })
      setEnvoye(false)
      }
    }

    void submit()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envoyez-nous un message</CardTitle>
        <CardDescription>Remplissez le formulaire ci-dessous et nous vous répondrons rapidement</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom complet</Label>
            <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sujet">Sujet</Label>
            <Input id="sujet" value={sujet} onChange={(e) => setSujet(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              className="resize-none"
            />
          </div>

          <Button type="submit" className="w-full" disabled={envoye}>
            {envoye ? (
              "Message envoyé!"
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer le message
              </>
            )}
          </Button>
          {/* Notification */}
          <Notification
            show={notification.show}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ ...notification, show: false })}
          />
        </form>
      </CardContent>
    </Card>
  )
}
