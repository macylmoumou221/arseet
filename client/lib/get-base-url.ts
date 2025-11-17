// Safe helper to build URLs using NEXT_PUBLIC_BASE_URL when provided.
// NEXT_PUBLIC_* vars are inlined at build time by Next.js for client code.
export const NEXT_PUBLIC_BASE_URL = typeof process !== 'undefined'
  ? String(process.env.NEXT_PUBLIC_BASE_URL ?? '')
  : ''

export function buildUrl(path: string) {
  const base = NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')
  if (!base) return path
  if (!path.startsWith('/')) path = `/${path}`
  return `${base}${path}`
}

export default buildUrl
