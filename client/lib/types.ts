export interface Produit {
  id: string
  nom: string
  prix: number
  description: string
  couleurs: Couleur[]
  categorie: string
  nouveau: boolean
  tailles?: string[]
  stock?: number
  enRupture?: boolean
  enPromotion?: boolean
  prixPromotion?: number
  promotionPercent?: number
  additionalImages?: string[] // Add additional images
}

export interface Couleur {
  nom: string
  code: string
  imageFront: string
  imageBack: string
}

// API Response Types
export interface ProduitAPI {
  id: number
  nom: string
  description: string
  prix: number
  categorie: string
  stock: number
  image_avant: string
  image_arriere: string
  images: string[] // JSON array of additional images
  couleurs: CouleurAPI[]
  tailles: TailleAPI[]
  est_nouveau: boolean
  en_rupture: boolean
  en_promotion: boolean
  promotion?: number // percentage
  createdAt?: string
  updatedAt?: string
}

export interface CouleurAPI {
  couleur: string
  code_hexa: string
  stock_couleur: number
}

export interface TailleAPI {
  taille: string
  stock_taille: number
}

export interface ArticlePanier {
  produit: Produit
  couleur: Couleur
  quantite: number
  taille?: string
  // Unit price stored at the moment the item is added to the cart.
  // This already accounts for any promotion: if the product has a promotion,
  // this should be the promotional price; otherwise it's the original price.
  prix?: number
}

export interface Utilisateur {
  nom: string
  email: string
  telephone: string
  adresse: string
}

export interface Commande {
  id: string
  date: string
  total: number
  statut: string
}
