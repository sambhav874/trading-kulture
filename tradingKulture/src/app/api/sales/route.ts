import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import {Sale} from '@/lib/models/Sale';
import Lead from '@/lib/models/Lead';
import { Inventory } from '@/lib/models/Inventory';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, amount, partnerId } = body;
    console.log('Request body:', body);

    // Validate required fields
    if (!leadId || !amount || !partnerId ) {
      console.log('Missing fields:', { leadId, amount, partnerId });
      return NextResponse.json({ 
        error: 'Missing required fields: leadId, quantity, amount, and partnerId are required' 
      }, { status: 400 });
    }

    // Validate numeric fields
    if ( isNaN(amount) || amount < 0 ) {
      console.log('Invalid numeric values:', { amount,  });
      return NextResponse.json({ 
        error: 'Invalid quantity or amount values' 
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

    // Verify the lead exists and belongs to the partner
    const lead = await Lead.findOne({ _id: leadId, assignedTo : partnerId });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });
    }

    // Create the sale record
    const sale = new Sale({
      leadId,
      amount,
      partnerId,
      date: new Date()
    });

    await sale.save();

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
  } catch (error) {
    console.error('Error in sales POST:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get('id');
    
    if (!saleId) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const {  amount } = body;

    await connectDB();

    // Find and update the sale
    const sale = await Sale.findOneAndUpdate(
      { _id: saleId, partnerId: session.user.id },
      {  amount },
      { new: true }
    ).populate('leadId', 'name email');

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error in sales PUT:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
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