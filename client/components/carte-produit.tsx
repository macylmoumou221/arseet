"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import type { Produit, Couleur } from "@/lib/types"
import { usePanierStore } from "@/lib/store"
import { Notification } from "@/components/ui/notification"

interface CarteProduitProps {
  produit: Produit
}

export function CarteProduit({ produit }: CarteProduitProps) {
  // Ensure we have a valid default color with fallback
  const defaultCouleur = produit.couleurs && produit.couleurs.length > 0 
    ? produit.couleurs[0] 
    : { nom: "Défaut", code: "#000000", imageFront: "", imageBack: "" }
  
  const [couleurSelectionnee, setCouleurSelectionnee] = useState<Couleur>(defaultCouleur)
  const [afficherDos, setAfficherDos] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notifMessage, setNotifMessage] = useState("")
  const [notifType, setNotifType] = useState<"success" | "error" | "info" | "warning">("success")
  const ajouterAuPanier = usePanierStore((state) => state.ajouterAuPanier)
  const articles = usePanierStore((state) => state.articles)

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleAjouterAuPanier = (e: React.MouseEvent) => {
    e.preventDefault()

    // Check stock before adding
    if (isOutOfStock) {
      setNotifType("error")
      setNotifMessage("Ce produit n'est pas disponible")
      setShowNotification(true)
      return
    }

    // Get current qty of this product/color in cart
    const currentArticle = articles.find(
      (a) => a.produit.id === produit.id && a.couleur.nom === couleurSelectionnee.nom,
    )
    const currentQty = currentArticle?.quantite || 0

    // If already at max stock, show error via Notification
    if (produit.stock !== undefined && currentQty >= produit.stock) {
      setNotifType("error")
      setNotifMessage("Quantité maximale atteinte")
      setShowNotification(true)
      return
    }

    // Open confirmation dialog (keeps UI unchanged otherwise)
    setShowConfirmDialog(true)
  }

  const confirmAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault?.()

    const currentArticle = articles.find(
      (a) => a.produit.id === produit.id && a.couleur.nom === couleurSelectionnee.nom,
    )
    const currentQty = currentArticle?.quantite || 0

    if (produit.stock !== undefined && currentQty >= produit.stock) {
      setNotifType("error")
      setNotifMessage("Quantité maximale atteinte")
      setShowNotification(true)
      setShowConfirmDialog(false)
      return
    }

    // Try to add one unit via the store (store enforces stock limits centrally)
    const success = ajouterAuPanier(produit, couleurSelectionnee, 1)

    if (!success) {
      setNotifType("error")
      setNotifMessage("Impossible d'ajouter plus d'unités (stock limité)")
      setShowNotification(true)
    } else {
      setNotifType("success")
      setNotifMessage(`${produit.nom} ajouté au panier avec succès!`)
      setShowNotification(true)
    }

    setShowConfirmDialog(false)
  }

  // Check if product is out of stock
  const isOutOfStock = produit.enRupture || (produit.stock !== undefined && produit.stock === 0)
  
  // Check if current color has valid images
  const hasValidImages = couleurSelectionnee?.imageFront && 
                         couleurSelectionnee?.imageBack && 
                         couleurSelectionnee.imageFront !== "" && 
                         couleurSelectionnee.imageBack !== ""

  return (
    <Link href={`/produit/${produit.id}`} className="group block">
      <Notification
        show={showNotification}
        type={notifType}
        message={notifMessage}
        duration={3000}
        onClose={() => setShowNotification(false)}
      />
      
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary rounded-lg">
        {hasValidImages ? (
          <Image
            src={afficherDos ? couleurSelectionnee.imageBack : couleurSelectionnee.imageFront}
            alt={produit.nom}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onMouseEnter={() => setAfficherDos(true)}
            onMouseLeave={() => setAfficherDos(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <span className="text-sm">Pas d'image disponible</span>
          </div>
        )}
        {produit.nouveau && !isOutOfStock && (
          <div className="absolute left-4 top-4 bg-black px-3 py-1 text-xs font-semibold text-white rounded-md">
            NOUVEAU
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute left-4 top-4 bg-gray-200 px-3 py-1 text-xs font-semibold text-black rounded-md">
            RUPTURE
          </div>
        )}
        {produit.promotionPercent && produit.promotionPercent > 0 && (
          <div className="absolute right-4 top-4 bg-black px-3 py-1 text-xs font-semibold text-white rounded-md">
            -{produit.promotionPercent}%
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium">{produit.nom}</h3>
          {produit.enPromotion && produit.prixPromotion ? (
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-semibold line-through text-gray-400 mr-2">{produit.prix.toLocaleString()} DZD</p>
              <p className="text-sm font-semibold text-black">{produit.prixPromotion.toLocaleString()} DZD</p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-black">{produit.prix.toLocaleString()} DZD</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {produit.couleurs.map((couleur) => (
            <button
              key={couleur.nom}
              onClick={(e) => {
                e.preventDefault()
                setCouleurSelectionnee(couleur)
              }}
              className={`h-6 w-6 rounded-full border-2 transition-all ${
                couleurSelectionnee.nom === couleur.nom ? "border-foreground scale-110" : "border-border"
              }`}
              style={{ backgroundColor: couleur.code }}
              title={couleur.nom}
            />
          ))}
        </div>

        {showConfirmDialog ? (
          <div className="space-y-2">
            <p className="text-sm text-center">Confirmer l'ajout au panier ?</p>
            <Button
              onClick={(e) => confirmAddToCart(e)}
              className="w-full rounded-xl"
              size="sm"
            >
              Confirmer
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAjouterAuPanier}
            className="w-full rounded-xl transition-all hover:scale-[1.02]"
            size="sm"
            disabled={isOutOfStock}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? "Indisponible" : "Ajouter au panier"}
          </Button>
        )}
      </div>
    </Link>
  )
}
