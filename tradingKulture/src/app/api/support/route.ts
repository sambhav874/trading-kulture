import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from './../auth/[...nextauth]/auth';
import connectDB from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { subject, message } = await request.json();
    const partnerId = session.user.id; // Assuming the user ID is stored in the session

    await connectDB();

    // Create a new support ticket
    const newTicket = new SupportTicket({
      partnerId,
      subject,
      message,
    });

    await newTicket.save();

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.SUPPORT_MAIL, 
      subject: `New Support Ticket: ${subject}`,
      text: `You have received a new support ticket from ${session.user.email}:\n\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    if(session.user.role === 'admin'){
      const tickets = await SupportTicket.find().sort({ createdAt: -1 }).populate('partnerId', 'name email');
      return NextResponse.json(tickets);
    }
    const partnerId = session.user.id;
    const tickets = await SupportTicket.find({ partnerId }).sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const ticketId = searchParams.get('id');
  
      const { reply } = await request.json();
  
      if (!ticketId) {
        return NextResponse.json({ message: 'Ticket ID is required' }, { status: 400 });
      }
  
      const session = await getServerSession(authConfig);
      if (!session || session.user.role !== 'admin') { 
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      await connectDB();
  
      const ticket = await SupportTicket.findById(ticketId).populate('partnerId', 'email');
  
      if (!ticket) {
        return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
      }
  
      if (ticket.status === 'closed') {
        return NextResponse.json({ message: 'Ticket is already closed' }, { status: 400 });
      }
  
      // Update the ticket with the reply and change the status to closed
      ticket.reply = reply; 
      ticket.status = 'closed'; 
      await ticket.save();
  
      const transporter = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ticket.partnerId.email, // Partner's email
        subject: `Your Support Ticket #${ticketId} Has Been Closed`,
        text: `Dear Partner,\n\nYour support ticket with the subject "${ticket.subject}" has been closed.\n\nReply: ${reply}\n\nThank you for reaching out to us!\n\nBest Regards,\nSupport Team`,
      };
  
      await transporter.sendMail(mailOptions);
  
      return NextResponse.json({ message: 'Ticket closed successfully, and email sent.', ticket }, { status: 200 });
    } catch (error) {
      console.error('Error closing support ticket:', error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }