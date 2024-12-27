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
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-gray-700">Trading<span className="text-green-500">Kulture</span></span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {session ? (
              <>
                {session.user.role === 'admin' && (
                  <Link href="/admin/dashboard" passHref>
                    <Button variant="ghost">Admin Dashboard</Button>
                  </Link>
                )}
                {session.user.role === 'partner' && (
                  <Link href="/dashboard" passHref>
                    <Button variant="ghost">Partner Dashboard</Button>
                  </Link>
                )}
                <Link href="/profile" passHref>
                  <Button variant="ghost">Profile</Button>
                </Link>
                {session.user.role === 'partner' && (
                  <Link href="/support" passHref>
                    <Button variant="ghost">Support</Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                        <AvatarFallback>{session.user.name?.[0] || session.user.email?.[0]}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{session.user.name || session.user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => signOut()}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth/signin" passHref>
                <Button variant="default">Sign in</Button>
              </Link>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
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
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {session ? (
            <>
              {session.user.role === 'admin' && (
                <Link href="/admin/dashboard" passHref>
                  <Button variant="ghost" className="w-full justify-start">Admin Dashboard</Button>
                </Link>
              )}
              {session.user.role === 'partner' && (
                <Link href="/dashboard" passHref>
                  <Button variant="ghost" className="w-full justify-start">Partner Dashboard</Button>
                </Link>
              )}
              <Link href="/profile" passHref>
                <Button variant="ghost" className="w-full justify-start">Profile</Button>
              </Link>
              {session.user.role === 'partner' && (
                <Link href="/support" passHref>
                  <Button variant="ghost" className="w-full justify-start">Support</Button>
                </Link>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Link href="/auth/signin" passHref>
              <Button variant="default" className="w-full">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

