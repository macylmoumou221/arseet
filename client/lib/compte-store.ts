"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Utilisateur {
  nom: string
  email: string
  telephone: string
  adresse: string
}

interface Commande {
  id: string
  date: string
  total: number
  statut: string
}

interface CompteStore {
  utilisateur: Utilisateur
  pointsFidelite: number
  historique: Commande[]
  mettreAJourProfil: (profil: Partial<Utilisateur>) => void
  ajouterPoints: (points: number) => void
  ajouterCommande: (commande: Commande) => void
}

export const useCompteStore = create<CompteStore>()(
  persist(
    (set) => ({
      utilisateur: {
        nom: "Utilisateur Arseet",
        email: "arseetwear@gmail.com",
        telephone: "+213 555 123 456",
        adresse: "Alger, Algérie",
      },
      pointsFidelite: 3250,
      historique: [
        {
          id: "CMD001",
          date: "15 Mars 2025",
          total: 7000,
          statut: "Livrée",
        },
        {
          id: "CMD002",
          date: "22 Mars 2025",
          total: 3500,
          statut: "En cours",
        },
      ],
      mettreAJourProfil: (profil) => {
        set((state) => ({
          utilisateur: { ...state.utilisateur, ...profil },
        }))
      },
      ajouterPoints: (points) => {
        set((state) => ({
          pointsFidelite: state.pointsFidelite + points,
        }))
      },
      ajouterCommande: (commande) => {
        set((state) => ({
          historique: [commande, ...state.historique],
        }))
      },
    }),
    {
      name: "compte-storage",
    },
  ),
)
