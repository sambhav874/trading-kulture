import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from "@/lib/mongodb";
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';
import bcrypt from 'bcrypt';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
      allowDangerousEmailAccountLinking: true, 
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await connectDB();
        
        // Find user by email
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error('No user found with this email');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          //image: user.image,
          role: user.role,
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });
        
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            //image: user.image,
            googleId: account?.providerAccountId,
            role: 'partner',
          });
        }
        
        // Check if profile is complete
        const isProfileComplete = Boolean(
          dbUser.city && 
          dbUser.state && 
          dbUser.pincode && 
          dbUser.phoneNumber
        );
        
        // Add profile status to user object
        user.isProfileComplete = isProfileComplete;
        
        return true;
      } catch (error) {
        console.error('Error during sign-in:', error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.id = dbUser._id.toString();
          // Add profile completion status to session
          session.user.isProfileComplete = Boolean(
            dbUser.city && 
            dbUser.state && 
            dbUser.pincode && 
            dbUser.phoneNumber
          );
        }
        return session;
      } catch (error) {
        console.error('Error during session creation:', error);
        return session;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.isProfileComplete = user.isProfileComplete;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};