import { notFound } from "next/navigation"
import { DetailsProduit } from "@/components/details-produit"
import type { ProduitAPI, Produit, Couleur } from "@/lib/types"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Function to convert API product to frontend product format
function convertAPIProduct(apiProduct: ProduitAPI): Produit {
  console.log('Converting API Product:', apiProduct)
  console.log('API Tailles:', apiProduct.tailles)
  
  // Parse additional images from JSON string if needed
  let additionalImages: string[] = []
  if (apiProduct.images) {
    try {
      additionalImages = typeof apiProduct.images === 'string' 
        ? JSON.parse(apiProduct.images) 
        : apiProduct.images
    } catch (e) {
      additionalImages = Array.isArray(apiProduct.images) ? apiProduct.images : []
    }
  }

  const mappedTailles = apiProduct.tailles?.map(t => typeof t === 'string' ? t : t.taille) || []
  console.log('Mapped Tailles:', mappedTailles)

  return {
    id: apiProduct.id.toString(),
    nom: apiProduct.nom,
    // Ensure prix is a number (backend may send string or number)
    prix: typeof apiProduct.prix === 'string' ? parseFloat(apiProduct.prix) : apiProduct.prix,
    description: apiProduct.description,
    categorie: apiProduct.categorie,
    nouveau: apiProduct.est_nouveau,
    stock: apiProduct.stock,
    enRupture: apiProduct.en_rupture,
    // Promotion percent and computed promotional price
    promotionPercent: apiProduct.promotion ? Number(apiProduct.promotion) : 0,
    enPromotion: (apiProduct.promotion ? Number(apiProduct.promotion) : 0) > 0 || apiProduct.en_promotion,
    prixPromotion: apiProduct.promotion ? ( (typeof apiProduct.prix === 'string' ? parseFloat(apiProduct.prix) : apiProduct.prix) * (1 - Number(apiProduct.promotion) / 100) ) : undefined,
    tailles: mappedTailles,
    additionalImages: additionalImages.slice(0, 10), // Limit to 10 images
    couleurs: apiProduct.couleurs?.map((c): Couleur => ({
      nom: c.couleur,
      code: c.code_hexa,
      imageFront: apiProduct.image_avant || "/placeholder.svg",
      imageBack: apiProduct.image_arriere || "/placeholder.svg",
    })) || [],
  }
}

async function getProduct(id: string): Promise<Produit | null> {
  try {
    const { API_BASE_URL } = await import("@/lib/api")
    const response = await fetch(`${API_BASE_URL}/api/produits/${id}`, {
      cache: "no-store", // Always fetch fresh data
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data.success && data.data) {
      return convertAPIProduct(data.data)
    }
    
    return null
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export default async function ProduitPage({ params }: PageProps) {
  const { id } = await params
  const produit = await getProduct(id)

  if (!produit) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <DetailsProduit produit={produit} />
    </main>
  )
}
