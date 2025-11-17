import type { Produit } from "./types"

export const produits: Produit[] = [
  {
    id: "1",
    nom: "T-Shirt Arseet Classic",
    prix: 3500,
    description:
      "T-shirt streetwear minimaliste en coton premium. Design épuré avec logo Arseet brodé. Coupe moderne et confortable pour un style urbain authentique.",
    couleurs: [
      {
        nom: "Noir",
        code: "#000000",
        imageFront: "/black-streetwear-tshirt-front-minimal.jpg",
        imageBack: "/black-streetwear-tshirt-back-minimal.jpg",
      },
      {
        nom: "Blanc",
        code: "#FFFFFF",
        imageFront: "/white-streetwear-tshirt-front-minimal.jpg",
        imageBack: "/white-streetwear-tshirt-back-minimal.jpg",
      },
    ],
    categorie: "T-Shirts",
    nouveau: true,
    tailles: ["S", "M", "L", "XL"],
    stock: 50,
    enRupture: false,
  },
  {
    id: "2",
    nom: "Hoodie Arseet Urban",
    prix: 6500,
    description:
      "Hoodie streetwear premium avec capuche ajustable. Tissu épais et confortable, parfait pour le style urbain. Logo Arseet brodé sur la poitrine.",
    couleurs: [
      {
        nom: "Noir",
        code: "#000000",
        imageFront: "/black-streetwear-hoodie-front-minimal.jpg",
        imageBack: "/black-streetwear-hoodie-back-minimal.jpg",
      },
      {
        nom: "Gris",
        code: "#808080",
        imageFront: "/grey-streetwear-hoodie-front-minimal.jpg",
        imageBack: "/grey-streetwear-hoodie-back-minimal.jpg",
      },
    ],
    categorie: "Hoodies",
    nouveau: true,
    tailles: ["S", "M", "L", "XL", "XXL"],
    stock: 30,
    enRupture: false,
  },
  {
    id: "3",
    nom: "Pantalon Cargo Arseet",
    prix: 5500,
    description:
      "Pantalon cargo streetwear avec multiples poches. Coupe ample et confortable, style urbain moderne. Matière résistante et durable.",
    couleurs: [
      {
        nom: "Noir",
        code: "#000000",
        imageFront: "/black-cargo-pants-streetwear-front.jpg",
        imageBack: "/black-cargo-pants-streetwear-back.jpg",
      },
      {
        nom: "Beige",
        code: "#D2B48C",
        imageFront: "/beige-cargo-pants-streetwear-front.jpg",
        imageBack: "/beige-cargo-pants-streetwear-back.jpg",
      },
    ],
    categorie: "Pantalons",
    nouveau: false,
    tailles: ["S", "M", "L", "XL"],
    stock: 25,
    enRupture: false,
  },
]
