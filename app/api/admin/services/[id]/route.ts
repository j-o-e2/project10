import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const serviceId = params.id
    const { name, description } = await request.json()

    // Update the service
    const { data, error } = await supabase
      .from("services")
      .update({ name, description })
      .eq("id", serviceId)
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: "Service not found" }, { status: 404 })

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("[admin/services/:id PATCH] Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const serviceId = params.id

    // Delete the service
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[admin/services/:id] Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
