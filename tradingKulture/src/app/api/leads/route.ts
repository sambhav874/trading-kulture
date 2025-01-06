// pages/api/leads/index.js
import dbConnect from '../../../lib/db'
import Lead from '../../../lib/models/Lead'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  await dbConnect()

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    let leads;
    if(id){
        leads = await Lead.find({assignedTo : id});
    }
    else{
        leads = await Lead.find({}).populate('assignedTo', 'name phoneNumber')
    }
    return NextResponse.json(leads, { status: 200 })
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  await dbConnect()

  try {
    const lead = await Lead.create(await request.json())
    return NextResponse.json(lead, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect()

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  try {
    const lead = await Lead.findByIdAndUpdate(id, await request.json(), {
      new: true,
      runValidators: true,
    })
    
    if (!lead) {
      return NextResponse.json({ success: false }, { status: 404 })
    }
    return NextResponse.json(lead, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 })
  }
}