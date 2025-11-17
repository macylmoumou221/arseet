"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Shield, User } from "lucide-react"

export function AdminToggle() {
  const [isAdmin, setIsAdmin] = useState(false)

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-fade-in">
      <Button
        onClick={() => setIsAdmin(!isAdmin)}
        className="rounded-full shadow-lg transition-all hover:scale-110"
        variant={isAdmin ? "default" : "secondary"}
        size="lg"
      >
        {isAdmin ? (
          <>
            <Shield className="mr-2 h-5 w-5" />
            Mode Admin
          </>
        ) : (
          <>
            <User className="mr-2 h-5 w-5" />
            Mode Client
          </>
        )}
      </Button>
      {isAdmin && (
        <div className="mt-2 rounded-lg bg-black p-3 text-sm text-white shadow-lg animate-fade-in">
          Vue administrateur activée
        </div>
      )}
    </div>
  )
}
