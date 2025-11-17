"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ArticlePanier, Produit, Couleur } from "./types"

interface PanierStore {
  articles: ArticlePanier[]
  ajouterAuPanier: (produit: Produit, couleur: Couleur, quantite?: number, taille?: string) => boolean
  retirerDuPanier: (produitId: string, couleurNom: string, taille?: string) => void
  modifierQuantite: (produitId: string, couleurNom: string, quantite: number, taille?: string) => void
  viderPanier: () => void
  totalArticles: () => number
  totalPrix: () => number
}

export const usePanierStore = create<PanierStore>()(
  persist(
    (set, get) => ({
      articles: [],
  ajouterAuPanier: (produit, couleur, quantite = 1, taille) => {
        // Adds `quantite` units of the given product/color to the cart.
        // Enforce per-product stock limits when available.
        const articles = get().articles
  const articleExistant = articles.find((a) => a.produit.id === produit.id && a.couleur.nom === couleur.nom && (a.taille || undefined) === (taille || undefined))

        // Compute unit price (prefer promotional price when available)
        const unitPrice = produit.enPromotion && produit.prixPromotion ? produit.prixPromotion : produit.prix

        // Determine current quantity in cart and allowed additional quantity
        const currentQty = articleExistant ? articleExistant.quantite : 0
        const maxStock = typeof produit.stock === "number" ? produit.stock : Infinity
        const allowedToAdd = Math.max(0, maxStock - currentQty)

        if (allowedToAdd <= 0) {
          // Nothing can be added — respect stock limit
          return false
        }

        const toAdd = Math.min(quantite, allowedToAdd)

        if (articleExistant) {
          set({
            articles: articles.map((a) =>
              a.produit.id === produit.id && a.couleur.nom === couleur.nom && (a.taille || undefined) === (taille || undefined)
                ? { ...a, quantite: a.quantite + toAdd }
                : a,
            ),
          })
        } else {
          set({ articles: [...articles, { produit, couleur, quantite: toAdd, prix: unitPrice, ...(taille ? { taille } : {}) }] })
        }

        return toAdd === quantite
      },
      retirerDuPanier: (produitId, couleurNom, taille) => {
        set({
          articles: get().articles.filter((a) => !(a.produit.id === produitId && a.couleur.nom === couleurNom && (a.taille || undefined) === (taille || undefined))),
        })
      },
      modifierQuantite: (produitId, couleurNom, quantite, taille) => {
        if (quantite <= 0) {
          get().retirerDuPanier(produitId, couleurNom, taille)
        } else {
          set({
            articles: get().articles.map((a) =>
              a.produit.id === produitId && a.couleur.nom === couleurNom && (a.taille || undefined) === (taille || undefined) ? { ...a, quantite } : a,
            ),
          })
        }
      },
      viderPanier: () => set({ articles: [] }),
      totalArticles: () => {
        return get().articles.reduce((total, article) => total + article.quantite, 0)
      },
      totalPrix: () => {
        return get().articles.reduce((total, article) => {
          const unit = typeof article.prix === "number" ? article.prix : article.produit.prix
          return total + unit * article.quantite
        }, 0)
      },
    }),
    {
      name: "panier-storage",
    },
  ),
)
