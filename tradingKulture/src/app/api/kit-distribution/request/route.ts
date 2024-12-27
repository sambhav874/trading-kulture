import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '../../auth/[...nextauth]/auth';
import dbConnect from '@/lib/db';
import { KitRequest } from '@/lib/models/KitRequest';
import { Inventory } from '@/lib/models/Inventory';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get all requests for the partner
    const requests = await KitRequest.find({ partnerId })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(requests || []);
  } catch (error) {
    console.error('Error fetching kit requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kit requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { partnerId, quantity } = await request.json();
    
    if (!partnerId || !quantity) {
      return NextResponse.json(
        { error: 'Partner ID and quantity are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check available inventory
    const inventory = await Inventory.findOne({partnerId});
    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory not initialized' },
        { status: 400 }
      );
    }

    const availableKits = inventory.quantity 
    if (availableKits < quantity) {
      return NextResponse.json(
        { error: 'Not enough kits available' },
        { status: 400 }
      );
    }

    // Create kit request
    const kitRequest = await KitRequest.create({
      partnerId,
      quantity,
      status: 'pending',
      date: new Date()
    });

    return NextResponse.json({
      request: kitRequest,
      inventory: {
        available: availableKits,
        total: inventory.quantity + inventory.distributed,
        distributed: inventory.distributed
      }
    });
  } catch (error) {
    console.error('Error in kit request:', error);
    return NextResponse.json(
      { error: 'Failed to create kit request' },
      { status: 500 }
    );
  }
}
