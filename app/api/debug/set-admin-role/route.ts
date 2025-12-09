import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

/**
 * DEBUG ENDPOINT: Set user role to admin
 * Usage: POST /api/debug/set-admin-role
 * Body: { userId: "uuid" }
 * 
 * WARNING: Only for development/debugging. Requires SUPABASE_SERVICE_ROLE_KEY.
 */

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    console.log("[set-admin-role] Setting role to admin for user:", userId)

    // Create service role client
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Update profile role to admin
    const { data, error } = await serviceClient
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId)
      .select()

    if (error) {
      console.error("[set-admin-role] Update failed:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[set-admin-role] ✓ Role updated successfully:", data)

    return NextResponse.json({
      success: true,
      message: "Role set to admin",
      data,
    })
  } catch (err: any) {
    console.error("[set-admin-role] Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Get current user's ID from auth header or query param
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Create service role client to verify user
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: { user }, error: userError } = await serviceClient.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get user's current profile
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("id, email, role, full_name")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[set-admin-role] Profile fetch error:", profileError)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile,
    })
  } catch (err: any) {
    console.error("[set-admin-role] GET error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
