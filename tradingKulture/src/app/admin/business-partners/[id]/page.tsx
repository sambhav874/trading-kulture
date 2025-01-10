'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface Partner {
  name: string
  email: string
  phoneNumber: string
  city: string
  state: string
}

export default function EditPartner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id: userId } = useParams<{ id: string }>()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [partner, setPartner] = useState<Partner>({
    name: '',
    email: '',
    phoneNumber: '',
    city: '',
    state: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`)
      return
    }

    const fetchPartner = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners?id=${userId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        
        console.log('Fetched partner is :', data )
        setPartner(data)
        
      } catch (error) {
        console.error('Error fetching partner:', error)
        alert('Error fetching partner details')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user.role === 'admin' && userId) {
      fetchPartner()
    }
  }, [session, status, userId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partner),
      })
  
      const data = await response.json()
  
      if (response.ok) {
        alert('Partner updated successfully')
        router.push(`${process.env.NEXT_PUBLIC_API_URL}/admin/business-partners`)
      } else {
        alert(data.message || 'Error updating partner')
      }
    } catch (error) {
      console.error('Error updating partner:', error)
      alert('Failed to update partner')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPartner(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Partner</h1>
          <p className="text-gray-600 mt-1">Update partner information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Partner Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={partner.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={partner.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={partner.phoneNumber || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={partner.city || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={partner.state || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`${process.env.NEXT_PUBLIC_API_URL}/admin/business-partners`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}