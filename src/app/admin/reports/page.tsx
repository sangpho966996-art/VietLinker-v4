'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import AdminLayout from '@/components/admin/AdminLayout'

export const dynamic = 'force-dynamic'

interface ContentReport {
  id: number
  reporter_user_id: string
  content_type: string
  content_id: string
  reason: string
  description: string | null
  status: 'pending' | 'resolved' | 'dismissed'
  admin_notes: string | null
  created_at: string
  reporter_name: string
  reporter_email: string
  users?: {
    email: string
    full_name: string | null
  } | {
    email: string
    full_name: string | null
  }[]
}

export default function AdminReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState<ContentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending')

  const loadReports = useCallback(async () => {
    try {
      let query = supabase
        .from('content_reports')
        .select(`
          id, reporter_user_id, content_type, content_id, reason, description, 
          status, admin_notes, created_at,
          users(email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data } = await query

      if (data) {
        const reportsWithUser = data.map(report => ({
          ...report,
          reporter_name: Array.isArray(report.users) ? (report.users[0]?.full_name || report.users[0]?.email || 'Unknown User') : ((report.users as { email: string; full_name: string | null })?.full_name || (report.users as { email: string; full_name: string | null })?.email || 'Unknown User'),
          reporter_email: Array.isArray(report.users) ? report.users[0]?.email || '' : (report.users as { email: string; full_name: string | null })?.email || ''
        }))
        setReports(reportsWithUser)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadReports()
  }, [filter, loadReports])

  const handleResolveReport = async (reportId: number) => {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({ 
          status: 'resolved',
          admin_notes: 'Đã xử lý báo cáo'
        })
        .eq('id', reportId)

      if (error) throw error

      if (user) {
        await supabase.from('admin_actions').insert({
          admin_user_id: user.id,
          action_type: 'resolve_report',
          target_type: 'content_reports',
          target_id: reportId.toString(),
          details: { action: 'resolved' }
        })
      }

      loadReports()
    } catch (error) {
    }
  }

  const handleDismissReport = async (reportId: number) => {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({ 
          status: 'dismissed',
          admin_notes: 'Báo cáo không hợp lệ'
        })
        .eq('id', reportId)

      if (error) throw error

      if (user) {
        await supabase.from('admin_actions').insert({
          admin_user_id: user.id,
          action_type: 'dismiss_report',
          target_type: 'content_reports',
          target_id: reportId.toString(),
          details: { action: 'dismissed' }
        })
      }

      loadReports()
    } catch (error) {
    }
  }

  const getContentTypeDisplay = (contentType: string) => {
    switch (contentType) {
      case 'marketplace_post': return 'Marketplace'
      case 'job_post': return 'Việc làm'
      case 'real_estate_post': return 'Bất động sản'
      case 'business_profile': return 'Doanh nghiệp'
      default: return contentType
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Báo cáo nội dung</h2>
          
          <div className="flex space-x-2">
            {(['all', 'pending', 'resolved', 'dismissed'] as const).map((status) => (
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
                 status === 'pending' ? 'Chờ xử lý' :
                 status === 'resolved' ? 'Đã xử lý' : 'Đã bỏ qua'}
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
                    Báo cáo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người báo cáo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày báo cáo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.reason}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {report.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.reporter_name}</div>
                      <div className="text-sm text-gray-500">{report.reporter_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getContentTypeDisplay(report.content_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        report.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status === 'resolved' ? 'Đã xử lý' :
                         report.status === 'dismissed' ? 'Đã bỏ qua' : 'Chờ xử lý'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {report.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Xử lý
                          </button>
                          <button
                            onClick={() => handleDismissReport(report.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Bỏ qua
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có báo cáo nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
