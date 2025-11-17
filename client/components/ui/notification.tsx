"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationProps {
  message: string
  type?: "success" | "error" | "info" | "warning"
  duration?: number // in milliseconds
  onClose?: () => void
  show: boolean
}

export function Notification({ 
  message, 
  type = "info", 
  duration = 5000, 
  onClose,
  show 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(show)
  const [progress, setProgress] = useState(100)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    setIsVisible(show)
    if (show) {
      setProgress(100)
      
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100))
          return newProgress <= 0 ? 0 : newProgress
        })
      }, 100)

      // Auto dismiss
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    }
  }, [show, duration, onClose])

  if (!isVisible || !mounted) return null

  const typeStyles = {
    success: "bg-black border-black",
    error: "bg-black border-black",
    info: "bg-black border-black",
    warning: "bg-black border-black",
  }

  const typeIcons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  }

  const notificationContent = (
    <div 
      className="fixed bottom-4 right-4 animate-slide-in pointer-events-none"
      style={{ 
        zIndex: 99999,
        position: 'fixed' 
      }}
    >
      <div className={cn(
        "min-w-[300px] max-w-md rounded-lg border-2 text-white shadow-2xl overflow-hidden pointer-events-auto",
        typeStyles[type]
      )}>
        <div className="flex items-center gap-3 p-4">
          <span className="text-xl font-bold">{typeIcons[type]}</span>
          <p className="text-sm font-semibold flex-1">{message}</p>
          <button
            onClick={(e) => {
              // Prevent the close click from bubbling to parent links or other handlers
              e.stopPropagation()
              e.preventDefault()
              setIsVisible(false)
              onClose?.()
            }}
            className="ml-4 rounded-full p-1 transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white/30">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )

  return createPortal(notificationContent, document.body)
}
