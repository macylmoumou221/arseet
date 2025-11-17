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
import { ArrowRight, Mail, Lock, UserIcon, Phone, Loader2 } from "lucide-react"
import { authAPI, setAuthToken, setUser, refreshUserProfile } from "@/lib/auth"

type StepType = "register" | "verify-code"

export default function InscriptionPage() {
  const router = useRouter()
  const [step, setStep] = useState<StepType>("register")
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [telephone, setTelephone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Password refs (uncontrolled to prevent DevTools exposure)
  const motDePasseRef = useRef<HTMLInputElement>(null)
  const confirmMotDePasseRef = useRef<HTMLInputElement>(null)
  
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const motDePasse = motDePasseRef.current?.value || ""
    const confirmMotDePasse = confirmMotDePasseRef.current?.value || ""
    
    if (motDePasse !== confirmMotDePasse) {
      showNotif("error", "Les mots de passe ne correspondent pas")
      return
    }
    
    setLoading(true)
    
    try {
      const registerData = {
        email,
        mot_de_passe: motDePasse,
        nom,
        prenom,
        telephone,
      }
      
      console.log('📤 Inscription - Données envoyées:', registerData)
      
      const response = await authAPI.register(registerData)
      
      console.log('📥 Inscription - Réponse reçue:', response)
      
      if (response.success) {
        showNotif("success", response.message || "Inscription réussie! Vérifiez votre email.")
        setStep("verify-code")
      } else {
        // Extract all possible error messages from backend
        const errorMsg = response.message 
          || response.error 
          || (response.errors && Array.isArray(response.errors) ? response.errors.join(", ") : "")
          || "Erreur lors de l'inscription"
        console.error('❌ Inscription - Erreur:', errorMsg)
        showNotif("error", errorMsg)
      }
    } catch (error: any) {
      // Handle network errors and parse error response
      console.error('❌ Inscription - Exception:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response,
        data: error?.response?.data
      })
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error
        || error?.message 
        || "Erreur de connexion au serveur"
      showNotif("error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await authAPI.verifyEmail({
        email,
        code: verificationCode,
      })
      
      if (response.success && response.data) {
        setAuthToken(response.data.token)
        setUser(response.data.user)
        
        // Fetch fresh profile data to ensure admin status is up-to-date
        await refreshUserProfile()
        
        showNotif("success", response.message || "Email vérifié avec succès!")
        
        setTimeout(() => {
          window.location.href = "/nouvelles-arrivages"
        }, 1000)
      } else {
        // Show the actual backend validation message
        showNotif("error", response.message || "Code invalide")
      }
    } catch (error: any) {
      // Try to extract error message from response
      const errorMessage = error?.message || "Erreur de connexion au serveur"
      showNotif("error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    
    try {
      const response = await authAPI.resendVerification(email)
      
      if (response.success) {
        showNotif("success", response.message || "Code renvoyé avec succès!")
      } else {
        showNotif("error", response.message || "Erreur lors de l'envoi du code")
      }
    } catch (error: any) {
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
              {step === "register" ? "Inscription" : "Vérification"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === "register" ? "Créez votre compte Arseet" : "Entrez le code à 8 chiffres envoyé à votre email"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="nom"
                      type="text"
                      placeholder="Votre nom"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="pl-10 rounded-xl transition-all focus:scale-[1.02]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="prenom"
                      type="text"
                      placeholder="Votre prénom"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="pl-10 rounded-xl transition-all focus:scale-[1.02]"
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="telephone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="+213 XXX XXX XXX"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
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
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={confirmMotDePasseRef}
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
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      Créer mon compte
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Déjà un compte? </span>
                  <Link href="/connexion" className="font-semibold hover:underline transition-all">
                    Se connecter
                  </Link>
                </div>
              </form>
            )}

            {step === "verify-code" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Code de confirmation (8 chiffres)</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="12345678"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className="rounded-xl transition-all focus:scale-[1.02] text-center text-2xl tracking-widest"
                    maxLength={8}
                    required
                  />
                  <p className="text-sm text-muted-foreground text-center">Code envoyé à {email}</p>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg"
                  size="lg"
                  disabled={verificationCode.length !== 8 || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Vérifier le code"
                  )}
                </Button>

                <div className="mt-4 text-center text-sm">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
