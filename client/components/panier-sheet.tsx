"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react"
import { usePanierStore } from "@/lib/store"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"

interface PanierSheetProps {
  children: React.ReactNode
}

export function PanierSheet({ children }: PanierSheetProps) {
  const [ouvert, setOuvert] = useState(false)
  const articles = usePanierStore((state) => state.articles)
  const totalPrix = usePanierStore((state) => state.totalPrix())
  const modifierQuantite = usePanierStore((state) => state.modifierQuantite)
  const retirerDuPanier = usePanierStore((state) => state.retirerDuPanier)

  return (
    <Sheet open={ouvert} onOpenChange={setOuvert}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg p-0">
        {/* Header with close button */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">
              Panier <span className="text-muted-foreground">({articles.length})</span>
            </SheetTitle>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 animate-fade-in">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="mb-2 text-xl font-semibold">Votre panier est vide</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Découvrez nos produits et ajoutez-les à votre panier pour continuer
            </p>
            <Button 
              onClick={() => setOuvert(false)} 
              variant="outline" 
              className="mt-6 rounded-xl"
            >
              Continuer les achats
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="space-y-4">
                {articles.map((article, index) => (
                  <div 
                    key={`${article.produit.id}-${article.couleur.nom}-${article.taille || 'default'}`} 
                    className="group relative flex gap-4 p-3 rounded-xl border border-border hover:border-foreground/20 hover:shadow-sm transition-all animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Product Image */}
                    <div className="relative h-28 w-28 overflow-hidden rounded-lg bg-secondary flex-shrink-0">
                      <Image
                        src={article.couleur.imageFront || "/placeholder.svg"}
                        alt={article.produit.nom}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-base mb-1 line-clamp-2">{article.produit.nom}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <div 
                              className="w-4 h-4 rounded-full border border-border" 
                              style={{ backgroundColor: article.couleur.code || '#000' }}
                            />
                            {article.couleur.nom}
                          </span>
                          {article.taille && (
                            <>
                              <span>•</span>
                              <span className="font-medium">{article.taille}</span>
                            </>
                          )}
                        </div>
                        <p className="text-base font-bold">
                          {(typeof article.prix === 'number' ? article.prix : article.produit.prix).toLocaleString()} DZD
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center rounded-lg border border-border overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none hover:bg-secondary"
                            onClick={() =>
                              modifierQuantite(article.produit.id, article.couleur.nom, article.quantite - 1, article.taille)
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="flex h-9 w-12 items-center justify-center text-sm font-semibold border-x border-border">
                            {article.quantite}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none hover:bg-secondary"
                            onClick={() =>
                              modifierQuantite(article.produit.id, article.couleur.nom, article.quantite + 1, article.taille)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => retirerDuPanier(article.produit.id, article.couleur.nom, article.taille)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with Total and Checkout */}
            <div className="border-t px-6 py-4 space-y-4 bg-secondary/20">
              {/* Subtotal Info */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Sous-total ({articles.length} {articles.length === 1 ? 'article' : 'articles'})</span>
                  <span className="font-medium">{totalPrix.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Livraison</span>
                  <span>Calculée à la caisse</span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold">{totalPrix.toLocaleString()} DZD</span>
              </div>

              {/* Checkout Button */}
              <Link href="/livraison" onClick={() => setOuvert(false)} className="block">
                <Button className="w-full rounded-xl h-12 text-base font-semibold bg-black hover:bg-gray-800 transition-all hover:scale-[1.02]" size="lg">
                  Passer la commande
                </Button>
              </Link>

              {/* Continue Shopping */}
              <Button 
                onClick={() => setOuvert(false)} 
                variant="outline" 
                className="w-full rounded-xl"
              >
                Continuer les achats
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
