'use client'

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface Partner {
  _id: string;
  name: string;
}

interface Slabs {
  '0-30': number;
  '30-70': number;
  '70-100': number;
}

interface Commission {
  _id: string;
  partnerId: Partner;
  slabs: Slabs;
  status?: string;
}

const CommissionPage = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/commissions');
      if (!response.ok) {
        throw new Error('Failed to fetch commissions');
      }
      const data = await response.json();
      
      // Ensure slabs are properly initialized for each commission
      const processedCommissions = data.map((commission: Commission) => ({
        ...commission,
        slabs: {
          '0-30': Number(commission.slabs?.['0-30']) || 0,
          '30-70': Number(commission.slabs?.['30-70']) || 0,
          '70-100': Number(commission.slabs?.['70-100']) || 0
        }
      }));
      
      setCommissions(processedCommissions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch commissions: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlab = async (partnerId: string, slabKey: keyof Slabs, newValue: string) => {
    setUpdating(partnerId);
    const commission = commissions.find(c => c.partnerId._id === partnerId);
    
    // Convert empty string to 0 and ensure value is a number
    const parsedValue = newValue === '' ? 0 : Number(newValue);
    
    const updatedSlabs = {
      ...(commission?.slabs || {}),
      [slabKey]: parsedValue
    };

    try {
      const response = await fetch(`/api/commissions?id=${partnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slabs: updatedSlabs }),
      });

      if (!response.ok) {
        throw new Error('Failed to update commission slab');
      }

      const updatedCommission = await response.json();

      // Update local state
      setCommissions(commissions.map(c => 
        c.partnerId._id === partnerId 
          ? {
              ...c,
              slabs: {
                '0-30': Number(updatedCommission.slabs?.['0-30']) || 0,
                '30-70': Number(updatedCommission.slabs?.['30-70']) || 0,
                '70-100': Number(updatedCommission.slabs?.['70-100']) || 0
              }
            }
          : c
      ));

      toast({
        title: "Success",
        description: "Commission slab updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update commission slab: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Commission Management</h1>
        <Button 
          onClick={fetchCommissions} 
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>0-30 Sales (%)</TableHead>
            <TableHead>30-70 Sales (%)</TableHead>
            <TableHead>70-100 Sales (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commissions.map(commission => (
            <TableRow key={commission._id}>
              <TableCell className="font-medium">{commission.partnerId.name}</TableCell>
              {(['0-30', '30-70', '70-100'] as const).map((slabKey) => (
                <TableCell key={slabKey}>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      disabled={updating === commission.partnerId._id}
                      value={commission.slabs[slabKey]}
                      onChange={(e) => handleUpdateSlab(commission.partnerId._id, slabKey, e.target.value)}
                      className="w-24"
                    />
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CommissionPage;

