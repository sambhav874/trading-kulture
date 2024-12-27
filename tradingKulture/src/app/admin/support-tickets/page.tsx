'use client'
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Ticket {
  _id: string;
  subject: string;
  message: string;
  status: string;
  partnerId: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      const data = await response.json();
      setTickets(data);
    } catch (error : any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!reply) {
      setError('Reply cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support?id=${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply }),
      });

      if (!response.ok) {
        throw new Error('Failed to close ticket');
      }

      setReply('');
      setSelectedTicketId(null);
      fetchTickets(); // Refresh ticket list
    } catch (error : any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Partner</TableHead> 
                    <TableHead>Partner Email</TableHead> 
                    <TableHead>Created At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket : Ticket) => (
                    <TableRow key={ticket._id}>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </TableCell>
                      <TableCell>{ticket.partnerId.name}</TableCell>
                      <TableCell>{ticket.partnerId.email}</TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button onClick={() => setSelectedTicketId(ticket._id)}>Reply</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedTicketId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reply to Ticket</CardTitle>
              <CardDescription>
                Subject: {tickets.find((ticket : Ticket) => ticket._id === selectedTicketId)?.subject }
              </CardDescription>
              <CardDescription>
                Message: {tickets.find((ticket : Ticket) => ticket._id === selectedTicketId)?.message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full"
              />
              <Button onClick={() => handleReply(selectedTicketId)} className="mt-4">
                Submit Reply
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPage;