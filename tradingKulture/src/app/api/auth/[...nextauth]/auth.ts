import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from "@/lib/mongodb";
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';
import Commission from '../../../../lib/models/Commission';
import bcrypt from 'bcrypt';

export const authConfig: NextAuthOptions = {
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
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('No user found with this email');
        }
        
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          isProfileComplete: Boolean(
            user.city &&
            user.state &&
            user.pincode &&
            user.phoneNumber
          ),
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });
        let isNewUser = false;

        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            googleId: account?.providerAccountId,
            role: 'partner',
          });
          isNewUser = true;
        }

        if (isNewUser && dbUser.role === 'partner') {
          const existingCommission = await Commission.findOne({ partnerId: dbUser._id });
          if (!existingCommission) {
            await Commission.create({
              partnerId: dbUser._id,
              slabs: {
                '0-30': 0,
                '30-70': 0,
                '70-100': 0
              }
            });
          }
        }

        const isProfileComplete = Boolean(
          dbUser.city &&
          dbUser.state &&
          dbUser.pincode &&
          dbUser.phoneNumber
        );
        
        user.role = dbUser.role;
        user.isProfileComplete = isProfileComplete;
        return true;
      } catch (error) {
        console.error('Error during sign-in:', error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
        session.user.isProfileComplete = token.isProfileComplete as boolean;
        return session;
      } catch (error) {
        console.error('Error during session creation:', error);
        return session;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
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


