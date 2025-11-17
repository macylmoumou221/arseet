"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookieConsent() {
  const [show, setShow] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent")
    if (!consent) {
      // Show banner after a small delay for better UX
      setTimeout(() => setShow(true), 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted")
    localStorage.setItem("cookieConsentDate", new Date().toISOString())
    closeConsent()
  }

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined")
    localStorage.setItem("cookieConsentDate", new Date().toISOString())
    // Disable analytics if user declines
    if (typeof window !== "undefined" && (window as any).va) {
      (window as any).va = () => {} // Disable Vercel Analytics
    }
    closeConsent()
  }

  const closeConsent = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShow(false)
      setIsClosing(false)
    }, 300)
  }

  if (!show) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="relative bg-white border-t-4 border-black">
        {/* Close button */}
        <button
          onClick={handleDecline}
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-black text-white p-2 hover:bg-neutral-800 transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="max-w-7xl mx-auto px-6 py-6 md:px-12 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pr-12 md:pr-0">
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-black text-white px-3 py-1 text-xs font-bold tracking-wider">
                  COOKIES & CONFIDENTIALITÉ
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-black mb-3">
                Nous utilisons des cookies
              </h3>
              <p className="text-sm md:text-base text-neutral-700 leading-relaxed max-w-3xl">
                Ce site utilise des cookies et le stockage local pour améliorer votre expérience, 
                gérer votre panier, et analyser notre trafic. En continuant, vous acceptez notre 
                utilisation de ces technologies.
              </p>
              <div className="mt-4">
                <details className="text-xs text-neutral-600">
                  <summary className="cursor-pointer font-semibold hover:text-black transition-colors">
                    En savoir plus sur nos cookies
                  </summary>
                  <div className="mt-2 pl-4 space-y-2 text-neutral-600">
                    <p>
                      <strong className="text-black">Essentiels:</strong> Authentification, panier d'achat, préférences d'interface
                    </p>
                    <p>
                      <strong className="text-black">Analytiques:</strong> Vercel Analytics pour comprendre l'utilisation du site
                    </p>
                    <p>
                      <strong className="text-black">Stockage:</strong> localStorage pour vos données de session et préférences
                    </p>
                  </div>
                </details>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row gap-3 md:min-w-[420px] md:justify-end">
              <Button
                onClick={handleDecline}
                variant="outline"
                className="bg-white text-black border-2 border-black hover:bg-neutral-100 font-bold py-6 px-6 md:px-8 rounded-none transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 md:flex-none"
              >
                REFUSER
              </Button>
              <Button
                onClick={handleAccept}
                className="bg-black text-white hover:bg-neutral-800 font-bold py-6 px-6 md:px-8 rounded-none border-2 border-black transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 md:flex-none"
              >
                ACCEPTER TOUT
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
