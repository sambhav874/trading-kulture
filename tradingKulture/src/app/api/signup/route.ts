import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request: Request) {
  try {
    const { name, email, phone, role, password } = await request.json()
    console.log(name , email , phone , role , password)

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      role,
      password: hashedPassword,
    })

    await newUser.save()

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error in signup:', error)
    return NextResponse.json({ message: 'An error occurred during signup' }, { status: 500 })
  }
}

