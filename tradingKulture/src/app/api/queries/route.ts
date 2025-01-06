import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Query from '@/lib/models/Query';

export async function GET(req: NextRequest) {
  await connectDB();
  const userId = req.nextUrl.searchParams.get('userId');
  if(!userId){
    const queries = await Query.find().sort({ createdAt: -1 })
    return NextResponse.json(queries);
  }

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const queries = await Query.find({ createdBy: userId }).sort({ createdAt: -1 }).populate('resolvedBy' , 'name');
    return NextResponse.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    return NextResponse.json({ error: 'Failed to fetch queries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { query, createdBy } = await req.json();
    const newQuery = new Query({
      query,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newQuery.save();
    return NextResponse.json(newQuery);
  } catch (error) {
    console.error('Error creating query:', error);
    return NextResponse.json({ error: 'Failed to create query' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await connectDB();

  try {
    const { _id, reply , resolvedBy , status} = await req.json();
    const updatedQuery = await Query.findByIdAndUpdate(_id, { reply, resolvedBy , updatedAt: new Date() , status}, { new: true });
    return NextResponse.json(updatedQuery);
  } catch (error) {
    console.error('Error updating query:', error);
    return NextResponse.json({ error: 'Failed to update query' }, { status: 500 });
  }
}