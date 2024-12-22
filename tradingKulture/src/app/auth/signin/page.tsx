import { getProviders } from 'next-auth/react';
import SignInForm from '@/components/auth/SignInForm';

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h1>
      </div>

      <div className="mt-8">
        <SignInForm />
      </div>
    </div>
  );
}