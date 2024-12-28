'use client'
import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'

// Separate schemas for sign-in and sign-up
const signInSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, 'Password is required'),
})

const signUpSchema = z.object({
    name: z.string().min(2, {
      message: 'Name must be at least 2 characters.',
    }),
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
      message: 'Please enter a valid phone number.',
    }),
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters.',
    }),
  })

const SignInForm = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  // Use different form schemas based on mode
  const currentSchema = isSignUp ? signUpSchema : signInSchema
  
  const form = useForm<z.infer<typeof signUpSchema> | z.infer<typeof signInSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof signUpSchema> | z.infer<typeof signInSchema>) => {
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const signUpData = { ...values, role: 'partner' }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signUpData),
        })
    
        if (response.ok) {
          const result = await signIn('credentials', {
            email: values.email,
            password: values.password,
            callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/profile`, // Changed to redirect to profile
            redirect: false,
          })
    
          if (result?.error) {
            setError('Sign up successful, but sign in failed. Please try signing in manually.')
          } else if (result?.ok) {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/profile` 
          }
        } else {
          const data = await response.json()
          setError(data.message || 'Sign up failed. Please try again.')
        }
      } else {
        // Handle sign in
        const result = await signIn('credentials', {
          email: values.email,
          password: values.password,
          callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/profile`, 
          redirect: false,
        })
    
        if (result?.error) {
          setError(result.error)
        } else if (result?.ok) {
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/profile` 
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  const resetForm = () => {
    form.reset()
    setError('')
    setIsSignUp(!isSignUp)
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isSignUp && (
              <FormField
                control={form.control}
                name="name"
                render={({ field } : any) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSignUp && (
              <>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Signing up...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Sign up' : 'Sign in'
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={resetForm}
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up'}
          </Button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full mt-4"
            onClick={() => signIn('google', { callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/profile` })}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SignInForm