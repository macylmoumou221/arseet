"use client"

import { useEffect, useState } from "react"
import { CarteProduit } from "@/components/carte-produit"
import { api } from "@/lib/api"
import type { Produit, Couleur } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Map backend product to frontend Produit type
function mapBackendProduct(backendProduct: any): Produit {
  // Create default color if no colors provided or handle images
  const defaultImage = backendProduct.image_avant || backendProduct.images || "/placeholder.jpg"
  const backImage = backendProduct.image_arriere || backendProduct.images || "/placeholder.jpg"
  
  let couleurs: Couleur[] = []
  
  if (backendProduct.couleurs && backendProduct.couleurs.length > 0) {
    // Map backend colors to frontend Couleur type
    couleurs = backendProduct.couleurs.map((couleur: any) => {
      const frontImg = couleur.image_avant || defaultImage
      const backImg = couleur.image_arriere || backImage
      
      return {
        nom: couleur.couleur || couleur.nom || couleur.name || "Standard",
        code: couleur.code_hexa || couleur.code || couleur.color || "#000000",
        imageFront: frontImg && frontImg !== "" ? frontImg : "/placeholder.jpg",
        imageBack: backImg && backImg !== "" ? backImg : "/placeholder.jpg",
      }
    })
  } else {
    // Create default color entry
    couleurs = [
      {
        nom: "Standard",
        code: "#000000",
        imageFront: defaultImage && defaultImage !== "" ? defaultImage : "/placeholder.jpg",
        imageBack: backImage && backImage !== "" ? backImage : "/placeholder.jpg",
      },
    ]
  }

  // Prefer the raw `prix` from backend as the original price. If missing, fallback to prix_final.
  const originalPrice = parseFloat(backendProduct.prix || backendProduct.prix_final || 0)
  const promotionPercent = backendProduct.promotion ? Number(backendProduct.promotion) : 0

  return {
    id: backendProduct.id.toString(),
    nom: backendProduct.nom,
    prix: originalPrice,
    description: backendProduct.description || "",
    couleurs: couleurs,
    categorie: backendProduct.categorie || "homme",
    nouveau: backendProduct.est_nouveau || false,
    tailles: backendProduct.tailles || [],
    stock: backendProduct.stock || 0,
    enRupture: backendProduct.en_rupture || false,
    // Promotion fields
    promotionPercent: promotionPercent,
    enPromotion: promotionPercent > 0 || !!backendProduct.en_promotion,
    prixPromotion: promotionPercent > 0 ? parseFloat((originalPrice * (1 - promotionPercent / 100)).toFixed(2)) : undefined,
  }
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [selectedColor, setSelectedColor] = useState<string>("all")
  const [selectedSize, setSelectedSize] = useState<string>("all")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        console.log("🔄 Fetching products...")
        const response: any = await api.products.getAll()
        console.log("✅ Products response:", response)
        
        if (response.success && response.data?.produits) {
          const mappedProducts = response.data.produits.map(mapBackendProduct)
          setProduits(mappedProducts)
        } else if (response.success && Array.isArray(response.data)) {
          // Handle case where data is directly an array
          const mappedProducts = response.data.map(mapBackendProduct)
          setProduits(mappedProducts)
        } else if (response.produits) {
          // Handle case where produits is at root level
          const mappedProducts = response.produits.map(mapBackendProduct)
          setProduits(mappedProducts)
        } else {
          console.error("Unexpected response format:", response)
          setError("Format de réponse inattendu du serveur")
        }
      } catch (err: any) {
        console.error("❌ Error fetching products:", err)
        setError(err.message || "Impossible de charger les produits. Vérifiez que le backend est démarré.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Get unique colors and sizes from products
  const allColors = Array.from(new Set(produits.flatMap((p) => p.couleurs.map(c => c.nom))))
  const allSizes = Array.from(new Set(produits.flatMap((p) => {
    if (!p.tailles) return []
    // Handle both string arrays and object arrays from backend
    return p.tailles.map(t => typeof t === 'string' ? t : (t as any).taille || String(t))
  })))

  // Filter products based on selected filters
  const filteredProducts = produits.filter((produit) => {
    // Stock filter
    if (stockFilter === "in-stock" && (produit.stock === 0 || produit.enRupture)) return false
    if (stockFilter === "out-of-stock" && produit.stock !== 0 && !produit.enRupture) return false
    
    // Color filter
    if (selectedColor !== "all" && !produit.couleurs.some(c => c.nom === selectedColor)) return false
    
    // Size filter
    if (selectedSize !== "all" && produit.tailles) {
      const productSizes = produit.tailles.map(t => typeof t === 'string' ? t : (t as any).taille || String(t))
      if (!productSizes.includes(selectedSize)) return false
    }
    
    // Price range filter
    const min = minPrice ? parseFloat(minPrice) : 0
    const max = maxPrice ? parseFloat(maxPrice) : Infinity
    if (produit.prix < min || produit.prix > max) return false
    
    return true
  })

  if (loading) {
    return (
      <main className="py-16 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight">Produits</h1>
            <p className="text-muted-foreground text-lg">Notre collection complète</p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Chargement des produits...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="py-16 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight">Produits</h1>
            <p className="text-muted-foreground text-lg">Notre collection complète</p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
            <p className="text-muted-foreground text-sm mt-2">
              Assurez-vous que le backend est démarré sur http://localhost:5000
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="py-16 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground text-lg">Notre collection complète</p>
        </div>
        
        {/* Filtering Options - Left Aligned */}
        <div className="mb-8 flex justify-start">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Stock Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="stock" className="font-medium text-sm">
                Stock:
              </Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger id="stock" className="w-[140px]">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="in-stock">En stock</SelectItem>
                  <SelectItem value="out-of-stock">Rupture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="color" className="font-medium text-sm">
                Couleur:
              </Label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger id="color" className="w-[140px]">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {allColors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="size" className="font-medium text-sm">
                Taille:
              </Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger id="size" className="w-[140px]">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {allSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div className="flex items-center gap-2">
              <Label className="font-medium text-sm">Prix (DA):</Label>
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-[100px]"
                min="0"
              />
              <span className="text-sm">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-[100px]"
                min="0"
              />
            </div>
          </div>
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((produit, index) => (
              <div key={produit.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CarteProduit produit={produit} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Aucun produit ne correspond à vos critères</p>
          </div>
        )}
      </div>
    </main>
  )
}
