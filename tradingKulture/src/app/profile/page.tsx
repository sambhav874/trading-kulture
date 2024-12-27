'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {useForm} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Icons } from '@/components/ui/icons'

const profileSchema = z.object({
  name: z.string()
    .nonempty('Name is required')
    .min(2, {
      message: 'Name must be at least 2 characters.',
    }),
  
  email: z.string()
    .nonempty('Email is required')
    .email({
      message: 'A valid email address is required.',
    }),
  
  phoneNumber: z.string()
    .nonempty('Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, {
      message: 'Please enter a valid phone number (e.g., +1234567890)',
    }),
  
  city: z.string()
    .nonempty('City is required')
    .min(2, {
      message: 'City must be at least 2 characters.',
    }),
  
  state: z.string()
    .nonempty('State is required')
    .min(2, {
      message: 'State must be at least 2 characters.',
    }),
  
  pincode: z.string()
    .nonempty('Pincode is required')
    .regex(/^\d{6}$/, {
      message: 'Please enter a valid 6-digit pincode.',
    }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isGoogleUser, setIsGoogleUser] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      city: '',
      state: '',
      pincode: '',
    },
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`)
      return
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`)
        const data = await response.json()
        
        if (response.ok) {
          setIsGoogleUser(Boolean(data.googleId));
          form.reset({
            name: data.name || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            city: data.city || '',
            state: data.state || '',
            pincode: data.pincode?.toString() || '',
          })
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load profile data')
      }
    }

    if (session) {
      fetchUserData()
    }
  }, [session, status, router, form])

  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        setSuccess('Profile updated successfully!')
        setTimeout(() => router.push(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`), 2000)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide your details to complete your profile. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }  : any) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field } : any) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="john@example.com" 
                          {...field} 
                          disabled={isGoogleUser}
                        />
                      </FormControl>
                      <FormDescription>
                        {isGoogleUser 
                          ? "Email cannot be changed for Google accounts" 
                          : "You can update your email address"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field } : any) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1234567890" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field } : any) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your City" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field } : any) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your State" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field } : any) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="px-0 pb-0">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}