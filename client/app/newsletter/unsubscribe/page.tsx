import UnsubscribeClient from "@/components/unsubscribe-client"

type SearchParams = { email?: string | string[] }

export default function UnsubscribePage({ searchParams }: { searchParams?: SearchParams }) {
  const emailParam = searchParams?.email
  const email = Array.isArray(emailParam) ? emailParam[0] : emailParam

  // Render a client-only component to perform the unsubscribe action.
  // Reading `searchParams` here on the server avoids calling `useSearchParams` during SSR/prerender.
  return <UnsubscribeClient email={email ?? null} />
}
