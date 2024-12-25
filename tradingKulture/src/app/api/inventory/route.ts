import { Inventory } from '@/lib/models/Inventory';
import dbConnect from '../../../lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const query = partnerId ? { partnerId } : {};
    
    const inventory = await Inventory.find(query)
      .sort({ lastUpdated: -1 })
      .populate('partnerId', 'name email')
      .lean();

    // Format the response data
    const formattedInventory = inventory.map(item => ({
      ...item,
      quantity: item.quantity || 0,
      distributed: item.distributed || 0,
      unitPrice: item.unitPrice || 0,
      partnerName: item.partnerId?.name || 'Unknown Partner',
      partnerEmail: item.partnerId?.email || ''
    }));

    return NextResponse.json(formattedInventory, { status: 200 });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ 
      message: 'Error fetching inventory',
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { quantity, unitPrice, partnerId } = await request.json();
    
    // Validate required fields
    if (!quantity || !unitPrice || !partnerId) {
      return NextResponse.json({
        message: 'Missing required fields: quantity, unitPrice, and partnerId are required'
      }, { status: 400 });
    }
    
    // Validate numeric values
    if (quantity < 0 || unitPrice < 0) {
      return NextResponse.json({
        message: 'Quantity and unit price must be non-negative'
      }, { status: 400 });
    }

    // Check if inventory exists for this partner
    let inventory = await Inventory.findOne({ partnerId, status: 'available' });

    if (inventory) {
      // Update existing inventory
      inventory.quantity += parseInt(quantity);
      inventory.unitPrice = parseFloat(unitPrice);
      inventory.lastUpdated = new Date();
      await inventory.save();
    } else {
      // Create new inventory
      inventory = await Inventory.create({
        partnerId,
        quantity: parseInt(quantity),
        unitPrice: parseFloat(unitPrice),
        distributed: 0,
        status: 'available',
        lastUpdated: new Date()
      });
    }

    // Fetch the complete inventory with populated partner
    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('partnerId', 'name email')
      .lean();

    return NextResponse.json(populatedInventory, { status: 201 });
  } catch (error) {
    console.error('Error adding inventory:', error);
    return NextResponse.json({
      message: 'Error adding inventory',
      error: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const updates = await request.json();
    
    if (!id) {
      return NextResponse.json({ message: 'Inventory ID is required' }, { status: 400 });
    }
    
    // Add validation for negative quantity
    if (updates.quantity !== undefined && updates.quantity < 0) {
      return NextResponse.json({ message: 'Quantity cannot be negative' }, { status: 400 });
    }

    const updatedInventory = await Inventory.findByIdAndUpdate(
      id,
      { ...updates, lastUpdated: new Date() },
      { new: true, runValidators: true }
    )
    .populate('partnerId', 'name email')
    .lean();

    if (!updatedInventory) {
      return NextResponse.json({ message: 'Inventory not found' }, { status: 404 });
    }

    return NextResponse.json(updatedInventory, { status: 200 });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ 
      message: 'Error updating inventory',
      error: error.message 
    }, { status: 500 });
  }
}