"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { QueryCard } from "./QueryCard"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpCircle, BarChart2, BookOpen, ChevronRight, Clock, MessageCircle, Plus } from "lucide-react"
import Link from "next/link"
import { Badge } from "./ui/badge"
import Image from "next/image"

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
  const [query, setQuery] = useState("")
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/queries?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setQueries(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch queries",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching queries:", error)
      toast({
        title: "Error",
        description: "Failed to fetch queries",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/queries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          createdBy: session?.user?.id,
        }),
      })
      if (response.ok) {
        setQuery("")
        toast({
          title: "Success",
          description: "Query submitted successfully!",
        })
        fetchQueries()
      } else {
        toast({
          title: "Error",
          description: "Failed to submit query",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting query:", error)
      toast({
        title: "Error",
        description: "Failed to submit query",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Rest of your existing fetch and submit handlers...

  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* Trading Journal Promotion */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Card className="bg-background-light/50 border-primary/20 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 space-y-4">
                <Badge variant="outline" className="border-[#00ff00]/40 text-[#00ff00]">
                  New Feature
                </Badge>
                <h2 className="text-2xl font-bold text-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.3)]">
                  Upgrade Your Trading Game
                </h2>
                <p className="text-gray-400">
                  Track your trades, analyze performance, and improve your strategy with our comprehensive Trading
                  Journal.
                </p>
                <div className="space-y-2 py-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <BarChart2 className="w-5 h-5 text-[#00ff00]" />
                    Advanced Analytics
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <BookOpen className="w-5 h-5 text-[#00ff00]" />
                    Detailed Trade Logs
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <ArrowUpCircle className="w-5 h-5 text-[#00ff00]" />
                    Performance Tracking
                  </div>
                </div>
                <Link href={process.env.NEXT_PUBLIC_TRADING_JOURNAL_URL as string}>
                  <Button className="bg-[#00ff00] text-black hover:bg-[#00ff00]/90 shadow-[0_0_10px_rgba(0,255,0,0.3)]">
                    Try Trading Journal
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="relative hidden md:block bg-black/20 h-full">
                <div className="absolute inset-0 bg-black to-transparent" />
                <div className="relative h-full flex items-center justify-center ">
                  <Image
                    src="/logo.jpg"
                    alt="Trading Journal Preview"
                    width={360}
                    height={240}
                    className="max-w-[100%] h-auto object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Query Submission */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="mb-8 bg-background-light/50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary neon-text flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Submit a New Query
            </CardTitle>
            <CardDescription className="text-gray-400">
              Ask questions and get expert assistance with your trading queries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuerySubmit} className="space-y-4">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query here"
                required
                className="min-h-[100px] bg-background border-primary/20 text-gray-100 placeholder:text-gray-500"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-background hover:bg-primary/90 neon-shadow"
              >
                {isLoading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Query
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Queries List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary neon-text">Your Queries</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {queries.map((query, index) => (
              <motion.div
                key={query._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <QueryCard query={query} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default UserDashboard

