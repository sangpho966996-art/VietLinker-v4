'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        setError('Link không hợp lệ hoặc đã hết hạn')
      }
    }
    handleAuthCallback()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!password.trim()) {
        throw new Error('Vui lòng nhập mật khẩu mới')
      }
      if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự')
      }
      if (password !== confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp')
      }

      const { error } = await supabase.auth.updateUser({
        password: password.trim()
      })

      if (error) {
        throw new Error(error.message)
      }

      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
          <Header />
        </Suspense>
        
        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Đặt lại mật khẩu thành công!
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
                </p>
                <div className="mt-6">
                  <Link href="/login" className="btn btn-primary">
                    Đăng nhập ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex justify-center items-center space-x-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">VietLinker</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu mới
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                ← Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
