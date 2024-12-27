import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '../auth/[...nextauth]/auth';
import dbConnect from '@/lib/db';
import { Inventory } from '@/lib/models/Inventory';
import { KitRequest } from '@/lib/models/KitRequest';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    await dbConnect();

    // Get inventory status
    const inventory = await Inventory.findOne({partnerId }) 
    
    // Get partner's kit requests if partnerId is provided
    const requests = partnerId 
      ? await KitRequest.find({ partnerId }).sort({ date: -1 })
      : [];

    return NextResponse.json({
      inventory: {
        available: inventory.quantity ,
        total: inventory.quantity + inventory.distributed,
        distributed: inventory.distributed
      },
      requests
    });
  } catch (error) {
    console.error('Error fetching kit distribution data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kit distribution data' },
      { status: 500 }
    );
  }
}
