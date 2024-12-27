'use client'

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PartnerSalesPage = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({
    sales: 0,
    firstMonth: 0,
    secondMonth: 0
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/commissions/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);

      // Calculate totals
      const newTotals = data.reduce((acc  : any, curr : any) => ({
        sales: acc.sales + curr.totalSales,
        firstMonth: acc.firstMonth + curr.firstMonthSales,
        secondMonth: acc.secondMonth + curr.secondMonthRenewals
      }), { sales: 0, firstMonth: 0, secondMonth: 0 });
      
      setTotals(newTotals);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch partner statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const router = useRouter();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Partner Sales Dashboard</h1>
        <Button 
          onClick={fetchStats} 
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>Across all partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.sales}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>First Month Subscriptions</CardTitle>
            <CardDescription>Total first month sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.firstMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Second Month Renewals</CardTitle>
            <CardDescription>Total renewals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.secondMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partner Details</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Total Sales</TableHead>
            <TableHead className="text-right">First Month</TableHead>
            <TableHead className="text-right">Renewals</TableHead>
            <TableHead>Current Slab</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((partner  : any) => (
            <TableRow key={partner.partnerId}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{partner.partnerName}</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-1 h-4 w-4" />
                    {partner.email}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-1 h-4 w-4" />
                    {partner.phoneNumber}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {partner.city}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {partner.totalSales}
              </TableCell>
              <TableCell className="text-right">
                {partner.firstMonthSales}
              </TableCell>
              <TableCell className="text-right">
                {partner.secondMonthRenewals}
              </TableCell>
              <TableCell>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {partner.currentSlab}
                </div>
              </TableCell>
              <TableCell>
                <Button 
                  onClick={() => router.push(`${process.env.NEXT_PUBLIC_API_URL}/admin/commission-calculator/${partner.partnerId}`)}
                >
                  View Calculator
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PartnerSalesPage;