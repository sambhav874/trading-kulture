import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '../auth/[...nextauth]/auth';
import connectDB from '@/lib/db';
import Commission from '@/lib/models/Commission';

export async function GET(request : Request) {
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    await connectDB();
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if(id){ 
      const commission = await Commission.findOne({ partnerId: id }).populate('partnerId', 'name');
      return NextResponse.json(commission);
    }
    else{
      const commissions = await Commission.find().populate('partnerId', 'name');
      return NextResponse.json(commissions);
    }
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



