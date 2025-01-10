import { NextResponse } from 'next/server';

import connectDB from '@/lib/db';
import PartnerNotification from '@/lib/models/PartnerNotification';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    const notifications = await PartnerNotification.find({partnerId: id})
      .sort({ timestamp: -1 })
      
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications: ' + (error as Error).message }, { status: 500 });
  }
}