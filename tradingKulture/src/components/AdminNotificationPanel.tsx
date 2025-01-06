// components/AdminNotificationPanel.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

interface Notification {
  _id: string;
  type: string;
  message: string;
  partnerId: { name: string; email: string };
  leadId?: { name: string; email: string };
  saleId?: { amount: number; date: Date };
  kitRequestId?: { quantity: number; status: string };
  timestamp: Date;
}

export default function AdminNotificationPanel() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`);
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="mt-6  ">
      <div className='flex justify-between'>
        <h2 className="text-3xl font-bold mb-2">Notifications</h2>
  <Button>
    <Link href={`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`} className="m-2 p-2">Visit Dashboard</Link>
  </Button>
      </div>
  

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {notifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No notifications found.
                    </TableCell>
                  </TableRow>
                )}
              { notifications.length > 0 && notifications.map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell>
                    <Badge variant="outline">{notification.type}</Badge>
                  </TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>
                    {notification.partnerId.name} ({notification.partnerId.email})
                  </TableCell>
                  <TableCell>
                    {new Date(notification.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}