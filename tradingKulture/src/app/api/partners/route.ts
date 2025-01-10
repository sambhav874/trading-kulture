import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from './../auth/[...nextauth]/auth'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import { Inventory } from '@/lib/models/Inventory'
import { KitDistribution } from '@/lib/models/KitDistribution'
import bcrypt from 'bcrypt'
import { Types } from 'mongoose'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    console.log(id)
    if (id) {
      const partner = await User.findById(id)
        .select('-password -googleId -emailVerified')
      return NextResponse.json(partner)
    }

    const partners = await User.find({ role: { $ne: 'admin' } })
      .select('-password -googleId -emailVerified')
      .lean()

    const inventoryData = await Inventory.find({
      partnerId: { $in: partners.map(p => p._id) }
    }).lean()

    const distributionData = await KitDistribution.find({
      partnerId: { $in: partners.map(p => p._id) }
    })
    .sort({ distributionDate: -1 })
    .lean()

    const inventoryMap = new Map()
    inventoryData.forEach(inv => {
      const currentTotal = inventoryMap.get(inv.partnerId.toString()) || 0
      inventoryMap.set(inv.partnerId.toString(), currentTotal + inv.quantity + inv.distributed)
    })

    const distributionMap = new Map()
    distributionData.forEach(dist => {
      if (!distributionMap.has(dist.partnerId.toString())) {
        distributionMap.set(dist.partnerId.toString(), dist.distributionDate)
      }
    })

    const enrichedPartners = partners.map(partner => {
      const partnerId = (partner._id as Types.ObjectId).toString()
      return {
        ...partner,
        totalKits: inventoryMap.get(partnerId) || 0,
        lastDistribution: distributionMap.get(partnerId) || null,
        roleDisplay: partner.role.charAt(0).toUpperCase() + partner.role.slice(1)
      }
    })

    return NextResponse.json(enrichedPartners)
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    await connectDB()
    
    const updatedPartner = await User.findOneAndUpdate(
      { _id: userId, role: { $ne: 'admin' } },
      { $set: data },
      { 
        new: true,
        select: '-password -googleId -emailVerified'
      }
    )

    if (!updatedPartner) {
      return NextResponse.json(
        { message: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedPartner)
  } catch (error) {
    console.error('Error updating partner:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    await connectDB()
    
    const deletedUser = await User.findOneAndDelete({
      _id: userId,
      role: { $ne: 'admin' }
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await connectDB()

    const newUser = new User({
      email,
      password: hashedPassword,
      role: 'partner',
    })

    await newUser.save()

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}