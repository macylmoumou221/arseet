import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import BounceCards from "@/components/BounceCards"
import NewsletterInline from "@/components/newsletter-inline"
import { api } from "@/lib/api"

export default async function HomePage() {
  // Fetch products server-side and prepare arrays for the BounceCards component
  const fallbackImages = ['/picture1.JPG', '/picture2.png', '/picture3.JPG', '/picture4.JPG']

  let rawProducts: any[] = []
  try {
    const resp: any = await api.products.getAll()

    if (resp && resp.success && resp.data?.produits && Array.isArray(resp.data.produits)) {
      rawProducts = resp.data.produits
    } else if (resp && resp.success && Array.isArray(resp.data)) {
      rawProducts = resp.data
    } else if (Array.isArray(resp)) {
      rawProducts = resp
    } else if (resp && Array.isArray(resp.data)) {
      rawProducts = resp.data
    } else {
      rawProducts = []
    }
  } catch (e) {
    console.error("Could not fetch products for exclusives section:", e)
    rawProducts = []
  }

  const availableProducts = rawProducts.filter((p: any) => !p?.en_rupture)
  const allImages = availableProducts.map((p: any) => p?.image_avant).filter(Boolean) as string[]
  const lastImages = allImages.length ? allImages.slice(-4) : []

  const images: string[] = []
  const links: string[] = []

  for (let i = 0; i < 4; i++) {
    const imgIndex = lastImages.length - 1 - i
    if (imgIndex >= 0) {
      const img = lastImages[imgIndex]
      images.push(img)
      const prod = availableProducts.find((p: any) => p?.image_avant === img)
      links.push(prod ? `/produit/${prod.id}` : '')
    } else {
      images.push(fallbackImages[i])
      links.push('') // Empty link for static fallback cards (not clickable)
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/urban-streetwear-background-texture.png"
            alt="Background"
            fill
            className="object-cover opacity-40"
            style={{ objectPosition: "70% 70%" }}
          />
        </div>
        
        <div className="relative z-10 w-full px-4 animate-fade-in">
          {/* Logo positioned at top-right */}
          <div className="absolute top-[-350px] right-60 z-30 hidden lg:block">
            <Image
              src="/arseet_white.png"
              alt="Arseet"
              width={460}
              height={185}
              priority
              className="w-52 md:w-72 lg:w-96 object-contain"
            />
          </div>

          {/* Centered content for mobile, right-aligned for desktop */}
          <div className="absolute inset-0 z-20 flex items-center justify-center lg:justify-end lg:right-60 lg:pr-6">
            <div className="w-full max-w-2xl mx-auto px-6 text-center lg:text-left">
              <div className="flex flex-col items-center lg:items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  {/* Mobile/MD stacked logo — hidden on lg to avoid duplicating the top-right logo */}
                  <Image
                    src="/arseet_white.png"
                    alt="Arseet"
                    width={220}
                    height={90}
                    className="block lg:hidden w-40 md:w-56 object-contain"
                    priority
                  />
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-balance">
                  ARSEET
                </h1>
              </div>
              <p className="text-xl md:text-2xl lg:text-3xl text-neutral-300 mb-8 font-light text-balance">
                Là où le streetwear rencontre l'expression artistique
              </p>
              <p className="text-base md:text-lg text-neutral-400 mb-10 max-w-md mx-auto lg:mx-0">
                Éditions limitées. Designs authentiques.<br />
                Made in Tizi-Ouzou.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/produits">
                  <Button
                    size="lg"
                    className="text-lg bg-white text-black rounded-none hover:bg-neutral-200 transition-all hover:scale-105 font-bold px-8 py-6"
                  >
                    DÉCOUVRIR LA COLLECTION
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="video" className="py-20 px-6 md:px-12 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Video */}
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative">
               <video
                  src="https://res.cloudinary.com/dwd4nrb7h/video/upload/v1762972766/tiktok1_oikuej.mp4"
                  poster="/urban-streetwear-background-texture.jpg"
                  className="w-[260px] md:w-[340px] lg:w-[400px] rounded-sm shadow-2xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                >
                  {/* Fallback image for browsers that can't play video or when autoplay is blocked on mobile */}
                  <img src="/urban-streetwear-background-texture.jpg" alt="Arseet video poster" className="w-full rounded-sm" />
                </video>
              </div>
            </div>

            {/* Text Content */}
            <div className="w-full lg:w-1/2 text-white">
              <div className="inline-block bg-white text-black px-4 py-1 text-xs font-bold mb-4 tracking-wider">
                LE MOUVEMENT
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance leading-tight">
                ARSEET : PLUS QU'UN STYLE, UNE IDENTITÉ
              </h2>
              <p className="text-lg md:text-xl text-neutral-300 mb-6 leading-relaxed">
                Chaque pièce raconte une histoire. Inspirée par les rues de Tizi-Ouzou, notre collection fusionne l'audace du streetwear avec une vision artistique unique.
              </p>
              <p className="text-base text-neutral-400 mb-8 leading-relaxed">
                De la conception à la production, nous créons des vêtements qui célèbrent l'individualité et l'authenticité. Rejoignez le mouvement Arseet.
              </p>
              <div className="flex flex-wrap gap-6">
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="py-20 px-6 md:px-12 bg-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-left order-2 md:order-1">
              <div className="inline-block bg-black text-white px-4 py-1 text-xs font-bold mb-4 tracking-wider">
                QUI NOUS SOMMES
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-black mb-6 text-balance">
                NÉ DANS LES RUES DE TIZI-OUZOU
              </h2>
              <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                Arseet est né d'une passion pour le streetwear et l'expression artistique. Basée à Tizi-Ouzou, 
                notre marque puise son inspiration dans l'énergie urbaine, la créativité locale et l'esprit de la rue.
              </p>
              <p className="text-base text-neutral-800 font-semibold italic">
                "A mix of art and street" .
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end order-1 md:order-2">
              <div className="relative w-full h-96 md:h-[500px] lg:h-[600px]">
                {/* Plain <img> fallback for small screens where Next/Image with fill may not render reliably */}
                <img
                  src="/man_and_cat.png"
                  alt="Style Arseet"
                  className="block md:hidden w-full h-96 object-cover object-center shadow-2xl"
                />

                {/* Use Next/Image for md+ to keep optimization and responsive behavior */}
                <Image
                  src="/man_and_cat.png"
                  alt="Style Arseet"
                  fill
                  className="hidden md:block object-cover object-center shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12">
            <div>
              <div className="inline-block bg-black text-white px-4 py-1 text-xs font-bold mb-4 tracking-wider">
                NOUVEAUTÉS
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-black mb-2">NOS EXCLUSIVITÉS</h3>
              <p className="text-lg text-neutral-600">Dernières drops — disponibles en quantité limitée</p>
            </div>
            <Link href="/produits" className="text-base font-bold text-black underline hover:no-underline transition-all mt-4 md:mt-0">
              VOIR TOUTE LA COLLECTION →
            </Link>
          </div>

          <div className="flex justify-center">
            <BounceCards
              images={images}
              links={links}
              containerWidth={700}
              containerHeight={340}
              transformStyles={['rotate(8deg) translate(-120px)', 'rotate(4deg) translate(-60px)', 'rotate(0deg)', 'rotate(-4deg) translate(60px)']}
              animationDelay={0.3}
            />
          </div>

          <div className="flex justify-center mt-12">
            <NewsletterInline />
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8 text-balance">
            PRÊT À FAIRE PARTIE DE L'HISTOIRE ?
          </h2>
          <p className="text-xl md:text-2xl text-neutral-300 mb-12 text-balance">
            Découvrez nos pièces en édition limitée avant qu'elles ne disparaissent
          </p>
          <Link href="/produits">
            <Button
              size="lg"
              className="text-xl bg-white text-black rounded-none hover:bg-neutral-200 transition-all hover:scale-105 font-black px-12 py-8"
            >
              SHOP MAINTENANT
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
