import { NextResponse } from 'next/server';
import Notification from '@/lib/models/Notification';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    const notifications = await Notification.find()
      .sort({ timestamp: -1 })
      
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications: ' + (error as Error).message }, { status: 500 });
  }
}