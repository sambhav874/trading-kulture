import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '../../auth/[...nextauth]/auth';
import dbConnect from '@/lib/db';
import { KitRequest } from '@/lib/models/KitRequest';
import { Inventory } from '@/lib/models/Inventory';
import  User  from '@/lib/models/User'; // Import Partner model
import { NotificationType } from '@/lib/models/Notification';
import { createNotification } from '@/lib/notifications';

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
    const inventory = await Inventory.findOne();
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

    // Populate partnerId to get the name
    const populatedKitRequest = await KitRequest.populate(kitRequest, { path: 'partnerId', select: 'name' });

    await createNotification({
      type: NotificationType.KIT_REQUEST, 
      message: `Partner ${populatedKitRequest.partnerId.name} had created a kit request with ID ${populatedKitRequest._id}`,
      partnerId,
      kitRequestId: populatedKitRequest._id, 
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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    // Get kit requests based on partnerId
    const requests = await KitRequest.find(partnerId ? { partnerId } : {})
      .populate('partnerId', 'name email ') // Populate partner details
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      requests: requests || []
    });
  } catch (error) {
    console.error('Error fetching kit distribution data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kit distribution data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { requestId, status } = await request.json();

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Find and update the request
    const updatedRequest = await KitRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true } // Return the updated document
    ).populate('partnerId', 'name email '); // Populate partner details

    if (!updatedRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Fetch all requests to return updated list
    const requests = await KitRequest.find()
      .populate('partnerId', 'name email ') // Populate partner details
      .sort({ date: -1 });
    return NextResponse.json({ requests });

  } catch (error) {
    console.error("Error updating kit request:", error);
    return NextResponse.json(
      { error: "Failed to update kit request" },
      { status: 500 }
    );
  }
}
