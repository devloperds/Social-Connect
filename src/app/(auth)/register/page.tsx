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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-center mb-2 tracking-tight text-gray-900">Create Account</h1>
        <p className="text-center text-sm text-gray-500 mb-8">Join the community today.</p>
        
        {error && <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="johndoe" {...register('username')} className="h-11" />
            {errors.username && <p className="text-sm text-red-500 font-medium">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="johndoe@example.com" {...register('email')} className="h-11" />
            {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name <span className="text-gray-400 font-normal">(Optional)</span></Label>
              <Input id="firstName" placeholder="John" {...register('firstName')} className="h-11" />
              {errors.firstName && <p className="text-sm text-red-500 font-medium">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name <span className="text-gray-400 font-normal">(Optional)</span></Label>
              <Input id="lastName" placeholder="Doe" {...register('lastName')} className="h-11" />
              {errors.lastName && <p className="text-sm text-red-500 font-medium">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} className="h-11" />
            {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12 mt-4 text-md bg-blue-600 hover:bg-blue-700 transition-all rounded-xl">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
