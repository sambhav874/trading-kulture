import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import Lead from '@/lib/models/Lead'
import {Sale} from '@/lib/models/Sale'

export async function GET(
  request: Request,
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const params = searchParams.get('partnerId')
    console.log(params)

    await connectDB()

    // Get partner details
    const partner = await User.findById(params)
    if (!partner) {
      return NextResponse.json(
        { message: 'Partner not found' },
        { status: 404 }
      )
    }

    // Get all leads assigned to this partner
    const totalLeadsAssigned = await Lead.countDocuments({ assignedTo: params })

    
    // Get all sales by this partner
    const sales = await Sale.find({ partnerId: params })
    const totalSales = sales.length
    const revenue = sales.reduce((acc, sale) => acc + (sale.amount || 0), 0)

    // Get monthly statistics for the last 6 months
    const monthlyStats = []
    for (let i = 0; i < 6; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthLeadsAssigned = await Lead.countDocuments({
        assignedTo: params,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      })

      
      const monthSales = await Sale.find({
        partnerId: params.id,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      })

      monthlyStats.unshift({
        month: startOfMonth.toLocaleString('default', { month: 'short', year: '2-digit' }),
        leadsAssigned: monthLeadsAssigned,
        sales: monthSales.length,
        revenue: monthSales.reduce((acc, sale) => acc + (sale.amount || 0), 0)
      })
    }

    return NextResponse.json({
      name: partner.name,
      email: partner.email,
      totalLeadsAssigned,
      
      totalSales,
      revenue,
      monthlyStats
    })
  } catch (error) {
    console.error('Error fetching partner stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
