"use client"

import { X, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePanierStore } from "@/lib/store"
import Image from "next/image"
import Link from "next/link"

interface PanierSlideOverProps {
  ouvert: boolean
  onFermerAction: () => void
}

export function PanierSlideOver({ ouvert, onFermerAction }: PanierSlideOverProps) {
  const { articles, modifierQuantite, retirerDuPanier, totalPrix } = usePanierStore()

  if (!ouvert) return null

  return (
    <>
  <div className="fixed inset-0 z-50 bg-black/50" onClick={onFermerAction} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">Panier ({articles.length})</h2>
            <Button variant="ghost" size="icon" onClick={onFermerAction}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
                {articles.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <p className="text-muted-foreground">Votre panier est vide</p>
                <Button onClick={onFermerAction}>Continuer vos achats</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div
                    key={`${article.produit.id}-${article.couleur.nom}-${article.taille || 'default'}`}
                    className="flex gap-4 border-b border-border pb-4"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-secondary">
                      <Image
                        src={article.couleur.imageFront || "/placeholder.svg"}
                        alt={article.produit.nom}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-medium">{article.produit.nom}</h3>
                          <p className="text-xs text-muted-foreground">Couleur: {article.couleur.nom}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => retirerDuPanier(article.produit.id, article.couleur.nom, article.taille)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              modifierQuantite(article.produit.id, article.couleur.nom, article.quantite - 1, article.taille)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{article.quantite}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              modifierQuantite(article.produit.id, article.couleur.nom, article.quantite + 1, article.taille)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-semibold">{(typeof article.prix === 'number' ? article.prix : article.produit.prix) * article.quantite} DZD</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {articles.length > 0 && (
            <div className="border-t border-border px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">{totalPrix()} DZD</span>
              </div>
              <Link href="/livraison" onClick={onFermerAction}>
                <Button className="w-full" size="lg">
                  Commander
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
