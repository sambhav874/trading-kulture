'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import React from 'react'



interface SupportTicket {
  _id: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: string;
  reply: string;
}

const SupportPage = () => {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support`)
      if (!response.ok) {
        throw new Error('Failed to fetch tickets')
      }
      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit support ticket')
      }

      setSuccess('Support ticket submitted successfully!')
      setSubject('')
      setMessage('')
      fetchTickets() // Refresh the ticket list
    } catch (error  : any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleReplies = (ticketId: string) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Support</CardTitle>
            <CardDescription>
              If you have any questions or need assistance, please fill out the form below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full h-32"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default" className="mt-4">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="w-full bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Contact Us</CardTitle>
            <CardDescription className="text-primary-foreground/70">
              Get in touch with our support team directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5" />
                <span>TradingKulture</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5" />
                <span>+9999999999</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5" />
                <span>Jodhpur , India</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Your Support Tickets</CardTitle>
            <CardDescription>
              View your previous support tickets and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <React.Fragment key={ticket._id}>
                    <TableRow>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleReplies(ticket._id)}
                        >
                          {expandedTicket === ticket._id ? (
                            <>Hide Reply <ChevronUp className="ml-2 h-4 w-4" /></>
                          ) : (
                            <>View Reply <ChevronDown className="ml-2 h-4 w-4" /></>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedTicket === ticket._id && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className="bg-gray-50 p-4 rounded-md">
                            <h4 className="font-semibold mb-2">Original Message:</h4>
                            <p className="mb-4">{ticket.message}</p>
                            <h4 className="font-semibold mb-2">Reply:</h4>
                            {ticket.reply}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            {tickets.length === 0 && (
              <p className="text-center text-gray-500 mt-4">No support tickets found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SupportPage

