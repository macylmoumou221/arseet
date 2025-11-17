export interface WilayaTarif {
  code: number
  nom: string
  // Express tarifs
  expressDomicile: number | null
  expressBureau: number | null
  // Economic tarifs
  economicDomicile: number | null
  economicBureau: number | null
}

export const wilayaTarifs: WilayaTarif[] = [
  { code: 1, nom: "Adrar", expressDomicile: 1050, expressBureau: 850, economicDomicile: 1650, economicBureau: 1550 },
  { code: 2, nom: "Chlef", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 3, nom: "Laghouat", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
  { code: 4, nom: "Oum El Bouaghi", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 5, nom: "Batna", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 6, nom: "Béjaïa", expressDomicile: 700, expressBureau: 550, economicDomicile: 550, economicBureau: 450 },
  { code: 7, nom: "Biskra", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
  { code: 8, nom: "Béchar", expressDomicile: 1050, expressBureau: 850, economicDomicile: 1650, economicBureau: 1550 },
  { code: 9, nom: "Blida", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 10, nom: "Bouira", expressDomicile: 700, expressBureau: 550, economicDomicile: 550, economicBureau: 450 },
  { code: 11, nom: "Tamanrasset", expressDomicile: 1600, expressBureau: 1400, economicDomicile: 1650, economicBureau: 1550 },
  { code: 12, nom: "Tébessa", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
  { code: 13, nom: "Tlemcen", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 14, nom: "Tiaret", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 15, nom: "Tizi Ouzou", expressDomicile: 590, expressBureau: 450, economicDomicile: 500, economicBureau: 400 },
  { code: 16, nom: "Alger", expressDomicile: 700, expressBureau: 550, economicDomicile: 550, economicBureau: 450 },
  { code: 17, nom: "Djelfa", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
  { code: 18, nom: "Jijel", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 19, nom: "Sétif", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 20, nom: "Saïda", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 21, nom: "Skikda", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 22, nom: "Sidi Bel Abbès", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 23, nom: "Annaba", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 24, nom: "Guelma", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 25, nom: "Constantine", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 26, nom: "Médéa", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 27, nom: "Mostaganem", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 28, nom: "M'Sila", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 29, nom: "Mascara", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 30, nom: "Ouargla", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
  { code: 31, nom: "Oran", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 32, nom: "El Bayadh", expressDomicile: 1050, expressBureau: 850, economicDomicile: 1650, economicBureau: 1550 },
  { code: 33, nom: "Illizi", expressDomicile: 1600, expressBureau: 1400, economicDomicile: 1650, economicBureau: 1550 },
  { code: 34, nom: "Bordj Bou Arreridj", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 35, nom: "Boumerdès", expressDomicile: 700, expressBureau: 550, economicDomicile: 550, economicBureau: 450 },
  { code: 36, nom: "El Tarf", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 37, nom: "Tindouf", expressDomicile: 1600, expressBureau: 1400, economicDomicile: 1650, economicBureau: 1550 },
  { code: 38, nom: "Tissemsilt", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 39, nom: "El Oued", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
  { code: 40, nom: "Khenchela", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 41, nom: "Souk Ahras", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 42, nom: "Tipaza", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 43, nom: "Mila", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 44, nom: "Aïn Defla", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 45, nom: "Naâma", expressDomicile: 1050, expressBureau: 850, economicDomicile: 1650, economicBureau: 1550 },
  { code: 46, nom: "Aïn Témouchent", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 47, nom: "Ghardaïa", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
  { code: 48, nom: "Relizane", expressDomicile: 900, expressBureau: 650, economicDomicile: 700, economicBureau: 600 },
  { code: 49, nom: "Timimoun", expressDomicile: 1050, expressBureau: 850, economicDomicile: 1650, economicBureau: 1550 },
  { code: 50, nom: "Bordj Badji Mokhtar", expressDomicile: 1050, expressBureau: 850, economicDomicile: 1650, economicBureau: 1550 },
  { code: 51, nom: "Ouled Djellal", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
  { code: 52, nom: "Béni Abbès", expressDomicile: 1050, expressBureau: 850, economicDomicile: 1650, economicBureau: 1550 },
  { code: 53, nom: "In Salah", expressDomicile: 1600, expressBureau: 1400, economicDomicile: 1650, economicBureau: 1550 },
  { code: 54, nom: "In Guezzam", expressDomicile: 1600, expressBureau: 1400, economicDomicile: 1650, economicBureau: 1550 },
  { code: 55, nom: "Touggourt", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
  { code: 56, nom: "Djanet", expressDomicile: 1600, expressBureau: 1400, economicDomicile: 1650, economicBureau: 1550 },
  { code: 57, nom: "El M'Ghair", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
  { code: 58, nom: "El Menia", expressDomicile: 950, expressBureau: 750, economicDomicile: 850, economicBureau: 700 },
]

export const getWilayaByCode = (code: number): WilayaTarif | undefined => {
  return wilayaTarifs.find(w => w.code === code)
}

export const getWilayaByName = (nom: string): WilayaTarif | undefined => {
  return wilayaTarifs.find(w => w.nom.toLowerCase() === nom.toLowerCase())
}

export const getAvailableWilayas = (): WilayaTarif[] => {
  return wilayaTarifs.filter(w => 
    w.expressDomicile !== null || w.expressBureau !== null || 
    w.economicDomicile !== null || w.economicBureau !== null
  )
}

/**
 * Get tarif based on wilaya, delivery method, and speed
 * @param code - Wilaya code
 * @param methodeLivraison - "domicile" | "guepex" | "yalidine"
 * @param modeLivraisonType - "express" | "economic"
 */
export const getTarifForWilaya = (
  code: number, 
  methodeLivraison: "domicile" | "guepex" | "yalidine", 
  modeLivraisonType: "express" | "economic"
): number | null => {
  const wilaya = getWilayaByCode(code)
  if (!wilaya) return null
  
  const isDomicile = methodeLivraison === "domicile"
  const isExpress = modeLivraisonType === "express"
  
  if (isExpress) {
    return isDomicile ? wilaya.expressDomicile : wilaya.expressBureau
  } else {
    return isDomicile ? wilaya.economicDomicile : wilaya.economicBureau
  }
}
