import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // ignore
            }
          },
        },
      },
    )

    // Get current session to check auth state
    const { data: { session }, error } = await supabase.auth.getSession()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000')
    const callbackUrl = `${siteUrl}/api/auth/callback`

    return NextResponse.json({
      status: 'ok',
      config: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
        NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || 'NOT SET',
        computedSiteUrl: siteUrl,
        computedCallbackUrl: callbackUrl,
        SUPABASE_EMAIL_REDIRECT_TO: process.env.SUPABASE_EMAIL_REDIRECT_TO || 'NOT SET',
      },
      session: {
        user: session?.user?.email,
        authenticated: !!session,
        error: error?.message,
      },
      note: 'IMPORTANT: Check your Supabase dashboard Authentication > Email Templates > Confirm signup and verify the redirect URL is set to: ' + callbackUrl,
    }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
