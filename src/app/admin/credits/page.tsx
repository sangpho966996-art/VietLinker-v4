'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'

export const dynamic = 'force-dynamic'

interface User {
  id: string
  email: string
  full_name: string | null
  credits: number
}

interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: string
  description: string | null
  created_at: string
  users: {
    email: string
    full_name: string | null
  } | {
    email: string
    full_name: string | null
  }[]
}

function AdminCreditsContent() {
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get('user')
  
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isAdjusting, setIsAdjusting] = useState(false)

  useEffect(() => {
    loadUsers()
    loadTransactions()
  }, [])

  useEffect(() => {
    if (selectedUserId && users.length > 0) {
      const user = users.find(u => u.id === selectedUserId)
      if (user) {
        setSelectedUser(user)
      }
    }
  }, [selectedUserId, users])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, credits')
        .order('email')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select(`
          id, user_id, amount, type, description, created_at,
          users(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreditAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !creditAmount) return

    setIsAdjusting(true)
    try {
      const amount = parseInt(creditAmount)
      const newCredits = selectedUser.credits + amount

      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: newCredits })
        .eq('id', selectedUser.id)

      if (updateError) throw updateError

      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: selectedUser.id,
          amount: amount,
          type: amount > 0 ? 'purchase' : 'deduction',
          description: description || `Admin adjustment: ${amount > 0 ? 'added' : 'deducted'} ${Math.abs(amount)} credits`
        })

      if (transactionError) throw transactionError

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('admin_actions').insert({
          admin_user_id: user.id,
          action_type: 'adjust_credits',
          target_type: 'user',
          target_id: selectedUser.id,
          details: { amount, description, old_credits: selectedUser.credits, new_credits: newCredits }
        })
      }

      setCreditAmount('')
      setDescription('')
      setSelectedUser({ ...selectedUser, credits: newCredits })
      loadUsers()
      loadTransactions()
    } catch (error) {
      console.error('Error adjusting credits:', error)
    } finally {
      setIsAdjusting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Credits</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Điều chỉnh Credits</h3>
            
            <form onSubmit={handleCreditAdjustment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn User
                </label>
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => {
                    const user = users.find(u => u.id === e.target.value)
                    setSelectedUser(user || null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Chọn user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email} ({user.credits} credits)
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Credits hiện tại: <span className="font-medium text-green-600">{selectedUser.credits}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số credits (dương để thêm, âm để trừ)
                </label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ví dụ: 100 hoặc -50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Lý do điều chỉnh credits..."
                />
              </div>

              <button
                type="submit"
                disabled={isAdjusting || !selectedUser || !creditAmount}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdjusting ? 'Đang xử lý...' : 'Điều chỉnh Credits'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Users theo Credits</h3>
            <div className="space-y-3">
              {users
                .sort((a, b) => b.credits - a.credits)
                .slice(0, 10)
                .map(user => (
                  <div key={user.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {user.credits} credits
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lịch sử giao dịch gần đây</h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {Array.isArray(transaction.users) ? (transaction.users[0]?.full_name || transaction.users[0]?.email) : (transaction.users?.full_name || transaction.users?.email)}
                        </div>
                        <div className="text-sm text-gray-500">{Array.isArray(transaction.users) ? transaction.users[0]?.email : transaction.users?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{transaction.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{transaction.description}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminCredits() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    }>
      <AdminCreditsContent />
    </Suspense>
  )
}
