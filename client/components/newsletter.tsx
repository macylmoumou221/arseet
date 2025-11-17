"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [inscrit, setInscrit] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInscrit(true)
    setTimeout(() => {
      setEmail("")
      setInscrit(false)
    }, 3000)
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Mail className="mx-auto mb-4 h-12 w-12" />
          <h2 className="mb-4 text-3xl font-bold tracking-tight">Restez informé</h2>
          <p className="mb-8 text-muted-foreground">
            Inscrivez-vous à notre newsletter pour recevoir les dernières nouveautés et offres exclusives
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={inscrit}>
              {inscrit ? "Inscrit!" : "S'inscrire"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
