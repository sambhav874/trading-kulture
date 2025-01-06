'use client'
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {Loader2, Save} from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import AdminNotificationPanel from '@/components/AdminNotificationPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUploadZone from '@/components/FileUploadZone';
import UserDashboard from '@/components/UserDashboard';


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

interface Query {
  _id: string;
  query: string;
  reply: string;
  createdAt: string;
  resolvedBy: string | null;
}

interface QueryTableProps {
  queries: Query[];
  onQueryUpdate: () => void;
}


const LeadTable = ({ leads , status, handleStatusUpdate } : any) => (
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
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            {status !== 'successful' && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.filter((lead : any) => lead.status === status).map((lead : any) => (
            <TableRow key={lead._id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.mobileNo}</TableCell>
              <TableCell>{lead.status}</TableCell>
              {status !== 'successful' && (
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
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              )}
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);




export const QueryTable: React.FC<QueryTableProps> = ({ queries, onQueryUpdate }) => {
  const { data: session } = useSession();
  const [responses, setResponses] = useState<{ [key: string]: string }>({});

  const handleResponseChange = (queryId: string, value: string) => {
    setResponses(prev => ({ ...prev, [queryId]: value }));
  };

  const handleResponseSubmit = async (queryId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/queries`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          _id: queryId, 
          reply: responses[queryId], 
          resolvedBy: session?.user?.id,
          status: 'closed'
        }),
      });
      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Response submitted successfully!',
          variant: 'default',
        });
        onQueryUpdate();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit response.',
        variant: 'destructive',
      });
      console.error('Error updating response:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Queries</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Created At</TableHead>
              <TableHead>Query & Response</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queries.map((query: Query) => (
              <TableRow key={query._id}>
                <TableCell className="align-top">
                  {new Date(query.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="bg-muted p-2 rounded-md">
                      <p className="font-medium">Query:</p>
                      <p>{query.query}</p>
                    </div>
                    <Textarea
                      placeholder="Enter response"
                      value={responses[query._id] ?? query.reply}
                      onChange={(e) => handleResponseChange(query._id, e.target.value)}
                      className="w-full min-h-[100px]"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={query.resolvedBy ? "default" : "secondary"}>
                    {query.resolvedBy ? "Closed" : "Open"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleResponseSubmit(query._id)}
                    disabled={!responses[query._id] && !query.reply || query.resolvedBy}
                  >
                    Submit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );}

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
  const [firstMonthSubscription, setFirstMonthSubscription] = useState('no');
  const [renewalSecondMonth, setRenewalSecondMonth] = useState('no');
  const [amountChargedFirstMonth, setAmountChargedFirstMonth] = useState<string | null>(null);
  const [amountChargedSecondMonth, setAmountChargedSecondMonth] = useState<string | null>(null);

  const [commissionData, setCommissionData] = useState<CommissionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [queries, setQueries] = useState([]);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mobileNo: '',
    email: '',
    city: '',
    platform: 'Facebook',
    assignedTo: session?.user.id
  });
  const platforms = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'];
  
  
  
  useEffect(() => {
    if (session) {
      if(session.user.role === 'partner'){
      fetchLeads();
      fetchSales();
      fetchKits();
      fetchKitHistory();
      fetchReceivedKits();
      fetchCommissionData();
      fetchQueries();
      setFormData((prev) => ({
        ...prev,
        assignedTo: session?.user.id
    }));
      }
    }
    
  }, [session]);

  
  

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) {
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`);
    return null;
  }

  const fetchCommissionData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/commissions/calculate?partnerId=${session?.user.id}`)
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

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads?id=` + session.user.id);
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales?partnerId=` + session.user.id);
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const fetchKits = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kits-distribution?partnerId=` + session.user.id);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kits-distribution/request?partnerId=` + session.user.id);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kit-distribution?partnerId=` + session.user.id, {
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

  const fetchQueries = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/queries`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setQueries(data || []);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };

  const handleStatusUpdate = async (leadId : any, newStatus : any)  => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads?id=${leadId}`, {
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

  const handleSaleRecord = async (leadId : any, formData : any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          amount: parseFloat(formData.amount),
          address: formData.address,
          state: formData.state,
          pincode: formData.pincode,
          partnerId: session.user.id,
          firstMonthSubscription,
          amountChargedFirstMonth: amountChargedFirstMonth ? parseFloat(amountChargedFirstMonth) : null,
          renewalSecondMonth,
          amountChargedSecondMonth: amountChargedSecondMonth ? parseFloat(amountChargedSecondMonth) : null,
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

  const handleKitRequest = async (formData : any) => {
    setRequestLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kits-distribution/request`, {
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
    } catch (error : any) {
      console.error('Error requesting kits:', error);
      alert(error.message || 'Failed to submit kit request');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleUpdateSubscription = async (leadId : any, formData : any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales?id=` + leadId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          firstMonthSubscription: formData.firstMonthSubscription,
          amountChargedFirstMonth: formData.amountChargedFirstMonth,
          renewalSecondMonth: formData.renewalSecondMonth,
          amountChargedSecondMonth: formData.amountChargedSecondMonth
        })
      });
      if (response.ok) {
        alert('Subscription updated successfully!');
        fetchSales(); // Refresh sales data
      } else {
        alert('Failed to update subscription.');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }}


    const handleFileUpload = async (formData: FormData) => {
      setUploading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/upload`, {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          const result = await response.json();
          alert(`Successfully uploaded ${result.count} leads`);
          fetchLeads(); // Refresh the leads list
        } else {
          const error = await response.json();
          alert(`Error uploading file: ${error.message}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');
      } finally {
        setUploading(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        console.log(formData)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          setFormData({
            name: '',
            mobileNo: '',
            email: '',
            city: '',
            platform: 'Facebook',
            assignedTo: session?.user.id
          });
          fetchLeads();
        }
      } catch (error) {
        console.error('Error creating lead:', error);
      }
    };


    
    const handleResponseSubmit = async (queryId: string, response: string) => {
      setResponse(response);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/queries`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id: queryId, reply: response, resolvedBy: session?.user.id }),
        });
        if (res.ok) {
          // Optionally refresh the queries or update local state
        }
      } catch (error) {
        console.error('Error updating response:', error);
      }
    };
  
  

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)} Dashboard</h1>
      <p className="mb-6">Welcome, {session.user.name}</p>

      {session.user.role === 'admin' && (<><AdminNotificationPanel /></>)}
      
      {session.user.role === 'partner' && (<>
        <Tabs defaultValue="leads" className="w-full">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="kits">Kits</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leads">
            <div className="space-y-6">
              <LeadTable leads={leads} status="new" handleStatusUpdate={handleStatusUpdate} />
              <LeadTable leads={leads} status="contacted" handleStatusUpdate={handleStatusUpdate} />
              <LeadTable leads={leads} status="successful"  />
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
                .filter((lead : any) => lead.status === 'contacted' || lead.status === 'new')
                .map((lead : any) => (
                  <TableRow key={lead._id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.status}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Record Sale</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Record Sale for {lead.name}</DialogTitle>
                          </DialogHeader>
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault()
                              const target = e.target as HTMLFormElement;
                              handleSaleRecord(lead._id, { amount: target.amount.value , address: target.address.value , state: target.state.value , pincode: target.pincode.value });
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
                            <div className="space-y-2">
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                name="address"
                                type="text"
                                required
                                placeholder="Enter address"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                name="state"
                                type="text"
                                required
                                placeholder="Enter state"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pincode">Pincode</Label>
                              <Input
                                id="pincode"
                                name="pincode"
                                type="text"
                                required
                                placeholder="Enter pincode"
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
                <TableHead>Subscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads
                .filter((lead : any) => lead.status === 'successful')
                .map((lead : any) => {
                  const leadSales = sales.filter((sale : any) => sale.leadId === lead._id)
                  return leadSales.map((sale : any, index : any) => (
                    <TableRow key={`${lead._id}-${index}`}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.mobileNo}</TableCell>
                      <TableCell>Rs {sale.amount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">Manage Subscription</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Manage Subscription for {lead.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="first-month" className="text-right">
                                  First Month
                                </Label>
                                <div className="col-span-3">
                                  <Select
                                    onValueChange={setFirstMonthSubscription}
                                    defaultValue={sale.firstMonthSubscription}
                                  >
                                    <SelectTrigger id="first-month">
                                      <SelectValue placeholder="First Month Subscription" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes</SelectItem>
                                      <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              {firstMonthSubscription === 'yes' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="first-month-amount" className="text-right">
                                    Amount
                                  </Label>
                                  <Input
                                    id="first-month-amount"
                                    type="number"
                                    placeholder="Amount for First Month"
                                    className="col-span-3"
                                    onChange={(e) => setAmountChargedFirstMonth(e.target.value)}
                                  />
                                </div>
                              )}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="second-month" className="text-right">
                                  Second Month
                                </Label>
                                <div className="col-span-3">
                                  <div className="col-span-3">
                                    <Select
                                      onValueChange={setRenewalSecondMonth}
                                      defaultValue={sale.renewalSecondMonth}
                                    >
                                      <SelectTrigger id="second-month">
                                        <SelectValue placeholder="Renewal Second Month" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              {renewalSecondMonth === 'yes' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="second-month-amount" className="text-right">
                                    Amount
                                  </Label>
                                  <Input
                                    id="second-month-amount"
                                    type="number"
                                    placeholder="Amount for Second Month"
                                    className="col-span-3"
                                    onChange={(e) => setAmountChargedSecondMonth(e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                            <Button onClick={() => handleUpdateSubscription(lead._id, {
                              firstMonthSubscription,
                              amountChargedFirstMonth,
                              renewalSecondMonth,
                              amountChargedSecondMonth
                            })}>
                              Update Subscription
                            </Button>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Self Lead Generation </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8 space-y-4">
            <Label className="text-lg font-semibold">Upload CSV/Excel File</Label>
            <FileUploadZone onFileSelect={(file) => {
              const formData = new FormData();
              formData.append('file', file);
              handleFileUpload(formData);
            }} uploading={uploading} />
            <Alert className="bg-primary/5 border-primary/20">
              <AlertDescription className="text-sm">
                Upload a CSV or Excel file with columns: name, mobileNo, email, city, platform
              </AlertDescription>
            </Alert>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input
                  placeholder="Enter mobile number"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full h-10">
              Add Lead
            </Button>
          </form>
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
                      onSubmit={(e : any) => {
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
                            kitHistory.map((record : any) => (
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
                          receivedKits.map((kit : any) => (
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
          <TabsContent value="commissions">
            <div className="space-y-6">
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
                      <TableCell>{new Date(sale.date).toLocaleDateString() }</TableCell>
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
          </TabsContent>
          <TabsContent value="queries">
          <QueryTable queries={queries} onQueryUpdate={fetchQueries}
              />
                
          </TabsContent>
        </Tabs>
    </> )} 
    {session?.user.role === 'user' && <UserDashboard />}
    </div>
  );
}