'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black shadow-sm sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={`${process.env.NEXT_PUBLIC_API_URL}/`} className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-white">Trading<span className="text-[#39FF14]">Kulture</span></span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {session ? (
              <>
                {session.user.role === 'admin' && (
                  <Link href={`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`} passHref>
                    <Button variant="ghost" className="text-white hover:bg-gray-900 hover:text-[#39FF14]">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                {session.user.role === 'partner' && (
                  <Link href={`${process.env.NEXT_PUBLIC_API_URL}/dashboard`} passHref>
                    <Button variant="ghost" className="text-white hover:bg-gray-900 hover:text-[#39FF14]">
                      Partner Dashboard
                    </Button>
                  </Link>
                )}
                <Link href={`${process.env.NEXT_PUBLIC_API_URL}/profile`} passHref>
                  <Button variant="ghost" className="text-white hover:bg-gray-900 hover:text-[#39FF14]">
                    Profile
                  </Button>
                </Link>
                {session.user.role === 'partner' && (
                  <Link href={`${process.env.NEXT_PUBLIC_API_URL}/support`} passHref>
                    <Button variant="ghost" className="text-white hover:bg-gray-900 hover:text-[#39FF14]">
                      Support
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-gray-900 text-[#39FF14]">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                        <AvatarFallback>{session.user.name?.[0] || session.user.email?.[0]}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900 border border-gray-800">
                    <DropdownMenuLabel className="text-white">{session.user.name || session.user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      className="text-white hover:bg-gray-800 hover:text-[#39FF14] focus:bg-gray-800 focus:text-[#39FF14]"
                      onSelect={() => signOut()}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href={`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`} passHref>
                <Button variant="default" className="bg-[#39FF14] text-black hover:bg-black hover:text-[#39FF14]">
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="text-white hover:bg-gray-900 hover:text-[#39FF14]"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden bg-gray-900 border-t border-gray-800`}>
        <div className="pt-2 pb-3 space-y-1">
          {session ? (
            <>
              {session.user.role === 'admin' && (
                <Link href={`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`} passHref>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800 hover:text-[#39FF14]">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              {session.user.role === 'partner' && (
                <Link href={`${process.env.NEXT_PUBLIC_API_URL}/dashboard`} passHref>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800 hover:text-[#39FF14]">
                    Partner Dashboard
                  </Button>
                </Link>
              )}
              <Link href={`${process.env.NEXT_PUBLIC_API_URL}/profile`} passHref>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800 hover:text-[#39FF14]">
                  Profile
                </Button>
              </Link>
              {session.user.role === 'partner' && (
                <Link href={`${process.env.NEXT_PUBLIC_API_URL}/support`} passHref>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800 hover:text-[#39FF14]">
                    Support
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800 hover:text-[#39FF14]"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Link href={`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`} passHref>
              <Button variant="default" className="w-full bg-[#39FF14] text-black hover:bg-black hover:text-[#39FF14]">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}