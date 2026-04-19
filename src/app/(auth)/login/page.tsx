'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validations'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' }
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError('')
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      const resData = await res.json()
      setError(resData.error || 'Login failed')
      setIsLoading(false)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-center mb-2 tracking-tight text-gray-900">Welcome Back</h1>
        <p className="text-center text-sm text-gray-500 mb-8">Enter your credentials to access your account</p>
        
        {error && <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Username</Label>
            <Input id="identifier" placeholder="johndoe@example.com" {...register('identifier')} className="h-12" />
            {errors.identifier && <p className="text-sm text-red-500 font-medium">{errors.identifier.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} className="h-12" />
            {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12 mt-2 text-md bg-blue-600 hover:bg-blue-700 transition-all rounded-xl">
            {isLoading ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          First time here? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
