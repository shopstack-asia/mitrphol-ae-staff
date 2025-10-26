'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useFuelStore } from '@/lib/stores/fuel-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Calendar,
  Fuel,
  Truck,
  Zap,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  BarChart3,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function FuelSummaryPage() {
  const { user } = useAuthStore()
  const { 
    fuelRequests, 
    fuelTransactions, 
    fuelReturns,
    getFuelRequestsByUser,
    getFuelTransactionsByRequest,
    getFuelReturnsByRequest,
    calculateFuelUsage
  } = useFuelStore()
  
  const [dateFilter, setDateFilter] = useState('TODAY')
  const [fuelTypeFilter, setFuelTypeFilter] = useState('ALL')

  if (!user || user.role !== 'FUEL_ATTENDANT') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่สามารถเข้าถึงได้</h2>
          <p className="mt-2 text-sm text-gray-600">หน้าที่นี้สำหรับพนักงานเติมน้ำมันเท่านั้น</p>
        </div>
      </div>
    )
  }

  const userRequests = getFuelRequestsByUser(user.id)
  
  // Filter data by date
  const getFilteredData = () => {
    const now = new Date()
    let startDate: Date
    
    switch (dateFilter) {
      case 'TODAY':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'WEEK':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'MONTH':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'YEAR':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0)
    }
    
    const filteredRequests = userRequests.filter(req => 
      new Date(req.requestDate) >= startDate &&
      (fuelTypeFilter === 'ALL' || req.fuelType === fuelTypeFilter)
    )
    
    const filteredTransactions = fuelTransactions.filter(txn => 
      filteredRequests.some(req => req.id === txn.fuelRequestId)
    )
    
    const filteredReturns = fuelReturns.filter(ret => 
      filteredRequests.some(req => req.id === ret.fuelRequestId)
    )
    
    return { filteredRequests, filteredTransactions, filteredReturns }
  }

  const { filteredRequests, filteredTransactions, filteredReturns } = getFilteredData()

  // Calculate summary statistics
  const totalRequested = filteredRequests.reduce((sum, req) => sum + req.quantityRequested, 0)
  const totalDispensed = filteredTransactions.reduce((sum, txn) => sum + txn.amountDispensed, 0)
  const totalReturned = filteredReturns.reduce((sum, ret) => sum + ret.returnedQuantity, 0)
  const totalUsed = totalRequested - totalReturned
  const efficiency = totalRequested > 0 ? ((totalDispensed / totalUsed) * 100) : 0

  // Group transactions by equipment
  const equipmentUsage = filteredTransactions.reduce((acc, txn) => {
    if (!acc[txn.equipmentId]) {
      acc[txn.equipmentId] = {
        name: txn.equipmentName,
        type: txn.equipmentType,
        totalFuel: 0,
        transactionCount: 0
      }
    }
    acc[txn.equipmentId].totalFuel += txn.amountDispensed
    acc[txn.equipmentId].transactionCount += 1
    return acc
  }, {} as Record<string, { name: string; type: string; totalFuel: number; transactionCount: number }>)

  // Group transactions by date
  const dailyUsage = filteredTransactions.reduce((acc, txn) => {
    const date = new Date(txn.dateTime).toLocaleDateString('th-TH')
    if (!acc[date]) {
      acc[date] = { totalFuel: 0, transactionCount: 0 }
    }
    acc[date].totalFuel += txn.amountDispensed
    acc[date].transactionCount += 1
    return acc
  }, {} as Record<string, { totalFuel: number; transactionCount: number }>)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDateRangeText = () => {
    switch (dateFilter) {
      case 'TODAY': return 'วันนี้'
      case 'WEEK': return '7 วันที่ผ่านมา'
      case 'MONTH': return 'เดือนนี้'
      case 'YEAR': return 'ปีนี้'
      default: return 'ทั้งหมด'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">สรุปการใช้น้ำมัน</h1>
              <p className="text-sm text-gray-600">
                รายงานสรุปการใช้น้ำมันและการแจกจ่าย
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              ส่งออกรายงาน
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Button
                variant={dateFilter === 'TODAY' ? 'default' : 'outline'}
                onClick={() => setDateFilter('TODAY')}
                size="sm"
              >
                วันนี้
              </Button>
              <Button
                variant={dateFilter === 'WEEK' ? 'default' : 'outline'}
                onClick={() => setDateFilter('WEEK')}
                size="sm"
              >
                7 วัน
              </Button>
              <Button
                variant={dateFilter === 'MONTH' ? 'default' : 'outline'}
                onClick={() => setDateFilter('MONTH')}
                size="sm"
              >
                เดือนนี้
              </Button>
              <Button
                variant={dateFilter === 'YEAR' ? 'default' : 'outline'}
                onClick={() => setDateFilter('YEAR')}
                size="sm"
              >
                ปีนี้
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="ประเภทน้ำมัน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทั้งหมด</SelectItem>
                  <SelectItem value="Diesel">ดีเซล</SelectItem>
                  <SelectItem value="Gasoline">เบนซิน</SelectItem>
                  <SelectItem value="Biodiesel">ไบโอดีเซล</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">น้ำมันที่ขอ</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalRequested.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">ลิตร ({getDateRangeText()})</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">น้ำมันที่แจกจ่าย</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalDispensed.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">ลิตร ({getDateRangeText()})</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ArrowDown className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">น้ำมันที่คืน</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalReturned.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">ลิตร ({getDateRangeText()})</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ประสิทธิภาพ</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {efficiency.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">การใช้น้ำมัน</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Usage */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                การใช้น้ำมันตามรถ/เครื่องจักร
              </CardTitle>
              <CardDescription>
                สรุปการใช้น้ำมันของแต่ละรถหรือเครื่องจักร
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(equipmentUsage).length === 0 ? (
                <div className="text-center py-8">
                  <Fuel className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่มีข้อมูลการใช้น้ำมัน</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    ยังไม่มีการเติมน้ำมันในช่วงเวลาที่เลือก
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(equipmentUsage)
                    .sort(([,a], [,b]) => b.totalFuel - a.totalFuel)
                    .map(([equipmentId, data]) => (
                    <div key={equipmentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">{data.name}</h4>
                        <p className="text-sm text-gray-600">{data.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {data.totalFuel.toLocaleString()} ลิตร
                        </p>
                        <p className="text-sm text-gray-600">
                          {data.transactionCount} ครั้ง
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Usage */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                การใช้น้ำมันรายวัน
              </CardTitle>
              <CardDescription>
                สรุปการใช้น้ำมันในแต่ละวัน
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(dailyUsage).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่มีข้อมูลรายวัน</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    ยังไม่มีการเติมน้ำมันในช่วงเวลาที่เลือก
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(dailyUsage)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, data]) => (
                    <div key={date} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {data.totalFuel.toLocaleString()} ลิตร
                        </p>
                        <p className="text-xs text-gray-600">
                          {data.transactionCount} ครั้ง
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                รายการเติมน้ำมันล่าสุด
              </CardTitle>
              <CardDescription>
                รายการเติมน้ำมัน 10 รายการล่าสุด
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Fuel className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่มีรายการเติมน้ำมัน</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    ยังไม่มีการเติมน้ำมันในช่วงเวลาที่เลือก
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions
                    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                    .slice(0, 10)
                    .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">{transaction.equipmentName}</h4>
                        <p className="text-sm text-gray-600">
                          {transaction.fuelType} • {transaction.location.address}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.dateTime)} • {transaction.attendantName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {transaction.amountDispensed} ลิตร
                        </p>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          เสร็จสิ้น
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
