'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Save } from 'lucide-react'

interface CommissionSlab {
  min: number
  max: number
  rate: number
}

interface Sale {
  id: string
  date: string
  amount: number
  isFirstMonth: boolean
  isSecondMonth: boolean
  amountChargedFirstMonth: number
  amountChargedSecondMonth: number
}

interface CommissionData {
  partnerId: string
  partnerName: string
  slabs: Record<string, CommissionSlab>
  totalSales: number
  currentSlab: string
  estimatedCommission: number
  sales: Sale[]
}

const CommissionCalculatorPage = () => {
  const params = useParams()
  const router = useRouter()
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const partnerId = params?.id as string

  useEffect(() => {
    if (partnerId) {
      fetchCommissionData()
    }
  }, [partnerId])

  const fetchCommissionData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/commissions/calculate?partnerId=${partnerId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch commission data')
      }
      const data = await response.json()
      setCommissionData(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch commission data: ${(error as Error).message}`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  

  const calculateCommission = (sale: Sale) => {
    if (!commissionData) return 0

    const { slabs } = commissionData
    const eligibleSales = commissionData.sales.filter(s => 
      (s.isFirstMonth || s.isSecondMonth) && s.date <= sale.date
    ).length
    let commissionRate = 0

    for (const slab of Object.values(slabs)) {
      if (eligibleSales >= slab.min && eligibleSales <= slab.max) {
        commissionRate = slab.rate / 100
        break
      }
    }

    let commission = 0
    if (sale.isFirstMonth) {
      commission = sale.amountChargedFirstMonth * commissionRate
    }
    if (sale.isSecondMonth && sale.isFirstMonth) {
      commission = sale.amountChargedSecondMonth * commissionRate * 0.75 // 25% depreciation for second month renewals
    }

    return commission
  }


  const calculateTotaledCommission = (sale: Sale) => {
    if (!commissionData) return 0

    const { slabs } = commissionData
    const eligibleSales = commissionData.sales.filter(s => 
      (s.isFirstMonth || s.isSecondMonth) && s.date <= sale.date
    ).length
    let commissionRate = 0

    for (const slab of Object.values(slabs)) {
      if (eligibleSales >= slab.min && eligibleSales <= slab.max) {
        commissionRate = slab.rate / 100
        break
      }
    }

    let commission = 0
    if (sale.isFirstMonth) {
      commission = sale.amountChargedFirstMonth * commissionRate
    }
    if (sale.isSecondMonth) {
      commission += sale.amountChargedSecondMonth * commissionRate * 0.75 // 25% depreciation for second month renewals
    }

    return commission
  }

  const getTotalCommission = () => {
    if (!commissionData) return 0
    return commissionData.sales.reduce((total, sale) => total + calculateTotaledCommission(sale), 0)
  }

  const getEligibleSalesCount = () => {
    if (!commissionData) return 0
    return commissionData.sales.filter(sale => sale.isFirstMonth || sale.isSecondMonth).length
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Commission Calculator for {commissionData?.partnerName}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {commissionData ? (
        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
                <CardDescription>Partner's sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Total Sales</dt>
                    <dd className="text-sm">{commissionData.totalSales}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Eligible Sales</dt>
                    <dd className="text-sm">{getEligibleSalesCount()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Current Slab</dt>
                    <dd className="text-sm">{commissionData.currentSlab}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Total Commission</dt>
                    <dd className="text-sm">
                      ₹{getTotalCommission().toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Slabs</CardTitle>
                <CardDescription>
                  Configure commission rates for different sales ranges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sales Range</TableHead>
                      <TableHead>Rate (%)</TableHead>
                      
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(commissionData.slabs).map(
                      ([key, slab]) => (
                        <TableRow key={key}>
                          <TableCell>
                            {slab.min} - {slab.max}
                          </TableCell>
                            <TableCell>{slab.rate}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales and Commissions</CardTitle>
              <CardDescription>Detailed view of all sales and calculated commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>First Month Amount</TableHead>
                    <TableHead>Second Month Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Total Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionData.sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell>₹{sale.amountChargedFirstMonth}</TableCell>
                      <TableCell>₹{sale.amountChargedSecondMonth}</TableCell>
                      <TableCell>
                        {sale.isFirstMonth && sale.isSecondMonth ? 'First & Second Month' :
                         sale.isFirstMonth ? 'First Month' : 
                         sale.isSecondMonth ? 'Second Month' : 
                         'No Subscription'}
                      </TableCell>
                      <TableCell>₹{calculateCommission(sale).toFixed(2)}</TableCell>
                      <TableCell>₹{calculateTotaledCommission(sale).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">No commission data found.</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CommissionCalculatorPage

