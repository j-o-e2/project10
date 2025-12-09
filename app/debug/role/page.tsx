"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function DebugRolePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          setMessage("Not logged in")
          setLoading(false)
          return
        }

        setUser(user)

        // Get user's profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          setMessage("Error loading profile: " + profileError.message)
        } else {
          setProfile(profileData)
        }
      } catch (err: any) {
        setMessage("Error: " + err.message)
      } finally {
        setLoading(false)
      }
    }

    loadUserInfo()
  }, [])

  const handleSetAdmin = async () => {
    if (!user) return

    setUpdating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const response = await fetch("/api/debug/set-admin-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage("✓ Role updated to admin! Reload the page.")
        setProfile({ ...profile, role: "admin" })
      } else {
        setMessage("✗ Error: " + result.error)
      }
    } catch (err: any) {
      setMessage("Error: " + err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Debug: Check Your Role</h1>

        {message && (
          <div
            className={`p-3 rounded border ${
              message.includes("✓")
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {user && (
          <div className="space-y-2">
            <p className="text-sm">
              <strong>User ID:</strong> {user.id}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        )}

        {profile && (
          <div className="space-y-2 p-3 bg-gray-50 rounded">
            <p className="text-sm">
              <strong>Current Role:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-white text-xs font-bold ${
                  profile.role === "admin"
                    ? "bg-green-600"
                    : profile.role === "client"
                      ? "bg-blue-600"
                      : "bg-orange-600"
                }`}
              >
                {profile.role || "NOT SET"}
              </span>
            </p>
            <p className="text-sm">
              <strong>Full Name:</strong> {profile.full_name || "—"}
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> {profile.phone || "—"}
            </p>
            <p className="text-sm">
              <strong>Email (from profile):</strong> {profile.email}
            </p>
          </div>
        )}

        {profile?.role !== "admin" && (
          <Button onClick={handleSetAdmin} disabled={updating} className="w-full">
            {updating ? "Updating..." : "Set Role to Admin"}
          </Button>
        )}

        {profile?.role === "admin" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✓ You are already an admin! You can now access /dashboard/admin
          </div>
        )}
      </Card>
    </div>
  )
}
