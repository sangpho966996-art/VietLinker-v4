'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'

export const dynamic = 'force-dynamic'

interface BusinessProfile {
  id: number
  business_name: string
  business_type: 'food' | 'service'
  description: string | null
  user_id: string
  user_email: string
  user_name: string
  created_at: string
  admin_status: 'pending' | 'approved' | 'rejected'
  users?: {
    email: string
    full_name: string | null
  } | {
    email: string
    full_name: string | null
  }[]
}

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const loadBusinesses = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/businesses?filter=${filter}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load businesses')
      }

      if (result.data) {
        const businessesWithUser = result.data.map((business: any) => {
          const user = Array.isArray(business.users) ? business.users[0] : business.users;
          return {
            ...business,
            user_email: user?.email || '',
            user_name: user?.full_name || user?.email || 'Unknown User'
          };
        })
        setBusinesses(businessesWithUser)
      }
    } catch (error) {
      console.error('Error loading businesses:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadBusinesses()
  }, [loadBusinesses])

  const handleApproveBusiness = async (business: BusinessProfile) => {
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_status: 'approved',
          action_type: 'approve_business'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve business')
      }

      loadBusinesses()
    } catch (error) {
      console.error('Error approving business:', error)
    }
  }

  const handleRejectBusiness = async (business: BusinessProfile) => {
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_status: 'rejected',
          action_type: 'reject_business'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject business')
      }

      loadBusinesses()
    } catch (error) {
      console.error('Error rejecting business:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Doanh nghiệp</h2>
          
          <div className="flex space-x-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === status
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'Tất cả' : 
                 status === 'pending' ? 'Chờ duyệt' :
                 status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh nghiệp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chủ sở hữu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businesses.map((business) => (
                  <tr key={business.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{business.business_name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {business.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{business.user_name}</div>
                      <div className="text-sm text-gray-500">{business.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {business.business_type === 'food' ? 'Nhà hàng' : 'Dịch vụ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        business.admin_status === 'approved' ? 'bg-green-100 text-green-800' :
                        business.admin_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {business.admin_status === 'approved' ? 'Đã duyệt' :
                         business.admin_status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(business.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {business.admin_status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveBusiness(business)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleRejectBusiness(business)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {businesses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có doanh nghiệp nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
