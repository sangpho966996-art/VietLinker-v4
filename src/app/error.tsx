'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-300">500</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Có lỗi xảy ra
          </h2>
          <p className="mt-2 text-gray-600">
            Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.
          </p>
          <div className="mt-6 space-x-4">
            <button
              onClick={() => reset()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Thử lại
            </button>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
