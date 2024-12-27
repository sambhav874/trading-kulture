import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '../../auth/[...nextauth]/auth';
import connectDB from '@/lib/db';
import Lead from '@/lib/models/Lead';
import { read, utils } from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    console.log('File:', file);
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: 'buffer' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = utils.sheet_to_json(worksheet);
    console.log('Data:', data);

    // Validate data structure
    const requiredFields = ['name', 'mobileNo', 'email', 'city', 'platform'];
    const isValidData = data.every((row : any )=> 
      requiredFields.every(field => field in row)
    );
    console.log('isValidData:', isValidData);

    if (!isValidData) {
      return NextResponse.json({
        error: 'Invalid file format. Required columns: name, mobileNo, email, city, platform'
      }, { status: 400 });
    }

    // Create leads
    const leads = await Lead.insertMany(
      data.map(row => {
        if (typeof row === 'object' && row !== null) {
          return {
            ...row,
            status: 'new',
            date: new Date()
          };
        }
        throw new Error('Invalid row data');
      })
    );

    return NextResponse.json({
      message: 'Leads uploaded successfully',
      count: leads.length
    });

  } catch (error) {
    console.error('Error uploading leads:', error);
    return NextResponse.json({ error: 'Error uploading leads' }, { status: 500 });
  }
}
