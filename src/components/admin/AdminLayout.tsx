'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Quản lý User', href: '/admin/users', icon: '👥' },
    { name: 'Duyệt Posts', href: '/admin/posts', icon: '📝' },
    { name: 'Quản lý Credit', href: '/admin/credits', icon: '💳' },
    { name: 'Doanh nghiệp', href: '/admin/businesses', icon: '🏢' },
    { name: 'Báo cáo', href: '/admin/reports', icon: '🚨' },
    { name: 'Thống kê', href: '/admin/analytics', icon: '📈' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">VietLinker Admin</span>
          </Link>
        </div>
        
        <nav className="mt-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                pathname === item.href
                  ? 'bg-red-50 border-r-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6">
          <Link
            href="/dashboard"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            ← Quay lại Dashboard chính
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
