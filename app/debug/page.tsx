"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DebugPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Debug Center</h1>

        <div className="grid gap-4">
          {/* Check/Set Admin Role */}
          <div className="border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold">1. Check/Set Admin Role</h2>
            <p className="text-sm text-gray-600">
              View your current profile role and set it to admin if needed.
            </p>
            <Link href="/debug/role">
              <Button className="w-full">Go to Role Debug</Button>
            </Link>
          </div>

          {/* Admin Dashboard Debug */}
          <div className="border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold">2. Admin Dashboard Debug</h2>
            <p className="text-sm text-gray-600">
              Step-by-step debug of admin dashboard initialization and stats fetching.
            </p>
            <Link href="/debug/admin-dashboard">
              <Button className="w-full">Debug Admin Dashboard</Button>
            </Link>
          </div>

          {/* Admin Tests */}
          <div className="border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold">3. Run Admin Tests</h2>
            <p className="text-sm text-gray-600">
              Run automated tests to check all admin functionality.
            </p>
            <Link href="/debug/admin-test">
              <Button className="w-full">Run Tests</Button>
            </Link>
          </div>

          {/* Go to Admin Dashboard */}
          <div className="border rounded-lg p-4 space-y-2 bg-green-50">
            <h2 className="font-semibold text-green-900">4. Real Admin Dashboard</h2>
            <p className="text-sm text-green-700">
              Once everything is working, go to the real admin dashboard.
            </p>
            <Link href="/dashboard/admin">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Go to Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2">Troubleshooting</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>Not seeing data?</strong> Check if your role is set to 'admin' in step 1.
            </p>
            <p>
              <strong>Profile not found?</strong> Make sure the RLS migration was applied (see below).
            </p>
            <p>
              <strong>API errors?</strong> Check the browser console and server logs for details.
            </p>
          </div>
        </div>

        {/* RLS Migration Info */}
        <div className="border-t pt-4 bg-yellow-50 p-4 rounded">
          <h3 className="font-semibold mb-2">RLS Migration Status</h3>
          <p className="text-sm text-yellow-800 mb-3">
            Make sure this SQL was run in your Supabase SQL Editor:
          </p>
          <pre className="bg-white border border-yellow-200 p-3 rounded text-xs overflow-auto mb-3">
{`DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "User can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);`}
          </pre>
          <p className="text-xs text-yellow-700">
            If not applied, go to Supabase → SQL Editor and run the above SQL.
          </p>
        </div>
      </Card>
    </div>
  )
}
