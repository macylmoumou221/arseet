"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Package, ShoppingCart, X, Mail, Users, TrendingUp, DollarSign, Loader2, ChevronDown, ChevronUp, Search, Download, Info, Image as ImageIcon } from "lucide-react"
import { produits } from "@/lib/data"
import type { Produit } from "@/lib/types"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Notification } from "@/components/ui/notification"
import { getAuthToken, getUser } from "@/lib/auth"
import { API_BASE_URL } from "@/lib/api"

// API Types
interface DashboardStats {
  totalUtilisateurs: number
  totalCommandes: number
  totalProduits: number
  totalAbonnesNewsletter: number
  revenusMois: number
}

interface TopProduit {
  id: number
  nom: string
  prix: string
  stock: number
  ventes: number
}

interface ProduitAPI {
  id: number
  nom: string
  description: string
  prix: string
  prix_promo: string | null
  promotion: number
  categorie: string
  stock: number
  en_rupture: boolean
  est_nouveau: boolean
  image_avant: string | null
  image_arriere: string | null
  images: string[] | null
  date_creation: string
}

interface UserAPI {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string | null
  adresse: string | null
  ville: string | null
  code_postal: string | null
  est_admin: boolean
  est_actif: boolean
  email_verifie: boolean
  date_creation: string
  derniere_connexion: string | null
  updatedAt: string
}

interface NewsletterAbonne {
  id: number
  email: string
  est_actif: boolean
  date_inscription: string
  date_desinscription: string | null
  source: string | null
  preferences: any | null
}

interface NewsletterData {
  abonnes: NewsletterAbonne[]
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
  stats: {
    total_actifs: number
    total_inactifs: number
  }
}

type OrderStatus = "en_attente" | "confirmee" | "expediee" | "livree" | "annulee"

interface OrderArticle {
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

interface CommandeAPI {
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
  facture: string | null  // Changed from facture_url to match backend
  filename: string | null
  date_creation: string
  date_mise_a_jour: string
  date_livraison: string | null
  articles: OrderArticle[]
}

interface CommandesData {
  commandes: CommandeAPI[]
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

interface DashboardData {
  statistiques: DashboardStats
  commandesParStatut: any[]
  topProduits: TopProduit[]
  dernieresCommandes: any[]
  produits: ProduitAPI[]
}

const API_URL = `${API_BASE_URL}/api`

export function AdminDashboard() {
  const currentUser = getUser()
  const currentUserId = currentUser?.id

  // Debug: log user object to help QA after mount (ensure browser console shows it)
  useEffect(() => {
    try {
      console.log('>>> AdminDashboard - getUser() result:', getUser())
      console.log('>>> AdminDashboard - currentUser (cached):', currentUser)
      console.log('>>> AdminDashboard - currentUser.est_admin:', currentUser?.est_admin, 'type:', typeof currentUser?.est_admin)
    } catch (err) {
      console.error('AdminDashboard - logging failed', err)
    }
  }, [])

  // Keep a loading placeholder when user info is not yet available
  if (currentUser === undefined || currentUser === null) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Chargement...</h2>
        <p className="text-muted-foreground">Chargement des informations utilisateur...</p>
      </div>
    )
  }

