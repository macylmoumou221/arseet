import { ContactForm } from "@/components/contact-form"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Contactez-nous</h1>
        <p className="text-muted-foreground">Nous sommes là pour vous aider</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="mb-6 text-2xl font-bold">Informations de contact</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Email</h3>
                  <p className="text-muted-foreground">arseetwear@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Phone className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Horaires</h3>
                  <p className="text-muted-foreground">Dimanche - Jeudi: 9h00 - 18h00</p>
                  <p className="text-muted-foreground">Vendredi - Samedi: Fermé</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-secondary p-6">
            <h3 className="mb-2 font-semibold">Besoin d'aide?</h3>
            <p className="text-sm text-muted-foreground">
              Notre équipe est disponible pour répondre à toutes vos questions concernant nos produits, les commandes,
              les livraisons ou tout autre sujet.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <ContactForm />
      </div>
    </main>
  )
}
