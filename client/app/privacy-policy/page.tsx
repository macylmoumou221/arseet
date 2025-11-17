import Link from "next/link"
import Image from "next/image"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8">
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <Image src="/arseet black.png" alt="Arseet" width={56} height={56} className="rounded" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Politique de confidentialité – Arseet</h1>
              <p className="text-sm text-gray-500">Dernière mise à jour : 8 novembre 2025</p>
            </div>
          </div>
        </header>

        <section className="prose prose-sm md:prose md:prose-lg text-gray-800">
          <h2>Qui nous sommes</h2>
          <p>
            Arseet (« nous », « notre ») exploite la plateforme e-commerce Arseet.
          </p>

          <h2>Comment nous utilisons vos données</h2>
          <p>
            Nous collectons uniquement les informations nécessaires à la création de comptes, au traitement des
            commandes, à l’envoi de confirmations par e-mail et à la fourniture du support client. Les données sont
            stockées en toute sécurité et ne sont jamais vendues.
          </p>

          <h2>Communications par e-mail</h2>
          <p>
            Nous envoyons des e-mails concernant le statut des commandes, la vérification de compte et les mises à
            jour importantes. Vous pouvez vous désinscrire des messages marketing à tout moment en nous contactant.
          </p>

          <h2>Partage des données</h2>
          <p>
            Nous partageons les informations uniquement avec des partenaires de confiance, tels que les prestataires de
            paiement, les services de livraison et les services de messagerie , strictement
            pour traiter les commandes ou transmettre des messages.
          </p>

          <h2>Sécurité des données</h2>
          <p>
            Nous utilisons le chiffrement (HTTPS) et suivons les pratiques de sécurité standards de l’industrie pour
            protéger vos informations.
          </p>

          <h2>Confidentialité</h2>
          <p>
            Vos données personnelles restent confidentielles. Nous ne les vendons pas et ne les utilisons jamais à des
            fins autres que celles décrites dans cette politique. Toute collecte ou traitement supplémentaire sera
            effectué uniquement avec votre consentement explicite.
          </p>

          <h2>Vos droits</h2>
          <p>
            Vous pouvez demander l’accès, la correction ou la suppression de vos données personnelles en envoyant un
            e-mail à <a className="text-blue-600" href="mailto:arseetwear@gmail.com">arseetwear@gmail.com</a>.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question, contactez-nous à <a className="text-blue-600" href="mailto:arseetwear@gmail.com">arseetwear@gmail.com</a>.
          </p>

          <div className="mt-8">
            <Link href="/" className="inline-block text-sm text-gray-700 hover:text-black">
              ← Retour à l'accueil
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
