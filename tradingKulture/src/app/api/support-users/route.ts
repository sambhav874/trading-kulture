import connectDB from "@/lib/db";
import  User  from '@/lib/models/User';
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "../auth/[...nextauth]/auth";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    try {
      const session = await getServerSession(authConfig);
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
  
      const { email, password } = await request.json();
  
      
      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { message: 'Email and password are required' },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10)
  
      await connectDB();
  
      // Create a new user
      const newUser = new User({
        email,
        password: hashedPassword, 
        role: 'support', 
      });
  
      await newUser.save();
  
      return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
      console.error('Error creating partner:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }