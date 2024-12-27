'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Partner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface KitRequest {
  _id: string;
  partnerId: Partner;
  quantity: number;
  status: string;
  date: string;
  __v: number;
}

export default function KitRequestsPage() {
  const [requests, setRequests] = useState<KitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kits-distribution/request`);
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data.requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kits-distribution/request`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      const data = await response.json();
      setRequests(data.requests);
      toast({
        title: "Status Updated",
        description: `Request status has been updated to ${newStatus}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update status',
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="mx-auto my-4">
        <CardHeader>
          <CardTitle>Kit Distribution Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto my-4 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card className="mx-auto my-4">
      <CardHeader>
        <CardTitle>Kit Distribution Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Partner Details</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell className="font-medium">{request._id}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">
                        <div className="font-medium">{request.partnerId.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.partnerId.email}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div>
                          <div>Email: {request.partnerId.email}</div>
                          {request.partnerId.phone && (
                            <div>Phone: {request.partnerId.phone}</div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{request.quantity}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusBadgeVariant(request.status)}
                    className={
                      request.status.toLowerCase() === 'approved' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : request.status.toLowerCase() === 'pending'
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : ''
                    }
                  >
                    {request.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(request.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(request._id, 'approved')}
                        disabled={request.status === 'approved'}
                      >
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(request._id, 'rejected')}
                        disabled={request.status === 'rejected'}
                      >
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(request._id, 'pending')}
                        disabled={request.status === 'pending'}
                      >
                        Mark as Pending
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

