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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {Loader2} from 'lucide-react'
import { Badge } from "@/components/ui/badge";


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
  const [kits, setKits] = useState({ available: 0, total: 0, distributed: 0 });
  const [kitHistory, setKitHistory] = useState([]);
  const [receivedKits, setReceivedKits] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [kitDataLoading, setKitDataLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchLeads();
      fetchSales();
      fetchKits();
      fetchKitHistory();
      fetchReceivedKits();
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

  const fetchKits = async () => {
    try {
      const response = await fetch('/api/kits-distribution?partnerId=' + session.user.id);
      const data = await response.json();
      if (response.ok) {
        setKits(data.inventory || { available: 0, total: 0, distributed: 0 });
      }
    } catch (error) {
      console.error('Error fetching kits:', error);
    } finally {
      setKitDataLoading(false);
    }
  };

  const fetchKitHistory = async () => {
    try {
      const response = await fetch('/api/kits-distribution/request?partnerId=' + session.user.id);
      const data = await response.json();
      if (response.ok) {
        setKitHistory(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching kit history:', error);
    }
  };

  const fetchReceivedKits = async () => {
    try {
      const response = await fetch('/api/kit-distribution?partnerId='+session.user.id, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setReceivedKits(data || []);
      }
    } catch (error) {
      console.error('Error fetching received kits:', error);
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

  const handleKitRequest = async (formData) => {
    setRequestLoading(true);
    try {
      const response = await fetch('/api/kits-distribution/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: session.user.id,
          quantity: parseInt(formData.quantity)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request kits');
      }

      const data = await response.json();
      fetchKitHistory();

      alert('Kit request submitted successfully!');
    } catch (error) {
      console.error('Error requesting kits:', error);
      alert(error.message || 'Failed to submit kit request');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Partner Dashboard</h1>
      <p className="mb-6">Welcome, {session.user.name}</p>
      
      <Tabs defaultValue="leads" className="w-full">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="kits">Kits</TabsTrigger>
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
                            <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
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
        
        <TabsContent value="kits">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <Card className="flex-1 mr-4">
                <CardHeader>
                  <CardTitle>Current Kit Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  {kitDataLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading inventory...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold mb-2">
                        {kits.available}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Available kits for distribution</p>
                        <p>Total allocated: {kits.total}</p>
                        <p>Already distributed: {kits.distributed}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={kitDataLoading}>Request More Kits</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Request Additional Kits</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please specify the quantity of kits you need.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleKitRequest({
                        quantity: e.target.quantity.value
                      });
                    }}
                    className="space-y-4 mt-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity Needed</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        required
                        placeholder="Enter quantity"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction type="submit" disabled={requestLoading}>
                        {requestLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Request'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Kit Request History</CardTitle>
              </CardHeader>
              <CardContent>
                {kitDataLoading ? (
                  <div className="flex items-center justify-center py-8 space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading history...</span>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kitHistory.length > 0 ? (
                          kitHistory.map((record) => (
                            <TableRow key={record._id}>
                              <TableCell>
                                {new Date(record.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{record.quantity}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    record.status === 'approved' ? 'outline' :
                                    record.status === 'pending' ? 'secondary' :
                                    'destructive'
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8">
                              <div className="text-muted-foreground space-y-2">
                                <p>No kit requests made yet</p>
                                <p className="text-sm">Use the "Request More Kits" button to make your first request</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Received Kits History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date Received</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivedKits.length > 0 ? (
                        receivedKits.map((kit) => (
                          <TableRow key={kit._id}>
                            <TableCell>
                              {new Date(kit.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{kit.quantity}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  kit.status === 'delivered' ? 'outline' :
                                  kit.status === 'in-transit' ? 'secondary' :
                                  'destructive'
                                }
                              >
                                {kit.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{kit.notes || '-'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="text-muted-foreground space-y-2">
                              <p>No kits received yet</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}