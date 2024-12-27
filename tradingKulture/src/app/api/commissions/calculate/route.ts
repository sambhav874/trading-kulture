import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '../../auth/[...nextauth]/auth';
import connectDB from '@/lib/db';
import Commission from '@/lib/models/Commission';

import {Sale} from '@/lib/models/Sale';
import User from '@/lib/models/User';

export async function GET(request : Request) {
    try {
      const session = await getServerSession(authConfig);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { searchParams } = new URL(request.url);
      const partnerId = searchParams.get('partnerId');
  
      await connectDB();
      
      const partner = await User.findById(partnerId);
      if (!partner) {
        return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
      }
  
      const commission = await Commission.findOne({ partnerId });
      if (!commission) {
        return NextResponse.json({ error: 'Commission data not found' }, { status: 404 });
      }
  
      const sales = await Sale.find({ partnerId }).sort({ date: 1 });
  
      const totalSales = sales.length;
      const firstMonthSales = sales.filter(sale => sale.firstMonthSubscription === 'yes').length;
      let currentSlab = '';
      for (const [key, value] of Object.entries(commission.slabs)) {
        const [min, max] = key.split('-').map(Number);
        if (firstMonthSales >= min && firstMonthSales <= max) {
          currentSlab = key;
          break;
        }
      }
  
      // Prepare slab data
      const slabData = Object.entries(commission.slabs).map(([key, rate]) => {
        const [min, max] = key.split('-').map(Number);
        const salesInSlab = sales.filter(sale => 
          sale.firstMonthSubscription === 'yes' && 
          sales.filter(s => s.firstMonthSubscription === 'yes').length >= min &&
          sales.filter(s => s.firstMonthSubscription === 'yes').length <= max
        );
        return {
          range: key,
          min,
          max,
          rate,
          salesCount: salesInSlab.length,
          totalAmount: salesInSlab.reduce((sum, sale) => sum + sale.amount, 0),
        };
      });
  
      return NextResponse.json({
        partnerId: partner._id,
        partnerName: partner.name,
        slabs: slabData,
        totalSales,
        firstMonthSales,
        currentSlab,
        sales: sales.map(sale => ({
          id: sale._id,
          date: sale.createdAt,
          amount: sale.amount,
          amountChargedFirstMonth: sale.amountChargedFirstMonth,
          amountChargedSecondMonth: sale.amountChargedSecondMonth,
          isFirstMonth: sale.firstMonthSubscription === 'yes',
          isSecondMonth: sale.renewalSecondMonth === 'yes'
        }))
      });
    } catch (error) {
      console.error('Error in commissions GET:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  


export async function PUT(request : Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { slabs } = await request.json();

    await connectDB();

    // Validate required fields
    if (!id || !slabs) {
      return NextResponse.json(
        { error: 'Missing required fields: id and slabs are required' },
        { status: 400 }
      );
    }

    // Try to find existing commission
    let commission = await Commission.findOne({ partnerId: id });

    if (commission) {
      // Update existing commission
      commission = await Commission.findByIdAndUpdate(
        commission._id,
        { slabs },
        { new: true }
      ).populate('partnerId', 'name');
    } else {
      // Create new commission if doesn't exist
      commission = await Commission.create({
        partnerId: id,
        slabs,
      });
      commission = await commission.populate('partnerId', 'name');
    }

    return NextResponse.json(commission);
  } catch (error) {
    console.error('Error in commissions PUT:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}