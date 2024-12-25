'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Partner {
  id: string
  name: string
  email: string
  totalLeadsAssigned: number
  totalSales: number
  revenue: number
}

export default function PartnerStats() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchPartners()
  }, [session, status, router])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners')
      const data = await response.json()
      console.log(data)
      
      if (response.ok) {
        // Transform the data to include statistics
        const partnersWithStats = await Promise.all(
          data.map(async (partner: any) => {
            const statsResponse = await fetch(`/api/partners/stats?partnerId=${partner._id}`)
            const stats = await statsResponse.json()
            
            return {
              id: partner._id,
              name: partner.name,
              email: partner.email,
              totalLeadsAssigned: stats.totalLeadsAssigned || 0,
              totalLeads: stats.totalLeads || 0,
              totalSales: stats.totalSales || 0,
              revenue: stats.revenue || 0
            }
          })
        )
        setPartners(partnersWithStats)
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-[300px]" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Partner Statistics</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Partners Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Email</TableHead>
                
                <TableHead className="text-right">Total Leads</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Revenue (₹)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>{partner.name}</TableCell>
                  <TableCell>{partner.email}</TableCell>
                  <TableCell className="text-right">{partner.totalLeadsAssigned}</TableCell>
                  <TableCell className="text-right">{partner.totalSales}</TableCell>
                  <TableCell className="text-right">₹{partner.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/admin/partner-stats/analysis?id=${partner.id}`)}
                    >
                      Analyze
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}