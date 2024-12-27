// app/api/partner-stats/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '../../auth/[...nextauth]/auth';
import connectDB from '@/lib/db';
import {Sale} from '@/lib/models/Sale';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all partners
    const partners = await User.find({ role: 'partner' });

    // Calculate statistics for each partner
    const stats = await Promise.all(
      partners.map(async (partner) => {
        // Total sales count
        const totalSales = await Sale.countDocuments({
          partnerId: partner._id,
        });

        // First month subscription count
        const firstMonthSales = await Sale.countDocuments({
          partnerId: partner._id,
          firstMonthSubscription: 'yes'
        });

        // Second month renewal count
        const secondMonthRenewals = await Sale.countDocuments({
          partnerId: partner._id,
          renewalSecondMonth: 'yes'
        });

        // Get commission slab for current sales count
        let commissionSlab = '0-30';
        if (totalSales > 70) {
          commissionSlab = '70-100';
        } else if (totalSales > 30) {
          commissionSlab = '30-70';
        }

        return {
          partnerId: partner._id,
          partnerName: partner.name,
          email: partner.email,
          phoneNumber: partner.phoneNumber || 'N/A',
          city: partner.city || 'N/A',
          totalSales,
          firstMonthSales,
          secondMonthRenewals,
          currentSlab: commissionSlab
        };
      })
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}