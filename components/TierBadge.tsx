"use client"

import React from "react"
import { Star, Shield, Crown, Trophy, Award } from "lucide-react"

interface TierBadgeProps {
  tier: "basic" | "verified" | "trusted" | "elite" | "pro"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function TierBadge({ tier, size = "md", showLabel = true, className = "" }: TierBadgeProps) {
  const tierConfig = {
    basic: {
      icon: "⭕",
      name: "Basic",
      color: "bg-gray-100 text-gray-700 border-gray-300",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
    },
    verified: {
      icon: "✓",
      name: "Verified",
      color: "bg-blue-100 text-blue-700 border-blue-300",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
    },
    trusted: {
      icon: "⭐",
      name: "Trusted",
      color: "bg-amber-100 text-amber-700 border-amber-300",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
    },
    elite: {
      icon: "👑",
      name: "Elite",
      color: "bg-red-100 text-red-700 border-red-300",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
    },
    pro: {
      icon: "🏆",
      name: "Pro",
      color: "bg-purple-100 text-purple-700 border-purple-300",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
    },
  }

  const config = tierConfig[tier]
  const sizeClass = size === "sm" ? "px-2 py-1 text-xs" : size === "lg" ? "px-4 py-3 text-lg" : "px-3 py-2 text-sm"

  return (
    <div
      className={`inline-flex items-center gap-2 border rounded-full ${sizeClass} ${config.color} font-semibold ${className}`}
    >
      <span className={size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base"}>{config.icon}</span>
      {showLabel && <span>{config.name}</span>}
    </div>
  )
}

interface TierProgressProps {
  tier: "basic" | "verified" | "trusted" | "elite" | "pro"
  avgRating: number
  totalReviews: number
  className?: string
}

export function TierProgress({ tier, avgRating, totalReviews, className = "" }: TierProgressProps) {
  const tierRequirements = {
    basic: {
      name: "Basic",
      nextTier: "Verified",
      requirementsMet: totalReviews >= 1 && avgRating >= 3.0,
      progress: Math.min((totalReviews / 1) * 100, 100),
      description: "New account - 0 reviews",
      requirements: ["1 review with 3+ stars"],
    },
    verified: {
      name: "Verified",
      nextTier: "Trusted",
      requirementsMet: totalReviews >= 10 && avgRating >= 4.0,
      progress: Math.min((totalReviews / 10) * 100, 100),
      description: "Email verified + 1 review (3+ stars)",
      requirements: [
        `${totalReviews}/10 reviews`,
        `${avgRating.toFixed(1)}/4.0 average rating`,
      ],
    },
    trusted: {
      name: "Trusted",
      nextTier: "Elite",
      requirementsMet: totalReviews >= 50 && avgRating >= 4.8,
      progress: Math.min((totalReviews / 50) * 100, 100),
      description: "10+ reviews, 4.0+ average rating",
      requirements: [
        `${totalReviews}/50 reviews`,
        `${avgRating.toFixed(1)}/4.8 average rating`,
      ],
    },
    elite: {
      name: "Elite",
      nextTier: "Pro",
      requirementsMet: false, // Pro requires 6+ months
      progress: 100,
      description: "50+ reviews, 4.8+ average rating",
      requirements: [
        `${totalReviews} reviews ✓`,
        `${avgRating.toFixed(1)} average rating ✓`,
        "Waiting for 6 months membership",
      ],
    },
    pro: {
      name: "Pro",
      nextTier: null,
      requirementsMet: true,
      progress: 100,
      description: "Maximum tier - dedicated support & priority booking",
      requirements: [
        `${totalReviews} reviews ✓`,
        `${avgRating.toFixed(1)} average rating ✓`,
        "6+ months membership ✓",
      ],
    },
  }

  const config = tierRequirements[tier]

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{config.name} Tier</h3>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Progress to {config.nextTier}</span>
          <span className="text-xs font-semibold text-gray-900">{Math.round(config.progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
            style={{ width: `${config.progress}%` }}
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Requirements</h4>
        <ul className="space-y-1">
          {config.requirements.map((req, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Steps */}
      {config.nextTier && !config.requirementsMet && (
        <div className="mt-4 rounded-lg bg-blue-50 p-3 border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Next goal:</span> Reach {config.nextTier} status
          </p>
        </div>
      )}

      {config.requirementsMet && config.nextTier && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 border border-green-200">
          <p className="text-sm text-green-900">
            <span className="font-semibold">🎉 Congratulations!</span> You're ready for {config.nextTier} status
          </p>
        </div>
      )}
    </div>
  )
}

interface BadgeVerifiedProps {
  isVerified: boolean
  tier: string
  className?: string
}

export function BadgeVerified({ isVerified, tier, className = "" }: BadgeVerifiedProps) {
  if (!isVerified) return null

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-300 ${className}`}>
      <span className="text-green-700 text-sm font-semibold">✓ Verified</span>
    </div>
  )
}

interface TierCardProps {
  tier: "basic" | "verified" | "trusted" | "elite" | "pro"
  avgRating: number
  totalReviews: number
  badgeVerified: boolean
  fullName?: string
  email?: string
  className?: string
}

export function TierCard({
  tier,
  avgRating,
  totalReviews,
  badgeVerified,
  fullName,
  email,
  className = "",
}: TierCardProps) {
  const tierEmojis = {
    basic: "⭕",
    verified: "✓",
    trusted: "⭐",
    elite: "👑",
    pro: "🏆",
  }

  const tierColors = {
    basic: "text-gray-700",
    verified: "text-blue-700",
    trusted: "text-amber-700",
    elite: "text-red-700",
    pro: "text-purple-700",
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          {fullName && <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>}
          {email && <p className="text-sm text-gray-600">{email}</p>}
        </div>
        <div className={`text-4xl ${tierColors[tier]}`}>{tierEmojis[tier]}</div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <TierBadge tier={tier} size="md" showLabel={true} />
        {badgeVerified && <BadgeVerified isVerified={true} tier={tier} />}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-600 font-medium">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
          <p className="text-xs text-gray-500">out of 5.0</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-600 font-medium">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
          <p className="text-xs text-gray-500">reviews received</p>
        </div>
      </div>

      <TierProgress tier={tier} avgRating={avgRating} totalReviews={totalReviews} />
    </div>
  )
}
