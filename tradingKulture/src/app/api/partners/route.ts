// app/api/partners/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import { Inventory } from '@/lib/models/Inventory'
import { KitDistribution } from '@/lib/models/KitDistribution'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch all partners (users)
    const partners = await User.find({ role: { $ne: 'admin' } })
      .select('-password -googleId -emailVerified')
      .lean();

    // Fetch inventory data for all partners
    const inventoryData = await Inventory.find({
      partnerId: { $in: partners.map(p => p._id) }
    }).lean();

    // Fetch distribution data for all partners
    const distributionData = await KitDistribution.find({
      partnerId: { $in: partners.map(p => p._id) }
    })
    .sort({ distributionDate: -1 })
    .lean();

    // Create a map for quick lookup
    const inventoryMap = new Map();
    inventoryData.forEach(inv => {
      const currentTotal = inventoryMap.get(inv.partnerId.toString()) || 0;
      inventoryMap.set(inv.partnerId.toString(), currentTotal + inv.quantity + inv.distributed);
    });

    const distributionMap = new Map();
    distributionData.forEach(dist => {
      if (!distributionMap.has(dist.partnerId.toString())) {
        distributionMap.set(dist.partnerId.toString(), dist.distributionDate);
      }
    });

    // Combine the data
    const enrichedPartners = partners.map(partner => {
      const partnerId = partner._id.toString();
      return {
        ...partner,
        totalKits: inventoryMap.get(partnerId) || 0,
        lastDistribution: distributionMap.get(partnerId) || null,
        roleDisplay: partner.role.charAt(0).toUpperCase() + partner.role.slice(1)
      };
    });

    return NextResponse.json(enrichedPartners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update partner
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    await connectDB();
    
    const updatedPartner = await User.findOneAndUpdate(
      { _id: userId, role: { $ne: 'admin' } },
      { $set: data },
      { 
        new: true,
        select: '-password -googleId -emailVerified'
      }
    );

    if (!updatedPartner) {
      return NextResponse.json(
        { message: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPartner);
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
    try {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        )
      }
  
      // Get the user ID from the URL search params
      const { searchParams } = new URL(request.url)
      const userId = searchParams.get('id')
  
      if (!userId) {
        return NextResponse.json(
          { message: 'User ID is required' },
          { status: 400 }
        )
      }
  
      await connectDB()
      
      // Remove the role restriction to allow deleting any non-admin user
      const deletedUser = await User.findOneAndDelete({
        _id: userId,
        role: { $ne: 'admin' } // Prevent deleting admin users
      })
  
      if (!deletedUser) {
        return NextResponse.json(
          { message: 'User not found or cannot be deleted' },
          { status: 404 }
        )
      }
  
      return NextResponse.json(
        { message: 'User deleted successfully' }
      )
    } catch (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      )
    }
  }