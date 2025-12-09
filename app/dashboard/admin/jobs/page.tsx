"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Trash2 } from "lucide-react"

interface Job {
  id: string
  title: string
  client_name: string
  status: string
  budget: number
  applications_count: number
  created_at: string
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/jobs")
        if (!res.ok) throw new Error("Failed to fetch jobs")
        const data = await res.json()
        setJobs(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return
    try {
      console.log(`[Admin] Deleting job ${jobId}`)
      const res = await fetch(`/api/admin/jobs/${jobId}`, { method: "DELETE" })
      const responseData = await res.json()
      console.log(`[Admin] Response:`, responseData, `Status: ${res.status}`)
      
      if (!res.ok) {
        throw new Error(responseData?.error || `Failed to delete job (${res.status})`)
      }
      
      setJobs(jobs.filter(j => j.id !== jobId))
      alert("Job deleted successfully!")
    } catch (err: any) {
      console.error(`[Admin] Error deleting job:`, err)
      alert(`Error: ${err.message}`)
    }
  }

  if (loading) return <div className="p-6">Loading jobs...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jobs Management</h1>
        <p className="text-muted-foreground">View and moderate job listings</p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded border border-border bg-background"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="text-sm text-muted-foreground pt-2">
            {filteredJobs.length} jobs
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Job Title</th>
                <th className="px-6 py-3 text-left font-medium">Client</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Budget</th>
                <th className="px-6 py-3 text-left font-medium">Applications</th>
                <th className="px-6 py-3 text-left font-medium">Posted</th>
                <th className="px-6 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredJobs.map(job => (
                <tr key={job.id} className="hover:bg-muted/50 transition">
                  <td className="px-6 py-4 font-medium">{job.title}</td>
                  <td className="px-6 py-4">{job.client_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      job.status === "open" ? "bg-green-100 text-green-700" :
                      job.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                      job.status === "completed" ? "bg-gray-100 text-gray-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">KES {job.budget.toLocaleString()}</td>
                  <td className="px-6 py-4">{job.applications_count}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/admin/jobs/${job.id}`}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:bg-red-100"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
