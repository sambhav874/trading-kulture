'use client'

import { Suspense } from 'react'
import { PartnerStatsContent } from './analysis'
import { Skeleton } from '@/components/ui/skeleton'

export default function PartnerAnalysis() {
  return (
    <Suspense fallback={<PartnerAnalysisLoading />}>
      <PartnerStatsContent />
    </Suspense>
  )
}

function PartnerAnalysisLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-8 w-[300px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  )
}

