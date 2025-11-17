"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Minus, Plus, ChevronLeft } from "lucide-react"
import type { Produit, Couleur } from "@/lib/types"
import { usePanierStore } from "@/lib/store"

interface DetailsProduitProps {
  produit: Produit
}

export function DetailsProduit({ produit }: DetailsProduitProps) {
  const [couleurSelectionnee, setCouleurSelectionnee] = useState<Couleur>(produit.couleurs?.[0] || {
    nom: "Default",
    code: "#000000",
    imageFront: produit.couleurs?.[0]?.imageFront || "/placeholder.svg",
    imageBack: produit.couleurs?.[0]?.imageBack || "/placeholder.svg",
  })
  const [tailleSelectionnee, setTailleSelectionnee] = useState<string>(produit.tailles?.[0] || "M")
  const [showCustomTaille, setShowCustomTaille] = useState(false)
  const [customTaille, setCustomTaille] = useState("")
  const [quantite, setQuantite] = useState(1)
  const [imageActive, setImageActive] = useState<string>(couleurSelectionnee.imageFront)
  const [stockDisponible, setStockDisponible] = useState<number>(produit.stock || 0)
  const ajouterAuPanier = usePanierStore((state) => state.ajouterAuPanier)

  // Calculate available stock based on selection
  useEffect(() => {
    // This will be updated when we have color and size stock from backend
    // For now, use total stock
    setStockDisponible(produit.stock || 0)
  }, [couleurSelectionnee, tailleSelectionnee, produit.stock])

  // Get all images for gallery
  const allImages = [
    couleurSelectionnee.imageFront,
    couleurSelectionnee.imageBack,
    ...(produit.additionalImages || [])
  ].filter(Boolean).slice(0, 12) // Front + Back + up to 10 additional = 12 max

  const handleAjouterAuPanier = () => {
    // Determine taille to send
    const tailleToSend = showCustomTaille ? (customTaille || tailleSelectionnee) : tailleSelectionnee

    // Add requested quantity in a single call; the store will cap to available stock.
    const success = ajouterAuPanier(produit, couleurSelectionnee, quantite, tailleToSend)

    // If not fully successful (i.e. stock limited), clamp the requested quantity visually
    if (!success) {
      // reduce the quantity input to available stock
      setQuantite(Math.min(quantite, stockDisponible || 1))
    } else {
      setQuantite(1)
    }
  }

  const incrementerQuantite = () => {
    if (stockDisponible && quantite < stockDisponible) {
      setQuantite((q) => q + 1)
    } else if (!stockDisponible) {
      setQuantite((q) => q + 1)
    }
  }
  const decrementerQuantite = () => setQuantite((q) => (q > 1 ? q - 1 : 1))

  // Check if product is out of stock
  const isOutOfStock = produit.enRupture || stockDisponible === 0

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <Link
        href="/produits"
        className="mb-8 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Retour aux produits
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4 animate-slide-in">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary">
            <Image
              src={imageActive}
              alt={`${produit.nom}`}
              fill
              className="object-cover transition-all hover:scale-105 duration-500"
              priority
            />
            {produit.nouveau && !isOutOfStock && (
              <div className="absolute left-4 top-4 bg-black px-4 py-2 text-xs font-semibold text-white rounded-lg animate-fade-in">
                NOUVEAU
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute left-4 top-4 bg-gray-200 px-4 py-2 text-xs font-semibold text-black rounded-lg animate-fade-in">
                RUPTURE DE STOCK
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setImageActive(image)}
                className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 transition-all hover:scale-105 ${
                  imageActive === image ? "border-foreground ring-2 ring-foreground ring-offset-2" : "border-border"
                }`}
              >
                <Image
                  src={image}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div>
            <p className="mb-2 text-sm text-muted-foreground uppercase tracking-wide">{produit.categorie}</p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight">{produit.nom}</h1>
            <div className="flex items-baseline gap-3">
              {produit.enPromotion && produit.prixPromotion ? (
                <>
                  <p className="text-3xl font-semibold text-black">{produit.prixPromotion.toLocaleString()} DZD</p>
                  <p className="text-xl line-through text-gray-400">{produit.prix.toLocaleString()} DZD</p>
                  {produit.prix && produit.prixPromotion && produit.prix > produit.prixPromotion && (
                    <span className="ml-3 text-sm bg-black text-white px-2 py-1 rounded">-
                      {Math.round((1 - produit.prixPromotion / produit.prix) * 100)}%
                    </span>
                  )}
                </>
              ) : (
                <p className="text-3xl font-semibold text-black">{produit.prix.toLocaleString()} DZD</p>
              )}
            </div>
            {/* Stock Display */}
            <div className="mt-3">
              <p className="text-sm">
                Stock disponible: <span className={`font-semibold ${
                  stockDisponible > 10 
                    ? 'text-black' 
                    : stockDisponible > 0 
                      ? 'text-gray-600' 
                      : 'text-gray-400'
                }`}>
                  {stockDisponible} {stockDisponible > 1 ? 'unités' : 'unité'}
                </span>
                {stockDisponible === 0 && (
                  <span className="ml-2 text-xs bg-gray-200 text-black px-2 py-1 rounded">Rupture de stock</span>
                )}
                {stockDisponible > 0 && stockDisponible <= 10 && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-300">Stock limité</span>
                )}
              </p>
            </div>
          </div>

          {/* top description removed - keep detailed description in the "Product Details" section below */}

          {produit.tailles && produit.tailles.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold">Taille: {showCustomTaille ? (customTaille || tailleSelectionnee) : tailleSelectionnee}</h3>
              <div className="flex gap-3">
                {produit.tailles.map((taille) => (
                  <button
                    key={taille}
                    onClick={() => setTailleSelectionnee(taille)}
                    className={`h-12 w-12 rounded-xl border-2 font-semibold transition-all hover:scale-110 ${
                      tailleSelectionnee === taille
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {taille}
                  </button>
                ))}
                <button
                  key="personnalise"
                  onClick={() => {
                    setShowCustomTaille(true)
                    setTailleSelectionnee(customTaille || "Personnalisé")
                  }}
                  className={`h-12 px-3 rounded-xl border-2 font-semibold transition-all hover:scale-110 ${
                    showCustomTaille ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                  }`}
                >
                  Personnalisé
                </button>
              </div>

              {showCustomTaille && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Entrez votre taille personnalisée"
                    value={customTaille}
                    onChange={(e) => {
                      setCustomTaille(e.target.value)
                      setTailleSelectionnee(e.target.value || "Personnalisé")
                    }}
                    className="w-full rounded-xl border p-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* Color Selection */}
          {produit.couleurs && produit.couleurs.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold">Couleur: {couleurSelectionnee.nom}</h3>
              <div className="flex gap-3">
                {produit.couleurs.map((couleur) => (
                  <button
                    key={couleur.nom}
                    onClick={() => {
                    setCouleurSelectionnee(couleur)
                    setImageActive(couleur.imageFront)
                  }}
                    className={`h-12 w-12 rounded-xl border-2 transition-all hover:scale-110 ${
                      couleurSelectionnee.nom === couleur.nom
                        ? "border-foreground scale-110 ring-2 ring-foreground ring-offset-2"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: couleur.code }}
                    title={couleur.nom}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Quantité</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementerQuantite}
                  className="h-12 w-12 rounded-none hover:bg-secondary"
                  disabled={quantite <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex h-12 w-16 items-center justify-center border-x border-border">
                  <span className="font-semibold">{quantite}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementerQuantite}
                  className="h-12 w-12 rounded-none hover:bg-secondary"
                  disabled={stockDisponible !== undefined && quantite >= stockDisponible}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Total: {((produit.enPromotion && produit.prixPromotion ? produit.prixPromotion : produit.prix) * quantite).toLocaleString()} DZD
              </p>
            </div>
            {stockDisponible !== undefined && quantite >= stockDisponible && (
              <p className="text-xs text-gray-600 mt-2">Quantité maximale atteinte</p>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAjouterAuPanier}
            size="lg"
            className="w-full text-base rounded-xl transition-all hover:scale-[1.02]"
            disabled={isOutOfStock}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isOutOfStock ? "Produit indisponible" : "Ajouter au panier"}
          </Button>

          {/* Product Details */}
          <div className="space-y-4 border-t border-border pt-8">
            {produit.description && (
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <div className="text-sm text-muted-foreground break-words whitespace-pre-line">
                  {produit.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
