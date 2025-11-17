"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck, Package, MapPin, User, Mail, Phone, Download } from "lucide-react"
import { usePanierStore } from "@/lib/store"
import { useCompteStore } from "@/lib/compte-store"
import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api"
import jsPDF from "jspdf"
import Image from "next/image"
import { wilayaTarifs, getTarifForWilaya, type WilayaTarif } from "@/lib/wilaya-data"

export function LivraisonFacture() {
  const articles = usePanierStore((s) => s.articles)
  const sousTotal = usePanierStore((s) => s.totalPrix())
  const viderPanier = usePanierStore((s) => s.viderPanier)
  const ajouterCommande = useCompteStore((s) => s.ajouterCommande)

  const [etape, setEtape] = useState<"livraison" | "confirmation">("livraison")
  const [nom, setNom] = useState("")
  const [email, setEmail] = useState("")
  const [telephone, setTelephone] = useState("")
  const [adresse, setAdresse] = useState("")
  const [wilayaCode, setWilayaCode] = useState<number | null>(null)
  const [methodeLivraison, setMethodeLivraison] = useState<"domicile" | "guepex" | "yalidine">("domicile")
  const [modeLivraisonType, setModeLivraisonType] = useState<"express" | "economic">("express")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [commandeArticles, setCommandeArticles] = useState<typeof articles>([])
  const [commandeSousTotal, setCommandeSousTotal] = useState(0)
  const [commandeFraisLivraison, setCommandeFraisLivraison] = useState(0)
  const [commandeTotal, setCommandeTotal] = useState(0)
  const [commandeWilaya, setCommandeWilaya] = useState<WilayaTarif | null>(null)

  const selectedWilaya = wilayaCode ? wilayaTarifs.find((w) => w.code === wilayaCode) : null
  const fraisLivraison = selectedWilaya ? getTarifForWilaya(wilayaCode!, methodeLivraison, modeLivraisonType) || 0 : 0
  const total = sousTotal + fraisLivraison

  // Wrapper to avoid inline "as" type assertions inside JSX props
  const handleSetMethodeLivraison = (value: string) => {
    setMethodeLivraison(value as "domicile" | "guepex" | "yalidine")
  }

  // Professional invoice PDF generator
  const generatePDFBlob = async (
    articlesToUse: typeof articles,
    sousTotalToUse: number,
    fraisLivraisonToUse: number,
    totalToUse: number,
    wilayaToUse: WilayaTarif | null
  ): Promise<Blob> => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageWidth = 210
    const margin = 20
    let y = 20

    // Header - Invoice Title
    pdf.setFillColor(0, 0, 0)
    pdf.rect(0, 0, pageWidth, 40, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(28)
    pdf.setFont('helvetica', 'bold')
    pdf.text("FACTURE", margin, 25)
    
    // Invoice Number and Date
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const invoiceNum = `N° ${Date.now().toString().slice(-8)}`
    const invoiceDate = new Date().toLocaleDateString('fr-FR')
    pdf.text(invoiceNum, pageWidth - margin, 20, { align: 'right' })
    pdf.text(`Date: ${invoiceDate}`, pageWidth - margin, 27, { align: 'right' })

    y = 50
    pdf.setTextColor(0, 0, 0)

    // Company Info (ARSEET)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text("ARSEET", margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    y += 5
    pdf.text("arseetwear@gmail.com", margin, y)
    
    // Customer Information
    y += 10
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text("FACTURÉ À:", margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    y += 6
    pdf.text(nom, margin, y)
    y += 5
    pdf.text(telephone, margin, y)
    y += 5
    pdf.text(email, margin, y)
    y += 5
    pdf.text(adresse, margin, y)
    y += 5
    pdf.text(wilayaToUse?.nom || '', margin, y)

    // Delivery Method
    y += 10
    pdf.setFont('helvetica', 'bold')
    pdf.text("MÉTHODE DE LIVRAISON:", margin, y)
    pdf.setFont('helvetica', 'normal')
    y += 5
    const deliveryMethod = methodeLivraison === "domicile" ? "Livraison à domicile" : 
                          methodeLivraison === "guepex" ? "Bureau Guepex" : "Bureau Yalidine"
    const deliverySpeed = modeLivraisonType === "express" ? "Express" : "Économique"
    pdf.text(`${deliveryMethod} - ${deliverySpeed}`, margin, y)

    // Table Header
    y += 15
    pdf.setFillColor(240, 240, 240)
    pdf.rect(margin, y - 5, pageWidth - 2 * margin, 8, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text("ARTICLE", margin + 2, y)
    pdf.text("QTÉ", pageWidth - 80, y)
    pdf.text("PRIX UNIT.", pageWidth - 55, y)
    pdf.text("TOTAL", pageWidth - margin - 2, y, { align: 'right' })

    // Table Items
    y += 8
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    
    articlesToUse.forEach((article) => {
      const prixUnitaire = typeof article.prix === 'number' ? article.prix : article.produit.prix
      const totalLigne = prixUnitaire * article.quantite
      
      // Product name and details
      let productName = article.produit.nom
      if (article.couleur?.nom) productName += ` - ${article.couleur.nom}`
      if (article.taille) productName += ` (${article.taille})`
      
      pdf.text(productName, margin + 2, y)
      pdf.text(article.quantite.toString(), pageWidth - 80, y)
      pdf.text(`${Math.round(prixUnitaire)} DA`, pageWidth - 55, y)
      pdf.text(`${Math.round(totalLigne)} DA`, pageWidth - margin - 2, y, { align: 'right' })
      
      y += 6
    })

    // Separator line
    y += 2
    pdf.setDrawColor(200, 200, 200)
    pdf.line(margin, y, pageWidth - margin, y)
    
    // Totals Section
    y += 8
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    
    // Subtotal
    pdf.text("Sous-total:", pageWidth - 70, y)
    pdf.text(`${Math.round(sousTotalToUse)} DA`, pageWidth - margin - 2, y, { align: 'right' })
    
    y += 6
    pdf.text("Frais de livraison:", pageWidth - 70, y)
    pdf.text(`${Math.round(fraisLivraisonToUse)} DA`, pageWidth - margin - 2, y, { align: 'right' })
    
    // Total with black background
    y += 8
    pdf.setFillColor(0, 0, 0)
    pdf.rect(pageWidth - 90, y - 5, 70, 10, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.text("TOTAL:", pageWidth - 70, y)
    pdf.text(`${Math.round(totalToUse)} DA`, pageWidth - margin - 2, y, { align: 'right' })
    
    // Footer with logo and contact info
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    const footerY = 280
    
    // Footer line
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.5)
    pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10)
    
    // Footer text
    pdf.text("ARSEET - Streetwear algérien", pageWidth / 2, footerY, { align: 'center' })
    pdf.text("Email: arseetwear@gmail.com", pageWidth / 2, footerY + 5, { align: 'center' })
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(7)
    pdf.text("Merci pour votre commande!", pageWidth / 2, footerY + 10, { align: 'center' })

    return pdf.output("blob")
  }

  const handleConfirmerCommande = async () => {
    try {
      setIsSubmitting(true)
      setCommandeArticles([...articles])
      setCommandeSousTotal(sousTotal)
      setCommandeFraisLivraison(fraisLivraison)
      setCommandeTotal(total)
      setCommandeWilaya(selectedWilaya || null)

      const pdfBlob = await generatePDFBlob(articles, sousTotal, fraisLivraison, total, selectedWilaya || null)

      const articlesPayload = articles.map((article) => ({
        produit_id: typeof article.produit.id === "string" ? parseInt(article.produit.id, 10) : article.produit.id,
        quantite: Number(article.quantite) || 0,
        prix_unitaire: typeof article.prix === "number" ? article.prix : article.produit.prix,
        ...(article.taille ? { taille: article.taille } : {}),
        ...(article.couleur && article.couleur.nom ? { couleur: String(article.couleur.nom) } : {}),
      }))

      const orderBody: Record<string, any> = {
        nom_complet: nom,
        email,
        telephone,
        adresse_livraison: adresse,
        ville: selectedWilaya?.nom || "",
        wilaya: selectedWilaya?.nom || "",
        methode_livraison: methodeLivraison,
        mode_livraison: modeLivraisonType,
        notes: notes || "",
        frais_livraison: Math.round(fraisLivraison),
        prix_soumis: Number(sousTotal.toFixed(2)),
        articles: articlesPayload,
      }

      const formData = new FormData()
      Object.entries(orderBody).forEach(([k, v]) => {
        if (k === "articles") formData.append("articles", JSON.stringify(v))
        else formData.append(k, String(v))
      })
      formData.append("facture", pdfBlob, `Facture_${Date.now()}.pdf`)

      const url = `${API_BASE_URL}/api/commandes`
      const token = getAuthToken()
      const headers: HeadersInit = {}
      if (token) headers["Authorization"] = `Bearer ${token}`

      const response = await fetch(url, { method: "POST", headers, body: formData })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur ${response.status}`)
      }
      const result = await response.json()

      ajouterCommande({
        id: result.data?.id?.toString() || `CMD${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        total,
        statut: "En cours",
      })

      viderPanier()
      setEtape("confirmation")
    } catch (err: any) {
      console.error(err)
      alert(err?.message || "Erreur lors de la création de la commande")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTelechargerFacture = async () => {
    const articlesToUse = commandeArticles.length > 0 ? commandeArticles : articles
    const sousTotalToUse = commandeArticles.length > 0 ? commandeSousTotal : sousTotal
    const fraisLivraisonToUse = commandeArticles.length > 0 ? commandeFraisLivraison : fraisLivraison
    const totalToUse = commandeArticles.length > 0 ? commandeTotal : total
    const wilayaToUse = commandeArticles.length > 0 ? commandeWilaya : selectedWilaya

    const blob = await generatePDFBlob(articlesToUse, sousTotalToUse, fraisLivraisonToUse, totalToUse, wilayaToUse || null)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Facture_Arseet_${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (articles.length === 0 && etape !== "confirmation") {
    return (
      <div className="py-12 text-center animate-fade-in">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">Votre panier est vide</h2>
        <p className="text-muted-foreground">Ajoutez des produits pour continuer</p>
      </div>
    )
  }

  if (etape === "confirmation") {
    return (
      <div className="mx-auto max-w-2xl text-center animate-fade-in">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black mx-auto animate-slide-in">
          <Package className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-black">Commande soumise</h1>
        <p className="mb-8 text-lg text-black">Commande soumise. Un conseiller vous appellera pour la confirmer.</p>
        <Card className="mb-8 text-left">
          <CardHeader>
            <CardTitle>Détails de la commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant total</span>
              <span className="font-semibold">{commandeTotal.toLocaleString()} DZD</span>
            </div>
            <Separator />
            <div>
              <p className="mb-1 font-semibold">Adresse de livraison</p>
              <p className="text-sm text-muted-foreground">{nom}</p>
              <p className="text-sm text-muted-foreground">{adresse}</p>
              <p className="text-sm text-muted-foreground">{commandeWilaya?.nom}</p>
            </div>
            <div>
              <p className="mb-1 font-semibold">Méthode de livraison</p>
              <p className="text-sm text-muted-foreground">{methodeLivraison === "domicile" ? "Livraison à domicile" : methodeLivraison === "guepex" ? "Livraison au bureau (Guepex)" : "Livraison au bureau (Yalidine)"}</p>
              <p className="text-sm text-muted-foreground">Mode: {modeLivraisonType === "express" ? "Express" : "Économique"}</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 justify-center">
          <Button size="lg" variant="outline" onClick={handleTelechargerFacture} className="rounded-xl bg-transparent border-black text-black">
            <Download className="mr-2 h-4 w-4" />
            Télécharger la facture
          </Button>
          <Button size="lg" onClick={() => (window.location.href = "/")} className="rounded-xl bg-black text-white">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Finaliser la commande</h1>
        <p className="text-muted-foreground">Complétez vos informations de livraison</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="animate-slide-in">
            <CardHeader>
              <CardTitle>Informations de livraison</CardTitle>
              <CardDescription>Où souhaitez-vous recevoir votre commande?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nom">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} className="pl-10 rounded-xl" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="telephone" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="pl-10 rounded-xl" required />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} className="pl-10 rounded-xl" required />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="wilaya">Wilaya</Label>
                  <Select value={wilayaCode?.toString()} onValueChange={(value) => setWilayaCode(Number(value))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sélectionnez votre wilaya" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {wilayaTarifs.map((wilaya) => {
                        const isAvailable = 
                          wilaya.expressDomicile !== null || wilaya.expressBureau !== null ||
                          wilaya.economicDomicile !== null || wilaya.economicBureau !== null
                        return (
                          <SelectItem key={wilaya.code} value={wilaya.code.toString()} disabled={!isAvailable}>
                            <div className="flex items-center justify-between gap-2">
                              <span className={!isAvailable ? "text-gray-400" : ""}>{String(wilaya.code).padStart(2, "0")} - {wilaya.nom}</span>
                              {!isAvailable && <span className="text-xs text-gray-400">(Indisponible)</span>}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Livraison le matin si possible..." className="rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mode de livraison</CardTitle>
              <CardDescription>Choisissez votre option de livraison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Vitesse de livraison</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={modeLivraisonType === "economic" ? "default" : "outline"}
                    onClick={() => setModeLivraisonType("economic")}
                    className="w-full"
                  >
                    Économique
                  </Button>
                  <Button
                    type="button"
                    variant={modeLivraisonType === "express" ? "default" : "outline"}
                    onClick={() => setModeLivraisonType("express")}
                    className="w-full"
                  >
                    Express
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type de livraison</Label>
                <RadioGroup value={methodeLivraison} onValueChange={handleSetMethodeLivraison}>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem 
                      value="domicile" 
                      id="domicile"
                      disabled={
                        !selectedWilaya || 
                        (modeLivraisonType === "express" && selectedWilaya.expressDomicile === null) ||
                        (modeLivraisonType === "economic" && selectedWilaya.economicDomicile === null)
                      }
                    />
                    <Label htmlFor="domicile" className="flex-1 cursor-pointer">
                      <div className="font-medium">Livraison à domicile</div>
                      <div className="text-sm text-muted-foreground">Livraison directe chez vous</div>
                    </Label>
                    <span className="font-semibold">
                      {selectedWilaya && modeLivraisonType === "express" && selectedWilaya.expressDomicile 
                        ? `${selectedWilaya.expressDomicile} DA` 
                        : selectedWilaya && modeLivraisonType === "economic" && selectedWilaya.economicDomicile
                        ? `${selectedWilaya.economicDomicile} DA`
                        : "Indisponible"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem 
                      value="guepex" 
                      id="guepex"
                      disabled={
                        !selectedWilaya || 
                        (modeLivraisonType === "express" && selectedWilaya.expressBureau === null) ||
                        (modeLivraisonType === "economic" && selectedWilaya.economicBureau === null)
                      }
                    />
                    <Label htmlFor="guepex" className="flex-1 cursor-pointer">
                      <div className="font-medium">Livraison au bureau (Guepex)</div>
                      <div className="text-sm text-muted-foreground">Retrait au bureau partenaire Guepex</div>
                    </Label>
                    <span className="font-semibold">
                      {selectedWilaya && modeLivraisonType === "express" && selectedWilaya.expressBureau
                        ? `${selectedWilaya.expressBureau} DA` 
                        : selectedWilaya && modeLivraisonType === "economic" && selectedWilaya.economicBureau
                        ? `${selectedWilaya.economicBureau} DA`
                        : "Indisponible"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem 
                      value="yalidine" 
                      id="yalidine"
                      disabled={
                        !selectedWilaya || 
                        (modeLivraisonType === "express" && selectedWilaya.expressBureau === null) ||
                        (modeLivraisonType === "economic" && selectedWilaya.economicBureau === null)
                      }
                    />
                    <Label htmlFor="yalidine" className="flex-1 cursor-pointer">
                      <div className="font-medium">Livraison au bureau (Yalidine)</div>
                      <div className="text-sm text-muted-foreground">Retrait au bureau partenaire Yalidine</div>
                    </Label>
                    <span className="font-semibold">
                      {selectedWilaya && modeLivraisonType === "express" && selectedWilaya.expressBureau
                        ? `${selectedWilaya.expressBureau} DA` 
                        : selectedWilaya && modeLivraisonType === "economic" && selectedWilaya.economicBureau
                        ? `${selectedWilaya.economicBureau} DA`
                        : "Indisponible"}
                    </span>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full rounded-xl transition-all hover:scale-[1.02]" onClick={handleConfirmerCommande} disabled={!nom || !email || !telephone || !adresse || !wilayaCode || fraisLivraison === 0 || isSubmitting}>
            <Truck className="mr-2 h-5 w-5" />
            {isSubmitting ? "Envoi en cours..." : "Confirmer la commande"}
          </Button>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4 animate-fade-in">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {articles.map((article, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-secondary">
                      <Image src={article.couleur.imageFront || "/placeholder.svg"} alt={article.produit.nom} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{article.produit.nom}</p>
                      <p className="text-xs text-muted-foreground">{article.couleur.nom} × {article.quantite}</p>
                      <p className="text-sm font-semibold">{((typeof article.prix === 'number' ? article.prix : article.produit.prix) * article.quantite).toLocaleString()} DZD</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{sousTotal.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>{fraisLivraison.toLocaleString()} DZD</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{total.toLocaleString()} DZD</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
