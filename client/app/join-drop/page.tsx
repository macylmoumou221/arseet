"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle2 } from "lucide-react"

export default function JoinDropPage() {
  const [email, setEmail] = useState("")
  const [inscrit, setInscrit] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate newsletter signup
    setInscrit(true)
    setTimeout(() => {
      setEmail("")
      setInscrit(false)
    }, 3000)
  }

  return (
    <main className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center animate-fade-in">
            <h1 className="mb-4 text-5xl font-bold tracking-tight">Join the Drop</h1>
            <p className="text-xl text-muted-foreground">
              Inscrivez-vous pour être informé en avant-première de nos nouveaux drops et collections exclusives.
            </p>
          </div>

          <Card className="animate-slide-in rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Newsletter Arseet</CardTitle>
              <CardDescription>
                Recevez les dernières nouvelles, drops exclusifs et offres spéciales directement dans votre boîte mail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inscrit ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                  <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
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
                        className="pl-10 rounded-xl"
                      />
                    </div>
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
                      className="w-full rounded-xl text-lg transition-all hover:scale-105"
                    >
                      S'inscrire au Drop
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

          <div className="mt-12 grid gap-6 md:grid-cols-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="rounded-2xl bg-card p-6 text-center shadow-sm">
              <div className="mb-3 text-4xl">🔥</div>
              <h3 className="mb-2 font-semibold">Drops Exclusifs</h3>
              <p className="text-sm text-muted-foreground">Soyez les premiers informés de nos collections limitées</p>
            </div>
            <div className="rounded-2xl bg-card p-6 text-center shadow-sm">
              <div className="mb-3 text-4xl">💎</div>
              <h3 className="mb-2 font-semibold">Offres VIP</h3>
              <p className="text-sm text-muted-foreground">Accédez à des réductions réservées aux abonnés</p>
            </div>
            <div className="rounded-2xl bg-card p-6 text-center shadow-sm">
              <div className="mb-3 text-4xl">📦</div>
              <h3 className="mb-2 font-semibold">Livraison Prioritaire</h3>
              <p className="text-sm text-muted-foreground">Recevez vos commandes en priorité lors des drops</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
