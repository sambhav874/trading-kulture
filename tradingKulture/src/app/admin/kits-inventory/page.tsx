'use client'

import React, { useState, useEffect } from 'react'
import { UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { useSession } from 'next-auth/react'
import { useToast } from "@/hooks/use-toast"

export default function KitsAndInventory() {
  const { data: session } = useSession()
  const [partners, setPartners] = useState([])
  const [inventory, setInventory] = useState([])
  const [distributions, setDistributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddInventory, setShowAddInventory] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPartners()
    fetchInventory()
    fetchDistributions()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners')
      const data = await response.json()
      setPartners(data)
    } catch (error) {
      console.error('Error fetching partners:', error)
      toast({
        title: "Error",
        description: "Failed to fetch partners",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInventory = async (partnerId = null) => {
    try {
      const url = partnerId ? `/api/inventory?partnerId=${partnerId}` : '/api/inventory'
      const response = await fetch(url)
      const data = await response.json()
      setInventory(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast({
        title: "Error",
        description: "Failed to fetch inventory",
        variant: "destructive"
      })
    }
  }

  const fetchDistributions = async () => {
    try {
      const response = await fetch('/api/kit-distribution');
      const data = await response.json();
      setDistributions(data);
    } catch (error) {
      console.error('Error fetching distributions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch distribution history",
        variant: "destructive"
      });
    }
  };

  const handleKitDistribution = async (partnerId, formData) => {
    try {
      const response = await fetch('/api/kit-distribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          kitsSent: parseInt(formData.quantity),
          amount: parseFloat(formData.amount),
          date: new Date().toISOString()
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Kits distributed successfully"
        })
        fetchPartners()
        fetchInventory(selectedPartnerId)
        fetchDistributions()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to distribute kits')
      }
    } catch (error) {
      console.error('Error distributing kits:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to distribute kits",
        variant: "destructive"
      })
    }
  }


  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        
          <h1 className="text-2xl font-bold">Kits and Inventory Management</h1>
          <p className="text-gray-600">Manage kit distribution and track inventory</p>
        </div>
        
      <div className="grid grid-cols-2 gap-4">
      
    </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Partner List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Total Kits Received</TableHead>
                <TableHead>Last Distribution</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner._id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>{partner.totalKits  || 0}</TableCell>
                  <TableCell>
                    {partner.lastDistribution
                      ? new Date(partner.lastDistribution).toLocaleDateString()
                      : 'No distributions yet'}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="bg-green-500 text-white hover:bg-green-600">
                          Send Kits
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Kits to {partner.name}</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleKitDistribution(partner._id, {
                              quantity: e.target.quantity.value,
                              amount: e.target.amount.value
                            })
                          }}
                          className="space-y-4 mt-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Number of Kits</Label>
                            <Input
                              id="quantity"
                              name="quantity"
                              type="number"
                              min="1"
                              required
                              placeholder="Enter quantity"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount per Kit</Label>
                            <Input
                              id="amount"
                              name="amount"
                              type="number"
                              min="0"
                              step="0.01"
                              required
                              placeholder="Enter amount"
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Confirm Distribution
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Distribution History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount per Kit</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributions.map((dist) => (
                  <TableRow key={dist._id}>
                    <TableCell>{dist.partnerId?.name || 'Unknown Partner'}</TableCell>
                    <TableCell>{dist.quantity}</TableCell>
                    <TableCell>${dist.amountPerKit}</TableCell>
                    <TableCell>${dist.totalAmount}</TableCell>
                    <TableCell>
                      {new Date(dist.distributionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={
                        dist.status === 'completed' ? 'text-green-500' :
                        dist.status === 'pending' ? 'text-yellow-500' :
                        'text-red-500'
                      }>
                        {dist.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
