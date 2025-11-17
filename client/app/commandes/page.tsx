"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Package, Truck, MapPin, Calendar, Loader2, FileText, Download, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getAuthToken } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api"
import { Notification } from "@/components/ui/notification"

type OrderStatus = "en_attente" | "confirmee" | "expedie" | "livree" | "annulee"

interface OrderItem {
  id: number
  commande_id: number
  produit_id: number
  nom_produit: string
  prix_unitaire: string
  quantite: number
  taille: string
  couleur: string
  sous_total: string
  produit: {
    id: number
    nom: string
    image_avant: string
  }
}

interface Order {
  id: number
  user_id: number
  nom_complet: string
  email: string
  telephone: string
  adresse_livraison: string
  ville: string
  code_postal: string
  wilaya: string
  methode_livraison: string
  frais_livraison: string
  sous_total: string
  total: string
  statut: OrderStatus
  numero_suivi: string | null
  notes: string | null
  facture: string | null  // Backend returns 'facture' field
  date_creation: string
  date_mise_a_jour: string
  date_livraison: string | null
  articles: OrderItem[]
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDeliveryOpen, setConfirmDeliveryOpen] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const { toast } = useToast()
  
  // Notification states
  const [showNotification, setShowNotification] = useState(false)
  const [notifType, setNotifType] = useState<"success" | "error" | "info">("info")
  const [notifMessage, setNotifMessage] = useState("")

  const showNotif = (type: "success" | "error" | "info", message: string) => {
    console.log(`🔔 Notification ${type}:`, message)
    setNotifType(type)
    setNotifMessage(message)
    setShowNotification(true)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    console.log('🔄 Début fetch commandes...')
    try {
      setLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        console.log('❌ Pas de token d\'authentification')
        showNotif("error", "Vous devez être connecté pour voir vos commandes")
        return
      }

      const API_URL = API_BASE_URL
      console.log('📡 URL API:', `${API_URL}/api/commandes`)

      const response = await fetch(`${API_URL}/api/commandes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📥 Réponse status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur HTTP:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📦 Nombre de commandes reçues:', data.data?.commandes?.length || 0)
      console.log('📦 Données complètes:', JSON.stringify(data, null, 2))
      
      if (data.success && data.data?.commandes) {
        setOrders(data.data.commandes)
      } else {
        console.log('⚠️ Format de réponse inattendu:', data)
        setOrders([])
      }
    } catch (error: any) {
      console.error('❌ Erreur fetch commandes:', error)
      console.error('❌ Stack:', error.stack)
      showNotif("error", "Impossible de charger vos commandes")
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = async (order: Order) => {
    console.log('📥 Début téléchargement facture pour commande:', order.id)
    console.log('📦 Données de la commande:', {
      id: order.id,
      facture: order.facture,
      statut: order.statut
    })
    
    if (!order.facture) {
      console.error('❌ Pas d\'URL de facture disponible pour commande', order.id)
      showNotif("error", "Facture non disponible")
      return
    }
    
    try {
      console.log('📡 URL de téléchargement Firebase:', order.facture)
      
      // Direct download using anchor tag to avoid CORS issues
      const a = document.createElement('a')
      a.href = order.facture
      a.download = `Facture_Commande_${order.id}.pdf`
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      console.log('🔗 Début du téléchargement...')
      a.click()
      document.body.removeChild(a)

      console.log('✅ Facture téléchargée avec succès')
      showNotif("success", "Votre facture a été téléchargée avec succès")
    } catch (error: any) {
      console.error('❌ Erreur téléchargement facture:', error)
      console.error('❌ Stack trace:', error.stack)
      showNotif("error", error.message || "Impossible de télécharger la facture")
    }
  }

  const handleMarkAsDelivered = async () => {
    if (!selectedOrderId) return

    try {
      const token = getAuthToken()
      const API_URL = API_BASE_URL

      const response = await fetch(`${API_URL}/api/commandes/${selectedOrderId}/statut`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: 'livree' }),
      })

      if (response.ok) {
        showNotif("success", "Commande marquée comme livrée")
        fetchOrders()
      } else {
        showNotif("error", "Erreur lors de la mise à jour")
      }
    } catch (error) {
      showNotif("error", "Erreur de connexion au serveur")
    } finally {
      setConfirmDeliveryOpen(false)
      setSelectedOrderId(null)
    }
  }

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return
    
    console.log('❌ Annulation commande:', selectedOrderId)
    const order = orders.find(o => o.id === selectedOrderId)
    console.log('📦 Statut actuel:', order?.statut)

    // Validate cancellation conditions
    if (order?.statut === 'livree') {
      showNotif("error", "Impossible d'annuler une commande déjà livrée")
      setConfirmCancelOpen(false)
      return
    }

    if (order?.statut === 'annulee') {
      showNotif("info", "Cette commande est déjà annulée")
      setConfirmCancelOpen(false)
      return
    }

    try {
      const token = getAuthToken()
      const API_URL = API_BASE_URL
      console.log('📡 URL:', `${API_URL}/api/commandes/${selectedOrderId}/statut`)

      const response = await fetch(`${API_URL}/api/commandes/${selectedOrderId}/statut`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: 'annulee' }),
      })

      console.log('📥 Status réponse:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Commande annulée avec succès:', data)
        showNotif("success", "Commande annulée avec succès")
        fetchOrders()
      } else {
        const errorData = await response.json()
        console.error('❌ Erreur annulation:', errorData)
        showNotif("error", errorData.message || "Erreur lors de l'annulation")
      }
    } catch (error: any) {
      console.error('❌ Erreur annulation commande:', error)
      showNotif("error", "Erreur de connexion au serveur")
    } finally {
      setConfirmCancelOpen(false)
      setSelectedOrderId(null)
    }
  }

  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case "en_attente":
        return "En attente"
      case "confirmee":
        return "Confirmée"
      case "expedie":
        return "Expédiée"
      case "livree":
        return "Livrée"
      case "annulee":
        return "Annulée"
      default:
        return status
    }
  }

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case "en_attente":
        return "bg-gray-100 text-gray-900 border border-gray-300"
      case "confirmee":
        return "bg-black text-white"
      case "expedie":
        return "bg-gray-800 text-white"
      case "livree":
        return "bg-black text-white border-2 border-black"
      case "annulee":
        return "bg-white text-black border border-black"
      default:
        return "bg-gray-100 text-gray-900"
    }
  }

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return `${numPrice.toLocaleString('fr-FR')} DZD`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeliveryMethodLabel = (method: string): string => {
    switch (method) {
      case "domicile":
        return "Livraison à domicile"
      case "zr_express":
        return "ZR Express"
      case "yalidine":
        return "Yalidine"
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Notification
        show={showNotification}
        type={notifType}
        message={notifMessage}
        duration={5000}
        onClose={() => setShowNotification(false)}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Commandes</h1>
          <p className="text-gray-600">Suivez l'état de vos commandes et téléchargez vos factures</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore passé de commande</p>
              <Link href="/produits">
                <Button>Découvrir nos produits</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">Commande #{order.id}</CardTitle>
                      <CardDescription className="mt-1">
                        Passée le {formatDate(order.date_creation)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.statut)}>
                      {getStatusLabel(order.statut)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Articles List */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-900">Articles commandés</h4>
                    {order.articles.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                          <Image
                            src={item.produit?.image_avant || "/placeholder.svg"}
                            alt={item.nom_produit}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 truncate">{item.nom_produit}</h5>
                          <p className="text-sm text-gray-600">
                            Taille: {item.taille} • Couleur: {item.couleur}
                          </p>
                          <p className="text-sm text-gray-600">Quantité: {item.quantite}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900">{formatPrice(item.sous_total)}</p>
                          <p className="text-sm text-gray-600">{formatPrice(item.prix_unitaire)} / pièce</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Adresse de livraison</p>
                        <p className="text-gray-600">{order.adresse_livraison}</p>
                        <p className="text-gray-600">{order.ville}, {order.wilaya} {order.code_postal}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Truck className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Mode de livraison</p>
                        <p className="text-gray-600">{getDeliveryMethodLabel(order.methode_livraison)}</p>
                        <p className="text-gray-600">{formatPrice(order.frais_livraison)}</p>
                      </div>
                    </div>
                    {order.numero_suivi && (
                      <div className="flex items-start gap-2 text-sm">
                        <Package className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Numéro de suivi</p>
                          <p className="text-gray-600">{order.numero_suivi}</p>
                        </div>
                      </div>
                    )}
                    {order.notes && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Notes</p>
                          <p className="text-gray-600">{order.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Total and Actions */}
                  <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-600">
                        Sous-total: {formatPrice(order.sous_total)}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        Total: {formatPrice(order.total)}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      {order.statut === "en_attente" && (
                        <Button 
                          variant="outline" 
                          className="flex-1 sm:flex-initial border-black text-black hover:bg-black hover:text-white"
                          onClick={() => {
                            setSelectedOrderId(order.id)
                            setConfirmCancelOpen(true)
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="flex-1 sm:flex-initial border-black text-black hover:bg-black hover:text-white"
                        onClick={() => downloadInvoice(order)}
                        disabled={!order.facture}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger la facture
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Confirmation Dialog */}
      <AlertDialog open={confirmDeliveryOpen} onOpenChange={setConfirmDeliveryOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la réception</AlertDialogTitle>
            <AlertDialogDescription>
              Avez-vous bien reçu votre commande ? En confirmant, vous attestez avoir reçu tous les articles en bon état.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarkAsDelivered}
              className="bg-black text-white hover:bg-gray-800"
            >
              Oui, j'ai reçu ma commande
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Order Dialog */}
      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la commande</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Êtes-vous sûr de vouloir annuler cette commande ?</p>
                <div className="mt-3 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Cette action est irréversible. Veuillez contacter le service client pour toute demande de remboursement.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300">Non, garder ma commande</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelOrder}
              className="bg-black text-white hover:bg-gray-800"
            >
              Oui, annuler la commande
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
