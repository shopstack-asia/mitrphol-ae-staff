'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Receipt
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function PayoutsPage() {
  const { user } = useAuthStore()
  const { getPayoutsByUser } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  if (!user || user.role !== 'WORKER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่สามารถเข้าถึงได้</h2>
          <p className="mt-2 text-sm text-gray-600">หน้าที่นี้สำหรับพนักงานเท่านั้น</p>
        </div>
      </div>
    )
  }

  const payouts = getPayoutsByUser(user.id)
  
  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = 
      payout.periodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.period.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || payout.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'รอการจ่าย'
      case 'PAID': return 'จ่ายแล้ว'
      case 'CANCELLED': return 'ยกเลิก'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'PAID': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  // Calculate summary
  const totalEarnings = payouts.reduce((sum, payout) => sum + payout.netAmount, 0)
  const pendingPayouts = payouts.filter(p => p.status === 'PENDING').length
  const paidPayouts = payouts.filter(p => p.status === 'PAID').length

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">สรุปการจ่ายเงิน</h1>
              <p className="text-sm text-gray-600">
                ดูรายละเอียดการจ่ายเงินและรายได้
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">
                รายได้ทั้งหมด
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รอการจ่าย</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPayouts}</div>
              <p className="text-xs text-muted-foreground">
                งวดที่รอการจ่าย
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จ่ายแล้ว</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidPayouts}</div>
              <p className="text-xs text-muted-foreground">
                งวดที่จ่ายแล้ว
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ค้นหางวดการจ่าย..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('ALL')}
                size="sm"
              >
                ทั้งหมด
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
                size="sm"
              >
                รอการจ่าย
              </Button>
              <Button
                variant={statusFilter === 'PAID' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PAID')}
                size="sm"
              >
                จ่ายแล้ว
              </Button>
            </div>
          </div>
        </div>

        {/* Payouts List */}
        <div className="space-y-4">
          {filteredPayouts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่มีข้อมูลการจ่ายเงิน</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา' 
                    : 'ยังไม่มีข้อมูลการจ่ายเงิน'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPayouts.map((payout) => (
              <Card key={payout.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {payout.periodName}
                        </h3>
                        <Badge className={getStatusColor(payout.status)}>
                          {getStatusIcon(payout.status)}
                          <span className="ml-1">{getStatusText(payout.status)}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">รายได้รวม</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(payout.totalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">หักภาษี</p>
                          <p className="font-semibold text-red-600">
                            -{formatCurrency(payout.taxAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">หักอื่นๆ</p>
                          <p className="font-semibold text-red-600">
                            -{formatCurrency(payout.deductionAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">รับสุทธิ</p>
                          <p className="font-semibold text-lg text-gray-900">
                            {formatCurrency(payout.netAmount)}
                          </p>
                        </div>
                      </div>
                      
                      {payout.paidAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <Calendar className="h-4 w-4" />
                          <span>วันที่จ่าย: {formatDate(payout.paidAt)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <Link href={`/payouts/${payout.id}`}>
                        <Button variant="outline" size="sm">
                          <Receipt className="h-4 w-4 mr-1" />
                          ดูรายละเอียด
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
