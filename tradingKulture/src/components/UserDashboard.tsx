'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { QueryCard } from './QueryCard'

interface Query {
  _id: string
  query: string
  reply: string
  createdBy: string
  resolvedBy: string | null
  createdAt: string
  updatedAt: string
}

const UserDashboard = () => {
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [queries, setQueries] = useState<Query[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchQueries()
    }
  }, [session])

  const fetchQueries = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/queries?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setQueries(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch queries',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch queries',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          createdBy: session?.user?.id,
        }),
      })
      if (response.ok) {
        setQuery('')
        toast({
          title: 'Success',
          description: 'Query submitted successfully!',
        })
        fetchQueries()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to submit query',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error submitting query:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit query',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Submit a New Query</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuerySubmit} className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query here"
              required
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Query'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Your Queries</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queries.map((query) => (
          <QueryCard key={query._id} query={query} />
        ))}
      </div>
    </div>
  )
}

export default UserDashboard

