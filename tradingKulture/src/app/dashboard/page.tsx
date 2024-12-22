'use client'
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadStatusChart from './LeadStausChart';
import SalesChart from './SalesChart';
import { Label } from '@/components/ui/label';

const LeadTable = ({ leads, status, handleStatusUpdate }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>{status.charAt(0).toUpperCase() + status.slice(1)} Leads</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.filter(lead => lead.status === status).map((lead) => (
            <TableRow key={lead._id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.status}</TableCell>
              <TableCell>
                <Select
                  onValueChange={(value) => handleStatusUpdate(lead._id, value)}
                  defaultValue={lead.status}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="successful">Successful</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    if (session) {
      fetchLeads();
      fetchSales();
    }
  }, [session]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads?id=' + session.user.id);
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales?partnerId=' + session.user.id);
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      const response = await fetch(`/api/leads?id=${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleSaleRecord = async (leadId, formData) => {
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          amount: parseFloat(formData.amount),
          partnerId: session.user.id,
          date: new Date().toISOString()
        })
      });
      if (response.ok) {
        fetchSales();
        fetchLeads();
      }
    } catch (error) {
      console.error('Error recording sale:', error);
    }
  };

  console.log(sales);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Partner Dashboard</h1>
      <p className="mb-6">Welcome, {session.user.name}</p>
      
      <Tabs defaultValue="leads" className="w-full">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads">
          <div className="space-y-6">
            <LeadTable leads={leads} status="new" handleStatusUpdate={handleStatusUpdate} />
            <LeadTable leads={leads} status="contacted" handleStatusUpdate={handleStatusUpdate} />
            <LeadTable leads={leads} status="successful" handleStatusUpdate={handleStatusUpdate} />
            <LeadTable leads={leads} status="lost" handleStatusUpdate={handleStatusUpdate} />
          </div>
        </TabsContent>
        
        <TabsContent value="sales">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Record Sale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads
                      .filter(lead => lead.status === 'contacted' || lead.status === 'new')
                      .map((lead) => (
                        <TableRow key={lead._id}>
                          <TableCell>{lead.name}</TableCell>
                          <TableCell>{lead.status}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline">Record Sale</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Record Sale for {lead.name}</DialogTitle>
                                </DialogHeader>
                                <form 
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSaleRecord(lead._id, {
                                      amount: e.target.amount.value
                                    });
                                  }}
                                  className="space-y-4 mt-4"
                                >
                                  <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                      id="amount"
                                      name="amount"
                                      type="number"
                                      min="0"
                                      step="10"
                                      required
                                      placeholder="Enter amount"
                                    />
                                  </div>
                                  <Button type="submit" className="w-full">
                                    Record Sale
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

            <Card>
              <CardHeader>
                <CardTitle>Successful Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads
                      .filter(lead => lead.status === 'successful')
                      .map((lead) => {
                        const leadSales = sales.filter(sale => sale.leadId === lead._id);
                        return leadSales.map((sale, index) => (
                          <TableRow key={`${lead._id}-${index}`}>
                            <TableCell>{lead.name}</TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>{lead.mobileNo}</TableCell>
                            <TableCell>Rs {sale.amount.toFixed(2)}</TableCell>
                            <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ));
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadStatusChart leads={leads} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart sales={sales} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}