  // Show access denied ONLY when est_admin is explicitly false
  // (If est_admin is missing/undefined or truthy, allow access)
  if (currentUser.est_admin === false) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
        <p className="text-muted-foreground">Seuls les administrateurs peuvent accéder au dashboard.</p>
      </div>
    )
  }
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [users, setUsers] = useState<UserAPI[]>([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersSearch, setUsersSearch] = useState("")
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersTotalPages, setUsersTotalPages] = useState(1)
  
  // (Déclaration déjà faite en haut, supprimée ici)
  
  // Newsletter states
  const [newsletterData, setNewsletterData] = useState<NewsletterData | null>(null)
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterPage, setNewsletterPage] = useState(1)
  
  // Commandes states
  const [commandesData, setCommandesData] = useState<CommandesData | null>(null)
  const [commandesLoading, setCommandesLoading] = useState(false)
  const [commandesPage, setCommandesPage] = useState(1)
  const [selectedCommande, setSelectedCommande] = useState<CommandeAPI | null>(null)
  const [commandeDetailsOpen, setCommandeDetailsOpen] = useState(false)
  const [updateStatutOpen, setUpdateStatutOpen] = useState(false)
  const [newStatut, setNewStatut] = useState<OrderStatus>("en_attente")
  const [numeroSuivi, setNumeroSuivi] = useState("")
  
  // Notification states
  const [showNotification, setShowNotification] = useState(false)
  const [notifType, setNotifType] = useState<"success" | "error" | "info" | "warning">("success")
  const [notifMessage, setNotifMessage] = useState("")
  
  // Product sorting
  const [sortField, setSortField] = useState<keyof ProduitAPI>("date_creation")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  // Dialogs
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [productFormLoading, setProductFormLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
  const [userToToggle, setUserToToggle] = useState<UserAPI | null>(null)
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false)
  const [toggleAdminDialogOpen, setToggleAdminDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserAPI | null>(null)
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false)

  // Form states
  const [nom, setNom] = useState("")
  const [prix, setPrix] = useState("")
  const [description, setDescription] = useState("")
  const [categorie, setCategorie] = useState("homme")
  const [stock, setStock] = useState("")
  const [imageFrontFile, setImageFrontFile] = useState<File | null>(null)
  const [imageBackFile, setImageBackFile] = useState<File | null>(null)
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [imageFrontPreview, setImageFrontPreview] = useState("")
  const [imageBackPreview, setImageBackPreview] = useState("")
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<{image_avant?: string, image_arriere?: string, images?: string[]}>({})
  const [enRupture, setEnRupture] = useState(false)
  const [enPromotion, setEnPromotion] = useState(false)
  const [estNouveau, setEstNouveau] = useState(false)
  const [pourcentagePromotion, setPourcentagePromotion] = useState("")
  
  // Couleurs and Tailles arrays
  const [couleurs, setCouleurs] = useState<{couleur: string, code_hexa: string}[]>([])
  const [tailles, setTailles] = useState<string[]>([])
  const [newCouleur, setNewCouleur] = useState("")
  const [newCodeHexa, setNewCodeHexa] = useState("#000000")
  const [newTaille, setNewTaille] = useState("")

  // Newsletter custom email states
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailImage, setEmailImage] = useState<File | null>(null)
  const [emailImagePreview, setEmailImagePreview] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)

  const showNotif = (type: "success" | "error" | "info" | "warning", message: string) => {
    setNotifType(type)
    setNotifMessage(message)
    setShowNotification(false)
    setTimeout(() => setShowNotification(true), 10)
  }

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeTab === "utilisateurs") {
      fetchUsers()
    }
  }, [activeTab, usersPage, usersSearch])

  // Fetch newsletter when newsletter tab is active
  useEffect(() => {
    if (activeTab === "newsletter") {
      fetchNewsletter()
    }
  }, [activeTab, newsletterPage])

  // Fetch commandes when commandes tab is active
  useEffect(() => {
    if (activeTab === "commandes") {
      fetchCommandes()
    }
  }, [activeTab, commandesPage])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setDashboardData(data.data)
      } else {
        showNotif("error", "Erreur lors du chargement des données")
      }
    } catch (error) {
      showNotif("error", "Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch(
        `${API_URL}/admin/users?page=${usersPage}&limit=20${usersSearch ? `&search=${usersSearch}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      if (data.success && data.data) {
        setUsers(data.data.users || [])
        setUsersTotal(data.data.pagination?.total || 0)
        setUsersTotalPages(data.data.pagination?.pages || 1)
      }
    } catch (error) {
      showNotif("error", "Erreur lors du chargement des utilisateurs")
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchNewsletter = async () => {
    setNewsletterLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch(
        `${API_URL}/admin/newsletter?page=${newsletterPage}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      if (data.success && data.data) {
        setNewsletterData(data.data)
      }
    } catch (error) {
      showNotif("error", "Erreur lors du chargement de la newsletter")
    } finally {
      setNewsletterLoading(false)
    }
  }

  const fetchCommandes = async () => {
    console.log('🔄 Admin - Début fetch commandes...')
    setCommandesLoading(true)
    try {
      const token = getAuthToken()
      console.log('📡 Appel API admin commandes:', `${API_URL}/admin/commandes?page=${commandesPage}`)
      
      const response = await fetch(
        `${API_URL}/admin/commandes?page=${commandesPage}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      
      console.log('📥 Réponse status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur HTTP admin commandes:', response.status, errorText)
        throw new Error(`Erreur ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 Admin - Commandes reçues:', data)
      console.log('📊 Nombre de commandes:', data.data?.commandes?.length || 0)
      
      if (data.success && data.data) {
        setCommandesData(data.data)
        console.log('✅ Commandes admin chargées avec succès')
      } else {
        console.warn('⚠️ Format de réponse inattendu:', data)
        showNotif("error", "Format de réponse invalide")
      }
    } catch (error: any) {
      console.error('❌ Erreur fetch commandes admin:', error)
      console.error('❌ Stack trace:', error.stack)
      showNotif("error", error.message || "Erreur lors du chargement des commandes")
    } finally {
      setCommandesLoading(false)
    }
  }

  const updateCommandeStatut = async () => {
    if (!selectedCommande) return

    console.log('🔄 Mise à jour statut commande:', selectedCommande.id, 'vers', newStatut)
    try {
      const token = getAuthToken()
      const body: any = { statut: newStatut }
      if (numeroSuivi.trim()) {
        body.numero_suivi = numeroSuivi.trim()
        console.log('📦 Numéro de suivi ajouté:', numeroSuivi.trim())
      }

      console.log('📡 Appel API update statut:', `${API_URL}/admin/commandes/${selectedCommande.id}/statut`)
      console.log('📤 Body:', body)

      const response = await fetch(`${API_URL}/admin/commandes/${selectedCommande.id}/statut`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      
      console.log('📥 Réponse status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur HTTP update statut:', response.status, errorText)
        throw new Error(`Erreur ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Réponse update statut:', data)
      
      if (data.success) {
        console.log('✅ Statut mis à jour avec succès')
        showNotif("success", "Statut de la commande mis à jour")
        setUpdateStatutOpen(false)
        setNumeroSuivi("")
        fetchCommandes()
      } else {
        console.warn('⚠️ Mise à jour échouée:', data.message)
        showNotif("error", data.message || "Erreur lors de la mise à jour")
      }
    } catch (error: any) {
      console.error('❌ Erreur update statut:', error)
      console.error('❌ Stack trace:', error.stack)
      showNotif("error", error.message || "Erreur de connexion au serveur")
    }
  }

  const confirmerCommande = async (commandeId: number) => {
    console.log('✅ Confirmation rapide commande:', commandeId)
    try {
      const token = getAuthToken()
      console.log('📡 Appel API confirmation:', `${API_URL}/admin/commandes/${commandeId}/confirmer`)
      
      const response = await fetch(`${API_URL}/admin/commandes/${commandeId}/confirmer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      console.log('📥 Réponse status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur HTTP confirmation:', response.status, errorText)
        throw new Error(`Erreur ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Réponse confirmation:', data)
      
      if (data.success) {
        console.log('✅ Commande confirmée avec succès')
        showNotif("success", "Commande confirmée")
        fetchCommandes()
      } else {
        console.warn('⚠️ Confirmation échouée:', data.message)
        showNotif("error", data.message || "Erreur lors de la confirmation")
      }
    } catch (error: any) {
      console.error('❌ Erreur confirmation commande:', error)
      console.error('❌ Stack trace:', error.stack)
      showNotif("error", error.message || "Erreur de connexion au serveur")
    }
  }

  const downloadCommandeInvoice = async (commande: CommandeAPI) => {
    console.log('📥 Admin - Début téléchargement facture commande:', commande.id)
    
    if (!commande.facture) {
      console.error('❌ Pas d\'URL de facture disponible')
      showNotif("error", "Facture non disponible")
      return
    }
    
    try {
      console.log('📡 URL de téléchargement:', commande.facture)
      console.log('📄 Nom du fichier:', commande.filename)

      // Téléchargement direct via anchor link (évite CORS)
      const a = document.createElement('a')
      a.href = commande.facture
      a.download = commande.filename || `Facture_Commande_${commande.id}.pdf`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      console.log('✅ Facture téléchargée avec succès')
      showNotif("success", "Facture téléchargée")
    } catch (error: any) {
      console.error('❌ Erreur téléchargement facture:', error)
      console.error('❌ Stack trace:', error.stack)
      showNotif("error", error.message || "Impossible de télécharger la facture")
    }
  }

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      en_attente: "En attente",
      confirmee: "Confirmée",
      expediee: "Expédiée",
      livree: "Livrée",
      annulee: "Annulée"
    }
    return labels[status] || status
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const toggleNewsletterSubscriber = async (id: number) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/newsletter/${id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        showNotif("success", data.message || "Statut modifié")
        fetchNewsletter()
      } else {
        showNotif("error", data.message || "Erreur lors de la modification")
      }
    } catch (error) {
      showNotif("error", "Erreur de connexion au serveur")
    }
  }

  const sendCustomEmail = async () => {
    // Validation
    if (!emailSubject.trim()) {
      showNotif("error", "Le sujet est requis")
      return
    }
    if (emailSubject.length > 200) {
      showNotif("error", "Le sujet ne peut pas dépasser 200 caractères")
      return
    }
    if (!emailMessage.trim()) {
      showNotif("error", "Le message est requis")
      return
    }
    if (emailMessage.length > 5000) {
      showNotif("error", "Le message ne peut pas dépasser 5000 caractères")
      return
    }

    setSendingEmail(true)
    try {
      const token = getAuthToken()
      const formData = new FormData()
      formData.append("subject", emailSubject.trim())
      formData.append("message", emailMessage.trim())
      if (emailImage) {
        formData.append("image", emailImage)
      }

      const response = await fetch(`${API_URL}/admin/newsletter/send-custom`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      
      const data = await response.json()
      if (data.success) {
        showNotif(
          "success",
          `Email envoyé avec succès à ${data.data.sent} abonné(s)${
            data.data.failed > 0 ? ` (${data.data.failed} échecs)` : ""
          }`
        )
        // Reset form
        setEmailSubject("")
        setEmailMessage("")
        setEmailImage(null)
        setEmailImagePreview("")
        setSendEmailDialogOpen(false)
      } else {
        showNotif("error", data.message || "Erreur lors de l'envoi")
      }
    } catch (error) {
      showNotif("error", "Erreur de connexion au serveur")
    } finally {
      setSendingEmail(false)
    }
  }

  const handleEmailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEmailImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEmailImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeEmailImage = () => {
    setEmailImage(null)
    setEmailImagePreview("")
  }

  const toggleUserAdmin = async (userId: number) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-admin`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        showNotif("success", data.message || "Statut admin modifié")
        fetchUsers()
      } else {
        showNotif("error", data.message || "Erreur lors de la modification")
      }
    } catch (error) {
      showNotif("error", "Erreur de connexion au serveur")
    }
  }

  const toggleUserActive = async (userId: number) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-actif`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        showNotif("success", data.message || "Statut modifié")
        fetchUsers()
      } else {
        showNotif("error", data.message || "Erreur lors de la modification")
      }
    } catch (error) {
      showNotif("error", "Erreur de connexion au serveur")
    }
  }

  const deleteUser = async (userId: number) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        showNotif("success", data.message || "Utilisateur supprimé")
        fetchUsers()
      } else {
        showNotif("error", data.message || "Erreur lors de la suppression")
      }
    } catch (error) {
      showNotif("error", "Erreur de connexion au serveur")
    }
  }

  const handleSort = (field: keyof ProduitAPI) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortedProducts = () => {
    if (!dashboardData?.produits) return []
    
    const sorted = [...dashboardData.produits].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (aVal === null) return 1
      if (bVal === null) return -1
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      }
      
      return 0
    })
    
    return sorted
  }

  const handleImageFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFrontFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageFrontPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageBackFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageBackPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setAdditionalImages([...additionalImages, ...files])
      
      // Generate previews
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setAdditionalPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index))
    setAdditionalPreviews(additionalPreviews.filter((_, i) => i !== index))
  }

  const handleAddProduct = async () => {
    if (!nom || !prix || !categorie || !stock) {
      showNotif("error", "Veuillez remplir tous les champs obligatoires")
      return
    }

    setProductFormLoading(true)
    try {
      const token = getAuthToken()
      const formData = new FormData()
      
      formData.append("nom", nom)
      formData.append("description", description)
      formData.append("prix", prix)
      formData.append("categorie", categorie)
      formData.append("stock", stock)
      formData.append("est_nouveau", estNouveau.toString())
      
      if (pourcentagePromotion && Number(pourcentagePromotion) > 0) {
        formData.append("promotion", pourcentagePromotion)
      }
      
      if (imageFrontFile) formData.append("image_avant", imageFrontFile)
      if (imageBackFile) formData.append("image_arriere", imageBackFile)
      
      additionalImages.forEach((file) => {
        formData.append("images", file)
      })
      
      if (couleurs.length > 0) {
        formData.append("couleurs", JSON.stringify(couleurs))
      }
      if (tailles.length > 0) {
        // Transform tailles from string[] to {taille: string}[]
        const taillesFormatted = tailles.map(t => ({ taille: t }))
        formData.append("tailles", JSON.stringify(taillesFormatted))
      }

      console.log("📤 Sending Product Data:")
      console.log("- Nom:", nom)
      console.log("- Prix:", prix)
      console.log("- Catégorie:", categorie)
      console.log("- Stock:", stock)
      console.log("- Est Nouveau:", estNouveau)
      console.log("- Promotion:", pourcentagePromotion)
      console.log("- Couleurs:", couleurs)
      console.log("- Tailles:", tailles)
      console.log("- Images Front:", imageFrontFile?.name)
      console.log("- Images Back:", imageBackFile?.name)
      console.log("- Additional Images:", additionalImages.length)

      console.log("🟡 handleAddProduct: About to send POST to", `${API_URL}/produits`)
      let response: Response | null = null
      try {
        response = await fetch(`${API_URL}/produits`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
        console.log("📥 Response Status:", response.status)
      } catch (err) {
        console.error("🔴 handleAddProduct: Fetch error", err)
        showNotif("error", "Erreur de connexion au serveur (produit)")
        setProductFormLoading(false)
        return
      }

      // Check if response is present and ok before parsing
      if (!response || !response.ok) {
        // Try to get error message from response
        let errorMessage = "Erreur lors de l'ajout du produit"
        try {
          const errorData = await response.json()
          console.error("❌ Error Response:", errorData)
          errorMessage = errorData.message || errorData.error || `Erreur ${response.status}`
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = `Erreur ${response.status}: ${response.statusText}`
        }
        showNotif("error", errorMessage)
        setProductFormLoading(false)
        return
      }

      const data = await response.json()
      console.log("📥 Response Data:", data)

      if (data.success) {
        showNotif("success", "Produit ajouté avec succès")
        setShowAddForm(false)
        resetForm()
        // Optimize: Don't refetch everything, just close form
        setTimeout(() => fetchDashboardData(), 500)
      } else {
        console.error("❌ Error adding product:", data)
        // Display backend error message (e.g., "File size exceeded 5MB")
        showNotif("error", data.message || data.error || "Erreur lors de l'ajout")
      }
    } catch (error: any) {
      console.error("❌ Exception adding product:", error)
      showNotif("error", error?.message || "Erreur de connexion au serveur")
    } finally {
      setProductFormLoading(false)
    }
  }

  const fetchProductForEdit = async (productId: number) => {
    setProductFormLoading(true)
    try {
      const response = await fetch(`${API_URL}/produits/${productId}`)
      const data = await response.json()
      
      console.log('📦 Fetched Product for Edit:', data)
      console.log('📦 Product Tailles:', data.data?.tailles)
      console.log('📦 Product Couleurs:', data.data?.couleurs)
      
      if (data.success) {
        const product = data.data
        setNom(product.nom || "")
        setDescription(product.description || "")
        setPrix(product.prix?.toString() || "")
        setCategorie(product.categorie || "homme")
        setStock(product.stock?.toString() || "")
        setEstNouveau(product.est_nouveau || false)
        setPourcentagePromotion(product.promotion?.toString() || "")
        setEnPromotion(product.promotion > 0)
        
        setExistingImages({
          image_avant: product.image_avant,
          image_arriere: product.image_arriere,
          images: product.images || []
        })
        
        // Handle couleurs - ensure it's in the right format
        const mappedCouleurs = (product.couleurs || []).map((c: any) => ({
          couleur: c.couleur || c.nom,
          code_hexa: c.code_hexa || c.code || "#000000"
        }))
        console.log('✅ Mapped Couleurs:', mappedCouleurs)
        setCouleurs(mappedCouleurs)
        
        // Handle tailles - ensure it's in the right format
        const mappedTailles = (product.tailles || []).map((t: any) => 
          typeof t === 'string' ? t : (t.taille || t)
        )
        console.log('✅ Mapped Tailles:', mappedTailles)
        setTailles(mappedTailles)
        
        setEditingProductId(productId)
        setShowAddForm(true)
      } else {
        showNotif("error", "Impossible de charger le produit")
      }
    } catch (error) {
      console.error('❌ Error fetching product:', error)
      showNotif("error", "Erreur de connexion au serveur")
    } finally {
      setProductFormLoading(false)
    }
  }

  const handleEditProduct = (productId: number) => {
    fetchProductForEdit(productId)
  }

  const handleUpdateProduct = async () => {
    if (!editingProductId || !nom || !prix || !categorie || !stock) {
      showNotif("error", "Veuillez remplir tous les champs obligatoires")
      return
    }

    setProductFormLoading(true)
    try {
      const token = getAuthToken()
      const formData = new FormData()
      
      formData.append("nom", nom)
      formData.append("description", description)
      formData.append("prix", prix)
      formData.append("categorie", categorie)
      formData.append("stock", stock)
      formData.append("est_nouveau", estNouveau.toString())
      
      if (pourcentagePromotion && Number(pourcentagePromotion) > 0) {
        formData.append("promotion", pourcentagePromotion)
      }
      
      if (imageFrontFile) formData.append("image_avant", imageFrontFile)
      if (imageBackFile) formData.append("image_arriere", imageBackFile)
      
      additionalImages.forEach((file) => {
        formData.append("images", file)
      })
      
      if (couleurs.length > 0) {
        formData.append("couleurs", JSON.stringify(couleurs))
      }
      if (tailles.length > 0) {
        // Transform tailles from string[] to {taille: string}[]
        const taillesFormatted = tailles.map(t => ({ taille: t }))
        formData.append("tailles", JSON.stringify(taillesFormatted))
      }

      console.log("📤 Updating Product #", editingProductId)
      console.log("- Nom:", nom)
      console.log("- Prix:", prix)
      console.log("- Catégorie:", categorie)
      console.log("- Stock:", stock)
      console.log("- Couleurs:", couleurs)
      console.log("- Tailles:", tailles)

      const response = await fetch(`${API_URL}/produits/${editingProductId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      console.log("📥 Response Status:", response.status)
      
      // Check if response is ok before parsing
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Erreur lors de la mise à jour"
        try {
          const errorData = await response.json()
          console.error("❌ Error Response:", errorData)
          errorMessage = errorData.message || errorData.error || `Erreur ${response.status}`
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = `Erreur ${response.status}: ${response.statusText}`
        }
        showNotif("error", errorMessage)
        setProductFormLoading(false)
        return
      }

      const data = await response.json()
      console.log("📥 Response Data:", data)

      if (data.success) {
        showNotif("success", "Produit mis à jour avec succès")
        setShowAddForm(false)
        resetForm()
        // Optimize: Delayed refresh
        setTimeout(() => fetchDashboardData(), 500)
      } else {
        console.error("❌ Error updating product:", data)
        // Display backend error message
        showNotif("error", data.message || data.error || "Erreur lors de la mise à jour")
      }
    } catch (error: any) {
      console.error("❌ Exception updating product:", error)
      showNotif("error", error?.message || "Erreur de connexion au serveur")
    } finally {
      setProductFormLoading(false)
    }
  }

  const handleDeleteProduct = (productId: number) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/produits/${productToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        showNotif("success", "Produit supprimé avec succès")
        fetchDashboardData()
      } else {
        showNotif("error", data.message || "Erreur lors de la suppression")
      }
    } catch (error) {
      showNotif("error", "Erreur de connexion au serveur")
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const toggleRupture = async (productId: number, currentStatus: boolean) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/produits/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ en_rupture: !currentStatus }),
      })

      const data = await response.json()
      if (data.success) {
        showNotif("success", "Statut mis à jour")
        fetchDashboardData()
      } else {
        showNotif("error", data.message || "Erreur")
      }
    } catch (error) {
      showNotif("error", "Erreur de connexion au serveur")
    }
  }

  const resetForm = () => {
    setNom("")
    setPrix("")
    setDescription("")
    setCategorie("homme")
    setStock("")
    setImageFrontFile(null)
    setImageBackFile(null)
    setAdditionalImages([])
    setImageFrontPreview("")
    setImageBackPreview("")
    setAdditionalPreviews([])
    setExistingImages({})
    setEditingProductId(null)
    setEnRupture(false)
    setEnPromotion(false)
    setEstNouveau(false)
    setPourcentagePromotion("")
    setCouleurs([])
    setTailles([])
    setNewCouleur("")
    setNewCodeHexa("#000000")
    setNewTaille("")
  }

  const addCouleur = () => {
    if (!newCouleur) {
      showNotif("error", "Veuillez entrer le nom de la couleur")
      return
    }
    setCouleurs([...couleurs, {
      couleur: newCouleur,
      code_hexa: newCodeHexa
    }])
    setNewCouleur("")
    setNewCodeHexa("#000000")
  }

  const removeCouleur = (index: number) => {
    setCouleurs(couleurs.filter((_, i) => i !== index))
  }

  const addTaille = () => {
    if (!newTaille) {
      showNotif("error", "Veuillez entrer la taille")
      return
    }
    
    // Check if this taille already exists
    if (!tailles.includes(newTaille)) {
      setTailles([...tailles, newTaille])
    }
    
    setNewTaille("")
  }

  const removeTaille = (index: number) => {
    setTailles(tailles.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 animate-fade-in">
      <Notification
        show={showNotification}
        type={notifType}
        message={notifMessage}
        duration={5000}
        onClose={() => setShowNotification(false)}
      />
      
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">Dashboard Admin</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Gérez vos produits, commandes et utilisateurs</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full max-w-4xl gap-2 overflow-x-auto rounded-xl">
              <TabsTrigger value="dashboard" className="rounded-lg flex-shrink-0 whitespace-nowrap px-3 py-2">
                <TrendingUp className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="produits" className="rounded-lg flex-shrink-0 whitespace-nowrap px-3 py-2">
                <Package className="mr-2 h-4 w-4" />
                Produits
              </TabsTrigger>
              <TabsTrigger value="commandes" className="rounded-lg flex-shrink-0 whitespace-nowrap px-3 py-2">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Commandes
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="rounded-lg flex-shrink-0 whitespace-nowrap px-3 py-2">
                <Mail className="mr-2 h-4 w-4" />
                Newsletter
              </TabsTrigger>
              <TabsTrigger value="utilisateurs" className="rounded-lg flex-shrink-0 whitespace-nowrap px-3 py-2">
                <Users className="mr-2 h-4 w-4" />
                Utilisateurs
              </TabsTrigger>
            </TabsList>

          {/* Dashboard Tab - Analytics */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <h2 className="text-xl sm:text-2xl font-bold">Statistiques</h2>
            
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.statistiques.totalUtilisateurs || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.statistiques.totalCommandes || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produits</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.statistiques.totalProduits || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Newsletter</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.statistiques.totalAbonnesNewsletter || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus (mois)</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.statistiques.revenusMois?.toLocaleString() || 0} DZD</div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Produits</CardTitle>
                <CardDescription>Produits les plus vendus</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.topProduits && dashboardData.topProduits.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.topProduits.map((produit) => (
                      <div key={produit.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{produit.nom}</p>
                          <p className="text-sm text-muted-foreground">Stock: {produit.stock} • Ventes: {produit.ventes}</p>
                        </div>
                        <p className="font-bold">{Number(produit.prix).toLocaleString()} DZD</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun produit vendu</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        <TabsContent value="produits" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Gestion des Produits</h2>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-xl w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {editingProductId ? "Modifier le produit" : "Ajouter un produit"}
            </Button>
          </div>

          {showAddForm && (
            <Card className="animate-slide-in">
              <CardHeader>
                <CardTitle>{editingProductId ? "Modifier le produit" : "Nouveau Produit"}</CardTitle>
                <CardDescription>
                  {editingProductId
                    ? "Modifiez les informations du produit"
                    : "Ajoutez un nouveau produit à votre catalogue"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {productFormLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom du produit</Label>
                    <Input
                      id="nom"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="rounded-xl"
                      placeholder="T-Shirt Arseet Classic"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prix">Prix (DZD)</Label>
                    <Input
                      id="prix"
                      type="number"
                      value={prix}
                      onChange={(e) => setPrix(e.target.value)}
                      className="rounded-xl"
                      placeholder="3500"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl"
                      placeholder="Description du produit..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Select value={categorie} onValueChange={setCategorie}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homme">Homme</SelectItem>
                        <SelectItem value="femme">Femme</SelectItem>
                        <SelectItem value="enfant">Enfant</SelectItem>
                        <SelectItem value="accessoires">Accessoires</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="rounded-xl"
                      placeholder="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageFront">Image Face</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="imageFront"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFrontChange}
                        className="rounded-xl"
                      />
                      {imageFrontPreview && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                          <Image
                            src={imageFrontPreview || "/placeholder.svg"}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => {
                              setImageFrontFile(null)
                              setImageFrontPreview("")
                            }}
                            className="absolute top-1 right-1 bg-black text-white rounded-full p-1 hover:bg-gray-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageBack">Image Dos (hover)</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="imageBack"
                        type="file"
                        accept="image/*"
                        onChange={handleImageBackChange}
                        className="rounded-xl"
                      />
                      {imageBackPreview && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                          <Image
                            src={imageBackPreview || "/placeholder.svg"}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => {
                              setImageBackFile(null)
                              setImageBackPreview("")
                            }}
                            className="absolute top-1 right-1 bg-black text-white rounded-full p-1 hover:bg-gray-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="additionalImages">Images Supplémentaires</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="additionalImages"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesChange}
                        className="rounded-xl"
                      />
                      {additionalPreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {additionalPreviews.map((preview, index) => (
                            <div key={index} className="relative w-full aspect-square rounded-lg overflow-hidden border">
                              <Image
                                src={preview || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <button
                                onClick={() => removeAdditionalImage(index)}
                                className="absolute top-1 right-1 bg-black text-white rounded-full p-1 hover:bg-gray-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Vous pouvez ajouter plusieurs images pour afficher plus de détails du produit
                      </p>
                    </div>
                  </div>

                  {/* Existing Images when editing */}
                  {editingProductId && existingImages && (
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Images existantes</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {existingImages.image_avant && (
                          <div className="relative aspect-square border rounded-lg overflow-hidden">
                            <Image src={existingImages.image_avant} alt="Avant" fill className="object-cover" />
                            <Badge className="absolute top-1 left-1 bg-black text-white text-xs">Avant</Badge>
                          </div>
                        )}
                        {existingImages.image_arriere && (
                          <div className="relative aspect-square border rounded-lg overflow-hidden">
                            <Image src={existingImages.image_arriere} alt="Arrière" fill className="object-cover" />
                            <Badge className="absolute top-1 left-1 bg-black text-white text-xs">Arrière</Badge>
                          </div>
                        )}
                        {existingImages.images?.map((img, i) => (
                          <div key={i} className="relative aspect-square border rounded-lg overflow-hidden">
                            <Image src={img} alt={`Image ${i+1}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Ajoutez de nouvelles images ci-dessus pour les remplacer</p>
                    </div>
                  )}

                  {/* Couleurs Management */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-lg font-semibold">Couleurs</Label>
                    {couleurs.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {couleurs.map((c, i) => (
                          <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded border" style={{backgroundColor: c.code_hexa}}></div>
                              <span className="font-medium">{c.couleur}</span>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => removeCouleur(i)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Couleur"
                        value={newCouleur}
                        onChange={(e) => setNewCouleur(e.target.value)}
                        className="rounded-xl flex-1"
                      />
                      <div className="flex gap-1">
                        <Input
                          type="color"
                          value={newCodeHexa}
                          onChange={(e) => setNewCodeHexa(e.target.value)}
                          className="w-12 h-10 rounded-xl p-1"
                        />
                        <Input
                          value={newCodeHexa}
                          onChange={(e) => setNewCodeHexa(e.target.value)}
                          className="w-24 rounded-xl"
                          placeholder="#000000"
                        />
                      </div>
                      <Button type="button" onClick={addCouleur} size="sm" className="rounded-xl">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tailles Management: replace add/remove list with a simple checkbox set */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-lg font-semibold">Tailles disponibles</Label>
                    <p className="text-sm text-muted-foreground mb-2">Cochez les tailles disponibles pour ce produit</p>

                    <div className="grid grid-cols-4 gap-2">
                      {['S','M','L','XL','XXL'].map((size) => {
                        const checked = tailles.includes(size)
                        return (
                          <label key={size} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (!tailles.includes(size)) setTailles([...tailles, size])
                                } else {
                                  setTailles(tailles.filter(t => t !== size))
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <span className="font-medium">{size}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="estNouveau"
                        checked={estNouveau}
                        onChange={(e) => setEstNouveau(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="estNouveau" className="cursor-pointer">
                        Marquer comme nouveau produit
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enPromotion"
                        checked={enPromotion}
                        onChange={(e) => setEnPromotion(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="enPromotion" className="cursor-pointer">
                        Mettre en promotion
                      </Label>
                    </div>
                  </div>

                  {enPromotion && (
                    <div className="space-y-2 sm:col-span-2 animate-fade-in">
                      <Label htmlFor="pourcentagePromotion">Pourcentage de Promotion (%)</Label>
                      <Input
                        id="pourcentagePromotion"
                        type="number"
                        value={pourcentagePromotion}
                        onChange={(e) => setPourcentagePromotion(e.target.value)}
                        className="rounded-xl"
                        placeholder="20"
                        min="0"
                        max="100"
                      />
                      {pourcentagePromotion && prix && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="destructive" className="bg-black">
                            -{pourcentagePromotion}%
                          </Badge>
                          <span className="text-muted-foreground">
                            Prix final: {(Number.parseFloat(prix) * (1 - Number.parseFloat(pourcentagePromotion) / 100)).toLocaleString()} DZD
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={editingProductId ? handleUpdateProduct : handleAddProduct}
                    className="rounded-xl flex-1"
                    disabled={productFormLoading}
                  >
                    {productFormLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingProductId ? "Mettre à jour" : "Ajouter le produit"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddForm(false)
                      resetForm()
                    }}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg sm:text-xl font-bold">Tous les produits ({dashboardData?.produits?.length || 0})</h3>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Select value={sortField} onValueChange={(value) => handleSort(value as keyof ProduitAPI)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nom">Nom</SelectItem>
                    <SelectItem value="prix">Prix</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="categorie">Catégorie</SelectItem>
                    <SelectItem value="date_creation">Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                >
                  {sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {getSortedProducts().map((produit) => (
                <Card key={produit.id} className="overflow-hidden animate-fade-in hover:shadow-lg transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex gap-3 sm:gap-4 items-start sm:items-center">
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={produit.image_avant || "/placeholder.svg"}
                          alt={produit.nom}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base sm:text-lg truncate">{produit.nom}</h3>
                              {produit.est_nouveau && (
                                <Badge className="bg-black text-white text-xs">Nouveau</Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">{produit.categorie}</p>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-base sm:text-lg">
                                {produit.prix_promo ? (
                                  <>
                                    <span className="line-through text-gray-400 mr-2">{Number(produit.prix).toLocaleString()} DZD</span>
                                    <span className="text-black">{Number(produit.prix_promo).toLocaleString()} DZD</span>
                                  </>
                                ) : (
                                  <span>{Number(produit.prix).toLocaleString()} DZD</span>
                                )}
                              </p>
                              {produit.promotion > 0 && (
                                <Badge className="bg-black text-white text-xs">-{produit.promotion}%</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">Stock: {produit.stock}</p>
                            {produit.en_rupture && (
                              <Badge variant="secondary" className="mt-2 bg-gray-200 text-black">
                                En rupture de stock
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg flex-1 sm:flex-initial"
                              onClick={() => handleEditProduct(produit.id)}
                            >
                              <Pencil className="mr-1 h-3 w-3" />
                              <span className="hidden sm:inline">Modifier</span>
                            </Button>
                            <Button
                              size="sm"
                              variant={produit.en_rupture ? "default" : "secondary"}
                              className="rounded-lg flex-1 sm:flex-initial"
                              onClick={() => toggleRupture(produit.id, produit.en_rupture)}
                            >
                              {produit.en_rupture ? "En stock" : "Rupture"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-lg bg-black hover:bg-gray-800 text-white"
                              onClick={() => handleDeleteProduct(produit.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="commandes" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Gestion des Commandes</h2>
            {commandesData && (
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold">Total: </span>
                <span className="text-lg font-bold text-foreground">{commandesData.pagination.total}</span> commandes
              </div>
            )}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Toutes les commandes</CardTitle>
              <CardDescription>Gérez et suivez toutes les commandes clients</CardDescription>
            </CardHeader>
            <CardContent>
              {commandesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {commandesData?.commandes && commandesData.commandes.length > 0 ? (
                    commandesData.commandes.map((commande) => (
                      <div 
                        key={commande.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl hover:bg-secondary/50 transition-colors gap-4"
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setSelectedCommande(commande)
                            setCommandeDetailsOpen(true)
                          }}
                        >
                          <p className="font-semibold">Commande #{commande.id}</p>
                          <p className="text-sm text-muted-foreground">Client: {commande.nom_complet}</p>
                          <p className="text-sm text-muted-foreground">Email: {commande.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Date: {new Date(commande.date_creation).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </p>
                          {commande.numero_suivi && (
                            <p className="text-sm text-muted-foreground">Suivi: {commande.numero_suivi}</p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                          <div className="text-left sm:text-right w-full">
                            <p className="font-bold text-lg">{formatPrice(commande.total)}</p>
                            <Badge className="bg-black text-white">
                              {getStatusLabel(commande.statut)}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {commande.methode_livraison === 'domicile' 
                                ? 'Livraison à domicile' 
                                : commande.methode_livraison === 'guepex'
                                ? 'Bureau Guepex'
                                : commande.methode_livraison === 'yalidine'
                                ? 'Bureau Yalidine'
                                : commande.methode_livraison}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            {commande.statut === 'en_attente' && (
                              <Button
                                size="sm"
                                className="flex-1 sm:flex-initial bg-black hover:bg-gray-800"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  confirmerCommande(commande.id)
                                }}
                              >
                                Confirmer
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 sm:flex-initial"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadCommandeInvoice(commande)
                              }}
                              disabled={!commande.facture}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune commande pour le moment
                    </div>
                  )}
                  
                  {commandesData && commandesData.pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCommandesPage(p => Math.max(1, p - 1))}
                        disabled={commandesPage === 1}
                      >
                        Précédent
                      </Button>
                      <span className="flex items-center px-4 text-sm">
                        Page {commandesPage} sur {commandesData.pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCommandesPage(p => Math.min(commandesData.pagination.pages, p + 1))}
                        disabled={commandesPage === commandesData.pagination.pages}
                      >
                        Suivant
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Abonnés Newsletter</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="text-sm text-muted-foreground flex gap-4">
                <div>
                  <span className="font-semibold">Total: </span>
                  <span className="text-lg font-bold text-foreground">{newsletterData?.pagination.total || 0}</span> abonnés
                </div>
                {newsletterData?.stats && (
                  <div className="flex gap-3">
                    <span className="text-black">
                      <span className="font-semibold">Actifs: </span>{newsletterData.stats.total_actifs}
                    </span>
                    <span className="text-gray-600">
                      <span className="font-semibold">Inactifs: </span>{newsletterData.stats.total_inactifs}
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => setSendEmailDialogOpen(true)}
                className="bg-black hover:bg-gray-800 text-white w-full sm:w-auto"
              >
                <Mail className="mr-2 h-4 w-4" />
                Envoyer un email
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Liste des abonnés</CardTitle>
              <CardDescription>Tous les emails abonnés à votre newsletter</CardDescription>
            </CardHeader>
            <CardContent>
              {newsletterLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {newsletterData?.abonnes && newsletterData.abonnes.length > 0 ? (
                      newsletterData.abonnes.map((subscriber) => (
                        <div
                          key={subscriber.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                              <Mail className="h-5 w-5 text-black/70" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium truncate">{subscriber.email}</p>
                                {subscriber.est_actif ? (
                                  <Badge className="bg-black text-white text-xs">Actif</Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-gray-200 text-black text-xs">
                                    Inactif
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Inscrit le {new Date(subscriber.date_inscription).toLocaleDateString("fr-FR")}
                              </p>
                              {subscriber.source && (
                                <p className="text-xs text-muted-foreground">Source: {subscriber.source}</p>
                              )}
                              {!subscriber.est_actif && subscriber.date_desinscription && (
                                <p className="text-xs text-red-600">
                                  Désinscrit le {new Date(subscriber.date_desinscription).toLocaleDateString("fr-FR")}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={subscriber.est_actif ? "secondary" : "default"}
                            className="w-full sm:w-auto"
                            onClick={() => toggleNewsletterSubscriber(subscriber.id)}
                          >
                            {subscriber.est_actif ? "Désactiver" : "Réactiver"}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun abonné pour le moment
                      </div>
                    )}
                  </div>
                  
                  {/* Pagination */}
                  {newsletterData && newsletterData.pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewsletterPage((p) => Math.max(1, p - 1))}
                        disabled={newsletterPage === 1}
                      >
                        Précédent
                      </Button>
                      <span className="flex items-center px-4 text-sm">
                        Page {newsletterPage} sur {newsletterData.pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewsletterPage((p) => Math.min(newsletterData.pagination.pages, p + 1))}
                        disabled={newsletterPage === newsletterData.pagination.pages}
                      >
                        Suivant
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Custom Email Dialog */}
          <Dialog open={sendEmailDialogOpen} onOpenChange={setSendEmailDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Envoyer un email personnalisé</DialogTitle>
                <DialogDescription>
                  Composez un email qui sera envoyé à tous les abonnés actifs de la newsletter
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="email-subject">
                    Sujet <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email-subject"
                    placeholder="Sujet de l'email"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {emailSubject.length}/200 caractères
                  </p>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="email-message">
                    Message <span className="text-red-600">*</span>
                  </Label>
                  <textarea
                    id="email-message"
                    placeholder="Votre message (vous pouvez utiliser \n pour les sauts de ligne)"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    maxLength={5000}
                    rows={10}
                    className="w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {emailMessage.length}/5000 caractères
                  </p>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="email-image">Image (optionnel)</Label>
                  <div className="space-y-3">
                    {emailImagePreview ? (
                      <div className="relative">
                        <img
                          src={emailImagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 bg-white text-black border border-black hover:bg-gray-100"
                          onClick={removeEmailImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-md p-6 text-center">
                        <Input
                          id="email-image"
                          type="file"
                          accept="image/*"
                          onChange={handleEmailImageChange}
                          className="hidden"
                        />
                        <Label
                          htmlFor="email-image"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Cliquez pour ajouter une image
                          </span>
                        </Label>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    L'image sera incluse dans l'email (optionnel)
                  </p>
                </div>

                {/* Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <div className="flex gap-2">
                    <Info className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Informations importantes :</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>L'email sera envoyé à tous les abonnés actifs ({newsletterData?.stats.total_actifs || 0} abonnés)</li>
                        <li>Un lien de désinscription sera automatiquement ajouté</li>
                        <li>L'envoi se fait de manière asynchrone</li>
                        <li>Vous recevrez un rapport d'envoi une fois terminé</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSendEmailDialogOpen(false)}
                  disabled={sendingEmail}
                  className="border-black hover:bg-gray-100"
                >
                  Annuler
                </Button>
                <Button
                  onClick={sendCustomEmail}
                  disabled={sendingEmail || !emailSubject.trim() || !emailMessage.trim()}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Envoyer à {newsletterData?.stats.total_actifs || 0} abonné(s)
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="utilisateurs" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Gestion des Utilisateurs</h2>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">Total: </span>
              <span className="text-lg font-bold text-foreground">{usersTotal || 0}</span> utilisateurs
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Liste des utilisateurs</CardTitle>
              <CardDescription>Gérez tous les comptes utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => fetchUsers()}
                  disabled={usersLoading}
                >
                  {usersLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rechercher"}
                </Button>
              </div>

              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {users && users.length > 0 ? users.map((user: UserAPI) => (
                      <div
                        key={user.id}
                        className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors gap-4"
                      >
                        <div className="flex gap-3 flex-1 w-full">
                          <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-6 w-6 text-black/70" />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold truncate">{user.nom} {user.prenom}</p>
                              {user.est_admin && (
                                <Badge className="bg-black text-white text-xs">Admin</Badge>
                              )}
                              {!user.est_actif && (
                                <Badge variant="secondary" className="bg-gray-200 text-black text-xs">
                                  Inactif
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            {user.telephone && (
                              <p className="text-sm text-muted-foreground">{user.telephone}</p>
                            )}
                            {user.adresse && (
                              <p className="text-sm text-muted-foreground truncate">{user.adresse}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Inscrit le {new Date(user.date_creation).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        {/* Hide admin controls for current user */}
                        {user.id !== currentUserId && (
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 sm:flex-initial"
                              onClick={() => {
                                setUserToToggle(user)
                                setToggleAdminDialogOpen(true)
                              }}
                            >
                              {user.est_admin ? "Retirer Admin" : "Rendre Admin"}
                            </Button>
                            <Button
                              size="sm"
                              variant={user.est_actif ? "secondary" : "default"}
                              className="flex-1 sm:flex-initial"
                              onClick={() => toggleUserActive(user.id)}
                            >
                              {user.est_actif ? "Désactiver" : "Activer"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-shrink-0 bg-black hover:bg-gray-800 text-white"
                              onClick={() => {
                                setUserToDelete(user)
                                setDeleteUserDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {/* Show badge for current user */}
                        {user.id === currentUserId && (
                          <div className="flex items-center">
                            <Badge className="bg-black text-white">Vous</Badge>
                          </div>
                        )}
                      </div>
                    )) : (
                      <p className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé</p>
                    )}
                  </div>

                  {/* Pagination */}
                  {usersTotalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Page {usersPage} sur {usersTotalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsersPage((prev) => Math.max(1, prev - 1))}
                          disabled={usersPage === 1 || usersLoading}
                        >
                          Précédent
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsersPage((prev) => prev + 1)}
                          disabled={usersPage === usersTotalPages || usersLoading}
                        >
                          Suivant
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé de votre catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-black hover:bg-gray-800 text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Details Dialog */}
      {/* Commande Details Dialog */}
      <AlertDialog open={commandeDetailsOpen} onOpenChange={setCommandeDetailsOpen}>
        <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Détails de la commande</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCommande && `Commande #${selectedCommande.id}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedCommande && (
            <div className="space-y-6">
              {/* Client Information */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Informations Client</h3>
                <div className="bg-secondary/50 p-4 rounded-lg space-y-2 text-sm">
                  <p><span className="font-medium">Nom:</span> {selectedCommande.nom_complet}</p>
                  <p><span className="font-medium">Email:</span> {selectedCommande.email}</p>
                  <p><span className="font-medium">Téléphone:</span> {selectedCommande.telephone}</p>
                  <p><span className="font-medium">Adresse:</span> {selectedCommande.adresse_livraison}</p>
                  <p><span className="font-medium">Ville:</span> {selectedCommande.ville}, {selectedCommande.wilaya}</p>
                  {selectedCommande.code_postal && (
                    <p><span className="font-medium">Code postal:</span> {selectedCommande.code_postal}</p>
                  )}
                  <p><span className="font-medium">Mode de livraison:</span> {
                    selectedCommande.methode_livraison === 'domicile' 
                      ? 'Livraison à domicile' 
                      : selectedCommande.methode_livraison === 'guepex'
                      ? 'Bureau Guepex'
                      : selectedCommande.methode_livraison === 'yalidine'
                      ? 'Bureau Yalidine'
                      : selectedCommande.methode_livraison
                  }</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedCommande.date_creation).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</p>
                  {selectedCommande.notes && (
                    <p><span className="font-medium">Notes:</span> {selectedCommande.notes}</p>
                  )}
                </div>
              </div>

              {/* Order Articles */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Articles commandés</h3>
                <div className="space-y-2">
                  {selectedCommande.articles.map((article) => (
                    <div key={article.id} className="bg-secondary/50 p-3 rounded-lg flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={article.produit.image_avant} 
                          alt={article.nom_produit}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{article.nom_produit}</p>
                        <p className="text-sm text-muted-foreground">
                          Taille: {article.taille} • Couleur: {article.couleur}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(article.prix_unitaire)} × {article.quantite}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(article.sous_total)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{formatPrice(selectedCommande.sous_total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frais de livraison</span>
                    <span>{formatPrice(selectedCommande.frais_livraison)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-xl">{formatPrice(selectedCommande.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Gestion du statut</h3>
                
                {/* Current Status Display */}
                <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Statut actuel</p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-lg">{getStatusLabel(selectedCommande.statut)}</p>
                    {selectedCommande.numero_suivi && (
                      <Badge variant="outline" className="text-xs">
                        Suivi: {selectedCommande.numero_suivi}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Update Status Button */}
                <Button
                  onClick={() => {
                    setNewStatut(selectedCommande.statut)
                    setNumeroSuivi(selectedCommande.numero_suivi || "")
                    setUpdateStatutOpen(true)
                  }}
                  className="w-full bg-black hover:bg-gray-800"
                >
                  Modifier le statut
                </Button>

                {/* Download Invoice */}
                <Button
                  variant="outline"
                  onClick={() => downloadCommandeInvoice(selectedCommande)}
                  className="w-full"
                  disabled={!selectedCommande.facture}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger la facture
                </Button>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCommandeDetailsOpen(false)}>Fermer</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Statut Dialog */}
      <AlertDialog open={updateStatutOpen} onOpenChange={setUpdateStatutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifier le statut de la commande</AlertDialogTitle>
            <AlertDialogDescription>
              Commande #{selectedCommande?.id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nouveau statut</Label>
              <Select value={newStatut} onValueChange={(value: OrderStatus) => setNewStatut(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="confirmee">Confirmée</SelectItem>
                  <SelectItem value="expediee">Expédiée</SelectItem>
                  <SelectItem value="livree">Livrée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Numéro de suivi (optionnel)</Label>
              <Input
                placeholder="Ex: ZR1234567890"
                value={numeroSuivi}
                onChange={(e) => setNumeroSuivi(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={updateCommandeStatut}
              className="bg-black hover:bg-gray-800"
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Admin Dialog */}
      <AlertDialog open={toggleAdminDialogOpen} onOpenChange={setToggleAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'action</AlertDialogTitle>
            <AlertDialogDescription>
              {userToToggle && (
                <>
                  Êtes-vous sûr de vouloir {userToToggle.est_admin ? "retirer" : "donner"} les droits d'administrateur {userToToggle.est_admin ? "à" : "pour"}{" "}
                  <strong>{userToToggle.nom} {userToToggle.prenom}</strong> ?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToToggle) {
                  toggleUserAdmin(userToToggle.id)
                  setToggleAdminDialogOpen(false)
                  setUserToToggle(null)
                }
              }}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete && (
                <>
                  Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur{" "}
                  <strong>{userToDelete.nom} {userToDelete.prenom}</strong> ? Cette action est irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete) {
                  deleteUser(userToDelete.id)
                  setDeleteUserDialogOpen(false)
                  setUserToDelete(null)
                }
              }}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
