import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'

// Helper function to check if all required fields are filled
function isProfileComplete(data: any): boolean {
  const requiredFields = ['name', 'phoneNumber', 'city', 'state', 'pincode']
  return requiredFields.every(field => 
    data[field] && 
    typeof data[field] === 'string' && 
    data[field].trim() !== ''
  )
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      isProfileComplete: user.isProfileComplete || false,
      googleId: user.googleId || null
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Check if the profile is complete
    const profileComplete = isProfileComplete(data)

    await connectDB()
    
    // First find the user to check if they're a Google user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Only allow email update if not a Google user
    const updateData = {
      name: data.name,
      phoneNumber: data.phoneNumber,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isProfileComplete: profileComplete
    }

    // Add email to update only if user is not a Google user
    if (!user.googleId && data.email) {
      updateData.email = data.email
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        city: updatedUser.city,
        state: updatedUser.state,
        pincode: updatedUser.pincode,
        isProfileComplete: updatedUser.isProfileComplete,
        googleId: updatedUser.googleId || null
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}