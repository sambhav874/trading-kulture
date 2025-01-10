import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Inventory } from '@/lib/models/Inventory';
import { KitDistribution } from '@/lib/models/KitDistribution';
import { createPartnerNotification } from '@/lib/partnerNotifications';
import { PartnerNotificationType } from '@/lib/models/PartnerNotification';

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { partnerId, kitsSent, amount, date } = await request.json();

    if (!partnerId || !kitsSent || !amount) {
      return NextResponse.json({ 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    const quantity = parseInt(kitsSent);
    const amountPerKit = parseFloat(amount);
    const distributionDate = date ? new Date(date) : new Date();

    // Create distribution record
    const distribution = await KitDistribution.create({
      partnerId,
      quantity,
      amountPerKit,
      totalAmount: quantity * amountPerKit,
      distributionDate,
      notes: `Distribution of ${quantity} kits at ₹${amountPerKit} per kit`
    });

    const distributedPartnerId = await distribution
      .populate('partnerId', 'name email ')

    await createPartnerNotification({
      type: PartnerNotificationType.KITS_DISTRIBUTED,
      message: `${quantity} kits are distributed to '${distributedPartnerId.partnerId.name}' (Kit Distribution ID: ${distributedPartnerId._id})`,
      partnerId,
      kitDistributionId: distribution._id
    });

    // Find existing inventory or create new one
    let inventory = await Inventory.findOne({ partnerId, status: 'available' });

    if (inventory) {
      // Update existing inventory
      inventory.quantity += quantity;
      inventory.unitPrice = amountPerKit; // Update to latest price
      inventory.lastUpdated = distributionDate;
      await inventory.save();
    } else {
      // Create new inventory entry for the partner
      inventory = await Inventory.create({
        partnerId,
        quantity,
        distributed: 0,
        unitPrice: amountPerKit,
        status: 'available',
        lastUpdated: distributionDate
      });
      console.log('New inventory created:', inventory);
    }

    // Fetch the complete distribution record with populated partner
    const populatedDistribution = await KitDistribution.findById(distribution._id)
      .populate('partnerId');

    // Return both distribution and inventory records
    return NextResponse.json({ 
      message: 'Distribution recorded successfully',
      distribution: populatedDistribution,
      inventory
    }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in kit distribution:', error);
      return NextResponse.json({ 
        message: 'Error processing kit distribution',
        error: error.message 
      }, { status: 500 });
    } else {
      console.error('Unexpected error:', error);
      return NextResponse.json({ 
        message: 'Unexpected error processing kit distribution',
        error: 'An unexpected error occurred' 
      }, { status: 500 });
    }
  }
}

// Get distribution history for a partner
export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    
    const query = partnerId ? { partnerId } : {};
    
    const distributions = await KitDistribution.find(query)
      .sort({ distributionDate: -1 })
      .populate('partnerId');

    // Ensure all numeric values are properly set
    const formattedDistributions = distributions.map(dist => {
      const doc = dist.toObject();
      return {
        ...doc,
        quantity: doc.quantity || 0,
        amountPerKit: doc.amountPerKit || 0,
        totalAmount: doc.totalAmount || (doc.quantity * doc.amountPerKit) || 0,
        distributionDate: doc.distributionDate ? new Date(doc.distributionDate).toISOString() : new Date().toISOString()
      };
    });

    return NextResponse.json(formattedDistributions, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching distributions:', error);
      return NextResponse.json({ 
        message: 'Error fetching distribution history' 
      }, { status: 500 });
    } else {
      console.error('Unexpected error:', error);
      return NextResponse.json({ 
        message: 'Unexpected error fetching distribution history',
        error: 'An unexpected error occurred' 
      }, { status: 500 });
    }
  }
}