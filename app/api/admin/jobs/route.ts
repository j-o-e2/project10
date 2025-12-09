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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Fetch all jobs with client details and application count
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(
        `
        id,
        title,
        status,
        budget,
        created_at,
        client_id,
        profiles (full_name)
      `
      )
      .order("created_at", { ascending: false })

    if (error) throw error

    // Get application counts for each job
    const jobsWithApplications = await Promise.all(
      (jobs || []).map(async (job: any) => {
        const { count, error: countError } = await supabase
          .from("job_applications")
          .select("id", { count: "exact", head: true })
          .eq("job_id", job.id)

        return {
          id: job.id,
          title: job.title,
          client_name: job.profiles?.full_name || "Unknown Client",
          status: job.status || "open",
          budget: job.budget || 0,
          applications_count: countError ? 0 : count || 0,
          created_at: job.created_at,
        }
      })
    )

    return NextResponse.json(jobsWithApplications)
  } catch (err: any) {
    console.error("Error fetching admin jobs:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
