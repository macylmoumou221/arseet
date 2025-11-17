"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Notification } from "@/components/ui/notification"
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react"
import { authAPI, setAuthToken, setUser, refreshUserProfile } from "@/lib/auth"

type ViewType = "login" | "request-reset" | "verify-code" | "new-password"

export default function ConnexionPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewType>("login")
  const [email, setEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Password refs (uncontrolled to prevent DevTools exposure)
  const motDePasseRef = useRef<HTMLInputElement>(null)
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const motDePasse = motDePasseRef.current?.value || ""
    
    try {
      const response = await authAPI.login({ email, mot_de_passe: motDePasse })
      
      if (response.success && response.data) {
        setAuthToken(response.data.token)
        setUser(response.data.user)
        
        // Fetch fresh profile data to ensure admin status is up-to-date
        await refreshUserProfile()
        
        showNotif("success", response.message || "Connexion réussie!")
        
        setTimeout(() => {
          window.location.href = "/nouvelles-arrivages"
        }, 1000)
      } else {
        // Extract all possible error messages from backend
        const errorMsg = response.message 
          || response.error 
          || (response.errors && Array.isArray(response.errors) ? response.errors.join(", ") : "")
          || "Erreur de connexion"
        showNotif("error", errorMsg)
      }
    } catch (error: any) {
      // Handle network errors and parse error response
      console.error("Login error:", error)
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error
        || error?.message 
        || "Erreur de connexion au serveur"
      showNotif("error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await authAPI.forgotPassword(email)
      
      if (response.success) {
        showNotif("success", response.message || "Code envoyé par email")
        setView("verify-code")
      } else {
        // Show the actual backend validation message
        showNotif("error", response.message || "Erreur lors de l'envoi du code")
      }
    } catch (error: any) {
      // Try to extract error message from response
      const errorMessage = error?.message || "Erreur de connexion au serveur"
      showNotif("error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    setView("new-password")
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const nouveauMotDePasse = nouveauMotDePasseRef.current?.value || ""
    const confirmerMotDePasse = confirmerMotDePasseRef.current?.value || ""
    
    if (nouveauMotDePasse !== confirmerMotDePasse) {
      showNotif("error", "Les mots de passe ne correspondent pas")
      return
    }
    
    setLoading(true)
    
    try {
      const response = await authAPI.resetPassword({
        email,
        code: resetCode,
        mot_de_passe: nouveauMotDePasse,
      })
      
      if (response.success) {
        showNotif("success", response.message || "Mot de passe réinitialisé avec succès")
        setTimeout(() => {
          setView("login")
          setResetCode("")
          if (nouveauMotDePasseRef.current) nouveauMotDePasseRef.current.value = ""
          if (confirmerMotDePasseRef.current) confirmerMotDePasseRef.current.value = ""
        }, 1500)
      } else {
        // Show the actual backend validation message
        showNotif("error", response.message || "Erreur lors de la réinitialisation")
      }
    } catch (error: any) {
      // Try to extract error message from response
      const errorMessage = error?.message || "Erreur de connexion au serveur"
      showNotif("error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Notification
        show={showNotification}
        type={notifType}
        message={notifMessage}
        duration={5000}
        onClose={() => setShowNotification(false)}
      />
      
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
      
          </Link>
        </div>

        <Card className="border-2 shadow-2xl animate-slide-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {view === "login" && "Connexion"}
              {view === "request-reset" && "Réinitialiser le mot de passe"}
              {view === "verify-code" && "Code de vérification"}
              {view === "new-password" && "Nouveau mot de passe"}
            </CardTitle>
            <CardDescription className="text-center">
              {view === "login" && "Connectez-vous à votre compte Arseet"}
              {view === "request-reset" && "Entrez votre email pour recevoir un code"}
              {view === "verify-code" && "Entrez le code à 8 chiffres reçu par email"}
              {view === "new-password" && "Définissez votre nouveau mot de passe"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl transition-all focus:scale-[1.02]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={motDePasseRef}
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 rounded-xl transition-all focus:scale-[1.02]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setView("request-reset")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mot de passe oublié?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Pas encore de compte? </span>
                  <Link href="/inscription" className="font-semibold hover:underline transition-all">
                    Créer un compte
                  </Link>
                </div>
              </form>
            )}

            {view === "request-reset" && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl transition-all focus:scale-[1.02]"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg"
                  size="lg"
                >
                  Envoyer le code
                </Button>

                <div className="mt-4 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Retour à la connexion
                  </button>
                </div>
              </form>
            )}

            {view === "verify-code" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code de vérification (8 chiffres)</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="12345678"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className="rounded-xl transition-all focus:scale-[1.02] text-center text-2xl tracking-widest"
                    maxLength={8}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg"
                  size="lg"
                  disabled={resetCode.length !== 8}
                >
                  Vérifier le code
                </Button>

                <div className="mt-4 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setView("request-reset")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </form>
            )}

            {view === "new-password" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={nouveauMotDePasseRef}
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 rounded-xl transition-all focus:scale-[1.02]"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={confirmerMotDePasseRef}
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 rounded-xl transition-all focus:scale-[1.02]"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg"
                  size="lg"
                >
                  Réinitialiser le mot de passe
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
