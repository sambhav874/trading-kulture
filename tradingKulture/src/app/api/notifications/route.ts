// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import Notification from '@/lib/models/Notification';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const notifications = await Notification.find()
      .sort({ timestamp: -1 }) // Sort by most recent first
      .populate('partnerId', 'name email') // Populate partner details
      .populate('leadId', 'name email') // Populate lead details (if applicable)
      .populate('saleId', 'amount date') // Populate sale details (if applicable)
      .populate('kitRequestId', 'quantity status'); // Populate kit request details (if applicable)
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications : ' + (error as Error).message }, { status: 500 });
  }
}