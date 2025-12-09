import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone, role } = await request.json()

    const cookieStore = await cookies()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000')
    const emailRedirectTo = process.env.SUPABASE_EMAIL_REDIRECT_TO || `${siteUrl}/api/auth/callback`
    console.log('[v0] signup: siteUrl/emailRedirectTo', { siteUrl, emailRedirectTo, env_SUPABASE_EMAIL_REDIRECT_TO: process.env.SUPABASE_EMAIL_REDIRECT_TO })
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
              // Handle cookie setting errors
            }
          },
        },
      },
    )

    console.log('[v0] signup: creating user', { email, role })
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name,
          role,
          phone,
        },
      },
    })

    console.log('[v0] signup result:', { authData, authError: authError?.message })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (authData.user) {
      // Use a server-only service role Supabase client to insert into `profiles` so RLS doesn't block.
      // This client must use the `SUPABASE_SERVICE_ROLE_KEY` env var and never be exposed to the client.
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[v0] Missing SUPABASE_SERVICE_ROLE_KEY env var')
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
      }

      const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
      )

      // Mark email as needs verification (not auto-confirmed)
      const { error: updateError } = await serviceClient.auth.admin.updateUserById(authData.user.id, {
        email_confirm: false, // Ensure email is not auto-confirmed
      })

      if (updateError) {
        console.error('[v0] Failed to set email confirmation flag:', updateError)
        // Continue anyway
      }

      const { error: profileError, status, data: profileData } = await serviceClient
        .from("profiles")
        .insert([
          {
            id: authData.user.id,
            email,
            full_name,
            phone,
            role,
            created_at: new Date().toISOString(),
          },
        ])

      if (profileError) {
        console.error("[v0] Profile creation error:", profileError)
        return NextResponse.json(
          { error: `Failed to create user profile: ${profileError.message || profileError}` },
          { status: 500 },
        )
      }

      console.log('[v0] Profile created:', { status, profileData })
    }

    return NextResponse.json({ 
      message: "Signup successful. Check your email for verification link.", 
      user: authData.user,
      note: "Email verification link expires in 24 hours. Check spam folder if not found."
    }, { status: 200 })
  } catch (error) {
    console.error("[v0] Signup API error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
