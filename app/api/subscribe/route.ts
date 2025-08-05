import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { email, interests } = await request.json()

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailPattern.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(interests)) {
      return NextResponse.json(
        { success: false, message: 'Interests must be an array.' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin.from('subscribers').insert({
      email,
      interests,
      subscribed_at: new Date().toISOString(),
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: 'Subscription successful.' })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Unknown error.' },
      { status: 500 }
    )
  }
}
