"use client"

import React from "react"
import BounceCards from "@/components/BounceCards"

export default function NewsletterCardsBackup() {
  const images = [
    '/picture1.JPG',
    '/picture2.png',
    '/picture3.JPG',
    '/picture4.JPG',
  ]

  return (
    <div className="flex justify-center items-center">
      <BounceCards
        images={images}
        containerWidth={500}
        containerHeight={400}
        animationDelay={0.3}
        transformStyles={[
          'rotate(8deg) translate(-120px)',
          'rotate(4deg) translate(-60px)',
          'rotate(0deg)',
          'rotate(-4deg) translate(60px)',
        ]}
      />
    </div>
  )
}
