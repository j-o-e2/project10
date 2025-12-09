"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Upload } from "lucide-react"
import Image from "next/image"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: any
  onSave: (updatedProfile: any) => void
}

export default function EditProfileModal({ isOpen, onClose, profile, onSave }: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    avatar_url: profile?.avatar_url || "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>(profile?.avatar_url || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null

    try {
      const fileExtension = avatarFile.name.split('.').pop()
      const fileName = `${userId}/avatar.${fileExtension}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

      return data.publicUrl
    } catch (err: any) {
      console.error("Avatar upload error:", err)
      throw new Error("Failed to upload avatar: " + (err.message || "Unknown error"))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // First, prepare the data to update
      const updateData = { ...formData }

      // If avatar file exists, upload it first
      if (avatarFile) {
        try {
          const avatarUrl = await uploadAvatar(user.id)
          if (avatarUrl) {
            updateData.avatar_url = avatarUrl
          }
        } catch (avatarErr) {
          console.error("Avatar upload failed:", avatarErr)
          // Continue with profile update even if avatar fails
          setError("Profile updated but avatar upload failed. Try again.")
        }
      }

      // Update profile with new data
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      onSave(data)
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
      console.error("Profile update error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b">
            <div className="relative w-24 h-24 rounded-full bg-muted overflow-hidden border-2 border-dashed border-muted-foreground/30">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Upload className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Photo
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAvatarPreview("")
                    setAvatarFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max 5MB)</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Your location"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
