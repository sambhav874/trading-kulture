import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import Lead from '@/lib/models/Lead'
import { Sale } from '@/lib/models/Sale'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')

    if (!partnerId) {
      return NextResponse.json(
        { message: 'Partner ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get partner details
    const partner = await User.findById(partnerId)
    if (!partner) {
      return NextResponse.json(
        { message: 'Partner not found' },
        { status: 404 }
      )
    }

    // Get all leads assigned to this partner
    const totalLeadsAssigned = await Lead.countDocuments({ assignedTo: partnerId })

    // Get all sales by this partner
    const sales = await Sale.find({ partnerId: partnerId })
    const totalSales = sales.length
    const revenue = sales.reduce((acc, sale) => acc + (sale.amount || 0), 0)

    // Get yearly statistics
    const yearlyStats = []
    for (let i = 0; i < 3; i++) {  // Last 3 years
      const date = new Date()
      date.setFullYear(date.getFullYear() - i)
      
      // Set to start and end of year in local timezone
      const startOfYear = new Date(date.getFullYear(), 0, 1)
      startOfYear.setHours(0, 0, 0, 0)
      const endOfYear = new Date(date.getFullYear(), 11, 31)
      endOfYear.setHours(23, 59, 59, 999)

      // Convert to UTC for MongoDB query
      const startOfYearUTC = new Date(startOfYear.getTime() - (startOfYear.getTimezoneOffset() * 60000))
      const endOfYearUTC = new Date(endOfYear.getTime() - (endOfYear.getTimezoneOffset() * 60000))

      const yearLeadsAssigned = await Lead.countDocuments({
        assignedTo: partnerId,
        createdAt: { $gte: startOfYearUTC, $lte: endOfYearUTC }
      })

      const yearSales = await Sale.find({
        partnerId: partnerId,
        createdAt: { $gte: startOfYearUTC, $lte: endOfYearUTC }
      })

      yearlyStats.unshift({
        year: date.getFullYear().toString(),
        leadsAssigned: yearLeadsAssigned,
        sales: yearSales.length,
        revenue: yearSales.reduce((acc, sale) => acc + (sale.amount || 0), 0)
      })
    }

    // Get monthly statistics for the last 6 months
    const monthlyStats = []
    for (let i = 0; i < 6; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      // Set to start of month in local timezone
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      startOfMonth.setHours(0, 0, 0, 0)
      // Set to end of month in local timezone
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      endOfMonth.setHours(23, 59, 59, 999)

      // Convert to UTC for MongoDB query
      const startOfMonthUTC = new Date(startOfMonth.getTime() - (startOfMonth.getTimezoneOffset() * 60000))
      const endOfMonthUTC = new Date(endOfMonth.getTime() - (endOfMonth.getTimezoneOffset() * 60000))

      const monthLeadsAssigned = await Lead.countDocuments({
        assignedTo: partnerId,
        createdAt: { $gte: startOfMonthUTC, $lte: endOfMonthUTC }
      })

      const monthSales = await Sale.find({
        partnerId: partnerId,
        createdAt: { $gte: startOfMonthUTC, $lte: endOfMonthUTC }
      })
      console.log('Date range:', { start: startOfMonthUTC, end: endOfMonthUTC })
      console.log('Sales for month:', monthSales)

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
      monthlyStats,
      yearlyStats
    })
  } catch (error) {
    console.error('Error fetching partner stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
