'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PartnerStats {
  name: string
  email: string
  totalLeadsAssigned: number
  totalSales: number
  revenue: number
  monthlyStats: {
    month: string
    leadsAssigned: number
    sales: number
    revenue: number
  }[]
  yearlyStats: {
    year: string
    leadsAssigned: number
    sales: number
    revenue: number
  }[]
}

export function PartnerStatsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stats, setStats] = useState<PartnerStats | null>(null)
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

    fetchPartnerStats()
  }, [session, status, router, searchParams])

  const fetchPartnerStats = async () => {
    try {
      const partnerId = searchParams.get('id')
      if (!partnerId) {
        router.push('/admin/partner-stats')
        return
      }

      const response = await fetch(`/api/partners/stats?partnerId=${partnerId}`)
      const data = await response.json()
      
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching partner stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null // The loading state is handled by the Suspense boundary
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Partner not found</h1>
        <Button onClick={() => router.push('/admin/partner-stats')}>
          Back to Partners
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Partner Analysis: {stats.name}</h1>
        <Button onClick={() => router.push('/admin/partner-stats')}>
          Back to Partners
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Leads Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeadsAssigned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leadsAssigned" name="Leads Assigned" fill="#8884d8" />
                <Bar dataKey="sales" name="Sales" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yearly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.yearlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leadsAssigned" name="Leads Assigned" fill="#8884d8" />
                <Bar dataKey="sales" name="Sales" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Leads Assigned</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.monthlyStats.map((month) => (
                <TableRow key={month.month}>
                  <TableCell>{month.month}</TableCell>
                  <TableCell className="text-right">{month.leadsAssigned}</TableCell>
                  <TableCell className="text-right">{month.sales}</TableCell>
                  <TableCell className="text-right">₹{month.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yearly Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Leads Assigned</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.yearlyStats.map((year) => (
                <TableRow key={year.year}>
                  <TableCell>{year.year}</TableCell>
                  <TableCell className="text-right">{year.leadsAssigned}</TableCell>
                  <TableCell className="text-right">{year.sales}</TableCell>
                  <TableCell className="text-right">₹{year.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

