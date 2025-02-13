"use client";

import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  trend?: number
  iconBgColor?: string
}

export function MetricCard({ 
  icon, 
  title, 
  value, 
  trend, 
  iconBgColor = 'bg-primary/10' 
}: MetricCardProps) {
  return (
    <div className="bg-card-bg p-4 sm:p-6 rounded-xl">
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <button 
          className="text-text-secondary hover:text-text-primary transition-colors p-2 -mr-2"
          aria-label="Mais opções"
        >
          <EllipsisHorizontalIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div>
        <span className="text-[0.65rem] sm:text-sm text-text-secondary">{title}</span>
        <div className="flex flex-wrap items-end gap-1 sm:gap-2 mt-1">
          <strong className="text-lg sm:text-xl font-bold break-all">{value}</strong>
          {trend && (
            <span className={`text-[0.65rem] sm:text-sm ${trend > 0 ? 'text-success' : 'text-secondary'} whitespace-nowrap`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}