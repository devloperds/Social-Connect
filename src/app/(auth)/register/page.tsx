'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/lib/validations'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', firstName: '', lastName: '' }
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setError('')
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      const resData = await res.json()
      setError(resData.error || 'Registration failed')
      setIsLoading(false)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl gradient-primary shadow-xl shadow-indigo-200/50 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Join SocialConnect</h1>
          <p className="text-gray-500 mt-1.5">Create your account and connect with friends</p>
        </div>
        
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          {error && (
            <div className="bg-red-50/80 text-red-600 border border-red-100 p-3.5 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 animate-fade-in">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">Username</Label>
              <Input id="username" placeholder="johndoe" {...register('username')} className="h-12 rounded-xl bg-white/60 border-gray-200/80 focus:bg-white focus:border-indigo-300 focus:ring-indigo-200/50 transition-all" />
              {errors.username && <p className="text-sm text-red-500 font-medium">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email address</Label>
              <Input id="email" type="email" placeholder="johndoe@example.com" {...register('email')} className="h-12 rounded-xl bg-white/60 border-gray-200/80 focus:bg-white focus:border-indigo-300 focus:ring-indigo-200/50 transition-all" />
              {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name <span className="text-gray-400 font-normal">(Optional)</span></Label>
                <Input id="firstName" placeholder="John" {...register('firstName')} className="h-12 rounded-xl bg-white/60 border-gray-200/80 focus:bg-white focus:border-indigo-300 focus:ring-indigo-200/50 transition-all" />
                {errors.firstName && <p className="text-sm text-red-500 font-medium">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name <span className="text-gray-400 font-normal">(Optional)</span></Label>
                <Input id="lastName" placeholder="Doe" {...register('lastName')} className="h-12 rounded-xl bg-white/60 border-gray-200/80 focus:bg-white focus:border-indigo-300 focus:ring-indigo-200/50 transition-all" />
                {errors.lastName && <p className="text-sm text-red-500 font-medium">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} className="h-12 rounded-xl bg-white/60 border-gray-200/80 focus:bg-white focus:border-indigo-300 focus:ring-indigo-200/50 transition-all" />
              {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-12 mt-4 text-sm font-bold gradient-primary hover:opacity-90 transition-all rounded-xl shadow-lg shadow-indigo-200/50 text-white border-0"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200/80"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200/80"></div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
