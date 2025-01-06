import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from './../auth/[...nextauth]/auth';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import {Sale} from '@/lib/models/Sale';
import Lead from '@/lib/models/Lead';
import { Inventory } from '@/lib/models/Inventory';
import ManagedCommission from '@/lib/models/ManagedCommission';
import Commission from '@/lib/models/Commission';
import { User as UserType } from '@/types/index';
import { createNotification } from '@/lib/notifications';
import { NotificationType } from '@/lib/models/Notification';

export async function GET(request : Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get partnerId from query parameters
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    await connectDB();

    // Fetch sales with lead information
    const sales = await Sale.find({ partnerId })
      .sort({ date: -1 }); // Sort by date descending

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error in sales GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request : Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, amount, partnerId , address ,
      state ,
      pincode  } = body;
    console.log('Request body:', body);

    // Validate required fields
    if (!leadId || !amount || !partnerId) {
      console.log('Missing fields:', { leadId, amount, partnerId });
      return NextResponse.json({ 
        error: 'Missing required fields: leadId, amount, partnerId are required' 
      }, { status: 400 });
    }

    // Validate numeric fields
    if (isNaN(amount) || amount < 0 ) {
      console.log('Invalid numeric values:', { amount});
      return NextResponse.json({ 
        error: 'Invalid amount ' 
      }, { status: 400 });
    }

    await connectDB();

    // First check available inventory
    console.log('Searching inventory with partnerId:', partnerId);
    const inventory = await Inventory.findOne({ 
      partnerId: new mongoose.Types.ObjectId(partnerId), 
      status: 'available' 
    });
    console.log('Found inventory:', inventory);
    console.log('Inventory query:', { partnerId, status: 'available' });
    
    if (!inventory) {
      return NextResponse.json({ error: 'No available inventory found for this partner' }, { status: 404 });
    }
    if (inventory.quantity < 1) {
      return NextResponse.json({ error: 'Insufficient inventory for this sale' }, { status: 400 });
    }

    
    const lead = await Lead.findOneAndUpdate({ _id: leadId, assignedTo : partnerId } , { address , state , pincode } , { new: true });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });
    }
    
    // Create the sale record
    const sale = new Sale({
      leadId,
      amount,
      partnerId,
      firstMonthSubscription : 'no',
      renewalSecondMonth : 'no',
      date: new Date()
    });

    await sale.save();
    await sale.populate('leadId', 'name'); // Populate leadId to get the name

    await createNotification({
      message: `Sale done to ${sale.leadId.name} with amount ${sale.amount} has been updated (Sale ID: ${sale._id})`,
      partnerId: partnerId,
      type: NotificationType.SALE_RECORDED,
      saleId: sale._id  
    })

    // Update lead status to successful if not already
    if (lead.status !== 'successful') {
      lead.status = 'successful';
      await lead.save();
    }
    
    // Update inventory with actual sale quantity
    const updatedInventory = await Inventory.findOneAndUpdate(
      { partnerId: new mongoose.Types.ObjectId(partnerId), status: 'available' },
      { $inc: { 
          quantity: -1,
          distributed: 1 
        } 
      },
      { new: true }
    );

    // Populate lead info before sending response
    await sale.populate('leadId', 'name email');

    return NextResponse.json(sale);
  } catch (error : any) {
    console.error('Error in sales POST:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get('id');

    if (!saleId) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }

    await connectDB();

    // Find and delete the sale
    const sale = await Sale.findOneAndDelete({
      _id: saleId,
      partnerId: session.user.id
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error in sales DELETE:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
async function updateCommission(sale: any, partnerId: string) {
  const commissionSlab = await Commission.findOne({ partnerId });

  if (!commissionSlab) {
    throw new Error('Commission slab not alloted. Please contact admin');
  }

  let managedCommission = await ManagedCommission.findOneAndUpdate(
    { partnerId },
    {
      $setOnInsert: {
        partnerId,
        currentSlab: '0-30',
        salesData: [],
        totalCommission: 0
      }
    },
    { 
      new: true, 
      upsert: true 
    }
  );

  const eligibleSales = managedCommission.salesData.filter((s : any) => 
    (s.firstMonthSubscription === 'yes')
  ).length + (sale.firstMonthSubscription === 'yes' ? 1 : 0);

  // Update current slab
  if (eligibleSales <= 30) {
    managedCommission.currentSlab = '0-30';
  } else if (eligibleSales <= 70) {
    managedCommission.currentSlab = '30-70';
  } else {
    managedCommission.currentSlab = '70-100';
  }

  // Calculate commission for the current sale
  const commissionRate = commissionSlab.slabs[managedCommission.currentSlab] / 100;
  let saleCommission = 0;

  if (sale.firstMonthSubscription === 'yes') {
    saleCommission += sale.amountChargedFirstMonth * commissionRate;
  }
  if (sale.firstMonthSubscription === 'yes' && sale.renewalSecondMonth === 'yes') {
    saleCommission += sale.amountChargedSecondMonth * commissionRate * 0.75; // 25% depreciation for second month renewals
  }

  // Add the new sale data
  managedCommission.salesData.push({
    saleId: sale._id,
    firstMonthSubscription: sale.firstMonthSubscription,
    amountChargedFirstMonth: sale.amountChargedFirstMonth,
    renewalSecondMonth: sale.renewalSecondMonth,
    amountChargedSecondMonth: sale.amountChargedSecondMonth,
    commission: saleCommission,
  });

  // Update total commission
  managedCommission.totalCommission += saleCommission;

  await managedCommission.save();

  return managedCommission;
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get('id');
    
    if (!saleId) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { firstMonthSubscription, amountChargedFirstMonth, renewalSecondMonth, amountChargedSecondMonth } = body;

    // Validate required fields
    if (!saleId || firstMonthSubscription === undefined || renewalSecondMonth === undefined) {
      return NextResponse.json({ error: 'Missing required fields: saleId, firstMonthSubscription, and renewalSecondMonth are required' }, { status: 400 });
    }

    await connectDB();

    // Find and update the sale
    const sale = await Sale.findOneAndUpdate(
      { leadId: saleId, partnerId: session.user.id },
      {  
        firstMonthSubscription,
        amountChargedFirstMonth: amountChargedFirstMonth ? parseFloat(amountChargedFirstMonth) : null,
        renewalSecondMonth,
        amountChargedSecondMonth: amountChargedSecondMonth ? parseFloat(amountChargedSecondMonth) : null
      },
      { new: true }
    ).populate('leadId', 'name email');

    

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found or unauthorized' }, { status: 404 });
    }

    // Update commission
    try {
      const updatedCommission = await updateCommission(sale, session.user.id);
      return NextResponse.json({ sale, commission: updatedCommission });
    } catch (commissionError : any) {
      console.error('Error updating commission:', commissionError);
      return NextResponse.json({ error: 'Error updating commission', details: commissionError.message }, { status: 500 });
    }
  } catch (error : any) {
    console.error('Error in sales PUT:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
