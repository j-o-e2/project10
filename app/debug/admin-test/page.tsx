"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TestDebugPage() {
  const [tests, setTests] = useState<Array<{ name: string; status: string; result: any }>>([])
  const [running, setRunning] = useState(false)

  const runTests = async () => {
    setRunning(true)
    const results: Array<{ name: string; status: string; result: any }> = []

    try {
      // Test 1: Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      results.push({
        name: "Get Current User",
        status: userError ? "FAILED" : "OK",
        result: user ? `${user.email} (${user.id})` : "No user",
      })

      if (user) {
        // Test 2: Get access token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        results.push({
          name: "Get Session/Token",
          status: sessionError || !session ? "FAILED" : "OK",
          result: session?.access_token ? "Token available" : "No token",
        })

        // Test 3: Fetch own profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        results.push({
          name: "Fetch Own Profile",
          status: profileError ? "FAILED" : "OK",
          result: profile
            ? `Role: ${profile.role}, Name: ${profile.full_name}`
            : profileError?.message || "No data",
        })

        // Test 4: Call admin stats API
        if (session?.access_token) {
          const statsRes = await fetch("/api/admin/stats", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })
          const statsData = await statsRes.json()
          results.push({
            name: "Call Admin Stats API",
            status: statsRes.ok ? "OK" : "FAILED",
            result: statsRes.ok ? JSON.stringify(statsData, null, 2) : statsData.error,
          })
        }
      }
    } catch (err: any) {
      results.push({
        name: "Test Error",
        status: "ERROR",
        result: err.message,
      })
    }

    setTests(results)
    setRunning(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Debug: Admin Dashboard Tests</h1>

        <Button onClick={runTests} disabled={running} className="w-full">
          {running ? "Running Tests..." : "Run Tests"}
        </Button>

        <div className="space-y-3">
          {tests.map((test, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border ${
                test.status === "OK"
                  ? "bg-green-50 border-green-200"
                  : test.status === "FAILED" || test.status === "ERROR"
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <p className="font-semibold text-sm">{test.name}</p>
              <p className={`text-xs mt-1 ${test.status === "OK" ? "text-green-700" : test.status === "FAILED" || test.status === "ERROR" ? "text-red-700" : "text-yellow-700"}`}>
                {test.status}
              </p>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                {typeof test.result === "string" ? test.result : JSON.stringify(test.result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
