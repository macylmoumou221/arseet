import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nom, email, sujet, message } = body

    // Minimal validation
    if (!nom || !email || !sujet || !message) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 })
    }

    // TODO: replace with real email sending / ticketing integration
    console.log('Contact form received:', { nom, email, sujet, message })

    return NextResponse.json({ success: true, message: 'Message received' })
  } catch (err) {
    console.error('Error in /api/contact', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
