import Link from "next/link"
import Image from "next/image"
import { Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="animate-fade-in">
            <Image src="/arseet_white.png" alt="Arseet Logo" width={160} height={60} className="mb-4 h-20 w-auto" />
            <p className="text-sm text-gray-400">
              A mix of art and street. Découvrez nos collections uniques alliant créativité et style urbain.
            </p>
          </div>

          {/* Shop */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h4 className="mb-4 font-semibold">Boutique</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#nouveautes" className="text-gray-400 transition-colors hover:text-white">
                  Nouvelles Arrivages
                </Link>
              </li>
              <li>
                <Link href="/#produits" className="text-gray-400 transition-colors hover:text-white">
                  Produits
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-gray-400 transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="text-gray-400 transition-colors hover:text-white">
                  Mon Compte
                </Link>
              </li>
              <li>
                <Link href="/livraison" className="text-gray-400 transition-colors hover:text-white">
                  Livraison
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 transition-colors hover:text-white">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h4 className="mb-4 font-semibold">Suivez-nous</h4>
              <div className="flex gap-4 items-center">
                <a
                  href="https://www.instagram.com/arseet.studios/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Arseet on Instagram"
                  className="text-gray-400 transition-all hover:scale-110 hover:text-white"
                >
                  <Instagram className="h-5 w-5" />
                </a>

                <a
                  href="https://www.tiktok.com/@arseet.studios"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Arseet on TikTok"
                  className="text-gray-400 transition-all hover:scale-110 hover:text-white"
                >
                  {/* Inline TikTok-like music note icon (uses currentColor for easy theming) */}
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" fill="currentColor" />
                  </svg>
                </a>
              </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p className="mb-1">A mix of art and street</p>
          <p>&copy; 2025 Arseet. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
