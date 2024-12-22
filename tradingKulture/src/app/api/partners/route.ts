// app/api/partners/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if the user is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    await connectDB();

    let users;
    if (userId) {
      // Fetch a specific user by ID
      const user = await User.findById(userId)
        .select('-password -googleId -emailVerified')
        .lean();

        console.log(user);

      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      users = [user];
    } else {
      // Fetch all users
      users = await User.find({})
        .select('-password -googleId -emailVerified')
        .lean();
    }

    // Add formatted role display
    const usersWithFormattedRole = users.map((user) => ({
      ...user,
      roleDisplay: user.role.charAt(0).toUpperCase() + user.role.slice(1),
    }));

    return NextResponse.json(usersWithFormattedRole);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update partner
export async function PUT(
  request: Request
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    console.log("Data is " + data);

    await connectDB()

    const { searchParams } = new URL(request.url)
      const userId = searchParams.get('id')
    
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