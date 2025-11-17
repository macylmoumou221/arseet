"use client"
import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null
    let user: any = null
    try {
      user = userRaw ? JSON.parse(userRaw) : null
    } catch {}
    // Stored user uses `est_admin` (French). Check that field.
    setIsAdmin(user?.est_admin === true)
  }, [])

  if (isAdmin === null) {
    return (
      <main className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-lg text-muted-foreground">Chargement...</div>
      </main>
    )
  }
  if (!isAdmin) {
    return (
      <main className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-3xl font-bold mb-4">Accès refusé</div>
        <div className="text-lg text-muted-foreground">Vous n'êtes pas autorisé ici.</div>
      </main>
    )
  }
  return (
    <main className="py-8">
      <AdminDashboard />
    </main>
  )
}
