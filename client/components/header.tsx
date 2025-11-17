"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, ShoppingCart, User, Settings, Package, UserCircle, LogOut } from "lucide-react"
import { usePanierStore } from "@/lib/store"
import { PanierSheet } from "@/components/panier-sheet"
import { isAuthenticated, isAdmin, logout as authLogout, getUser, refreshUserProfile } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function Header() {
  const [isClient, setIsClient] = useState(false)
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  
  useEffect(() => { 
    setIsClient(true)
    setIsLoggedIn(isAuthenticated())
    setIsUserAdmin(isAdmin())
    
    // Refresh user profile to get latest admin status
    if (isAuthenticated()) {
      refreshUserProfile().then(() => {
        setIsUserAdmin(isAdmin())
      })
    }
  }, [])
  
  const [menuOuvert, setMenuOuvert] = useState(false)
  const totalArticles = usePanierStore((state) => state.totalArticles())
  
  const handleLogout = () => {
    authLogout()
    setIsLoggedIn(false)
    setIsUserAdmin(false)
    router.push("/connexion")
  }

  const handleProfileClick = () => {
    if (!isAuthenticated()) {
      router.push("/connexion")
    }
  }

  const liens = [
    { nom: "Nouvelles Arrivages", href: "/nouvelles-arrivages" },
    { nom: "Produits", href: "/produits" },
    { nom: "Newsletter", href: "/newsletter" },
  ]

  return (
    <>      
      {/* Announcement Bar */}
      <div className="w-full bg-black text-white text-center py-2 text-sm font-semibold">
        Livraison Disponible 58 Wilayas
      </div>
      <header className="sticky top-0 z-50 bg-white animate-fade-in h-[82.4px]" suppressHydrationWarning>
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Navigation à gauche */}
            <nav className="hidden items-center gap-6 md:flex flex-1 -ml-4">
              {liens.map((lien) => (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className="text-xs font-bold uppercase tracking-wide transition-colors hover:text-foreground/60"
                >
                  {lien.nom}
                </Link>
              ))}
            </nav>

            {/* Logo au centre */}
            <Link href="/" className="hidden md:block transition-transform hover:scale-105">
              <div className="bg-white px-3 py-1 rounded-lg">
                <Image src="/arseet black.png" alt="Arseet Logo" width={115} height={60} className="h-[60px] w-[115px]" />
              </div>
            </Link>

            {/* Actions à droite */}
            <div className="flex-1 flex justify-end items-center gap-2 -mr-4">
              {/* Mobile menu button - LEFT SIDE */}
              <div className="md:hidden absolute left-4">
                {isClient ? (
                  <Sheet open={menuOuvert} onOpenChange={setMenuOuvert}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>

                    <SheetContent side="left" className="w-[280px]">
                      <SheetHeader className="text-center mb-6">
                        <VisuallyHidden>
                          <SheetTitle>Menu</SheetTitle>
                        </VisuallyHidden>
                        {/* Arseet Black Logo at top */}
                        <div className="flex justify-center mb-4">
                          <Link href="/" onClick={() => setMenuOuvert(false)} className="inline-block">
                            <Image
                              src="/arseet black.png"
                              alt="Arseet Logo"
                              width={100}
                              height={50}
                              className="h-[50px] w-[100px] object-contain"
                            />
                          </Link>
                        </div>
                      </SheetHeader>

                      <nav className="flex flex-col gap-4 items-center">
                        {liens.map((lien) => (
                          <Link
                            key={lien.href}
                            href={lien.href}
                            onClick={() => setMenuOuvert(false)}
                            className="text-lg font-bold uppercase tracking-wide transition-colors hover:text-foreground/60"
                          >
                            {lien.nom}
                          </Link>
                        ))}

                        {isClient && isAuthenticated() && !isUserAdmin && (
                          <Link
                            href="/commandes"
                            onClick={() => setMenuOuvert(false)}
                            className="text-lg font-bold uppercase tracking-wide transition-colors hover:text-foreground/60"
                          >
                            Commandes
                          </Link>
                        )}

                        {isClient && isUserAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setMenuOuvert(false)}
                            className="text-lg font-bold uppercase tracking-wide transition-colors hover:text-foreground/60"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </nav>

                      <div className="absolute bottom-6 left-0 right-0 px-6">
                        {isClient && isAuthenticated() ? (
                          <Link href="/compte" onClick={() => setMenuOuvert(false)}>
                            <Button className="w-full bg-black hover:bg-gray-800 text-white rounded-lg">Mon Compte</Button>
                          </Link>
                        ) : (
                          <Link href="/connexion" onClick={() => setMenuOuvert(false)}>
                            <Button className="w-full bg-black hover:bg-gray-800 text-white rounded-lg">Se connecter</Button>
                          </Link>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <div style={{ width: 32, height: 32 }} />
                )}
              </div>

              {/* Admin Dashboard - only show if user is admin */}
              {isClient && isUserAdmin && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full transition-all hover:scale-110"
                    title="Admin Dashboard"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              {isClient ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full transition-all hover:scale-110"
                      onClick={handleProfileClick}
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  {isClient && isLoggedIn && (
                    <DropdownMenuContent align="end" className="w-48">
                      {/* Only show Commandes for non-admin users */}
                      {!isUserAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/commandes" className="flex items-center gap-2 cursor-pointer">
                            <Package className="h-4 w-4" />
                            <span>Commandes</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/compte" className="flex items-center gap-2 cursor-pointer">
                          <UserCircle className="h-4 w-4" />
                          <span>Mon Compte</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Se déconnecter</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              ) : (
                <div style={{ width: 32, height: 32 }} />
              )}

              {isClient ? (
                <PanierSheet>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 rounded-full transition-all hover:scale-110"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isClient && totalArticles > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background animate-fade-in">
                        {totalArticles}
                      </span>
                    )}
                  </Button>
                </PanierSheet>
              ) : (
                <div style={{ width: 32, height: 32 }} />
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
