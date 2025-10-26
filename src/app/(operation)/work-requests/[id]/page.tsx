'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft,
  MapPin, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
  Send,
  Camera,
  FileText,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function WorkRequestDetailPage() {
  const { user } = useAuthStore()
  const { workRequests, updateWorkRequest } = useDataStore()
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [completedActivities, setCompletedActivities] = useState<string[]>([])
  const [attachments, setAttachments] = useState<Array<{
    id: string
    name: string
    type: string
    url: string
    file?: File
  }>>([])
  const [isCapturing, setIsCapturing] = useState(false)

  const requestId = params.id as string
  const request = workRequests.find(r => r.id === requestId)

  useEffect(() => {
    if (request) {
      setNotes(request.notes)
      setCompletedActivities(
        request.activities
          .filter(activity => activity.completed)
          .map(activity => activity.id)
      )
      setAttachments(request.attachments || [])
    }
  }, [request])

  if (!user || user.role !== 'INSPECTOR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่สามารถเข้าถึงได้</h2>
          <p className="mt-2 text-sm text-gray-600">หน้าที่นี้สำหรับผู้ตรวจแปลงเท่านั้น</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่พบงานตรวจแปลง</h2>
          <p className="mt-2 text-sm text-gray-600">งานตรวจแปลงที่คุณกำลังมองหาไม่มีอยู่</p>
          <Link href="/work-requests">
            <Button className="mt-4">กลับไปรายการงาน</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'รอดำเนินการ'
      case 'IN_PROGRESS': return 'กำลังดำเนินการ'
      case 'COMPLETED': return 'เสร็จสิ้น'
      case 'CANCELLED': return 'ยกเลิก'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleActivityToggle = (activityId: string) => {
    setCompletedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const newAttachment = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          file: file
        }
        setAttachments(prev => [...prev, newAttachment])
      })
    }
  }

  const handleCameraCapture = async () => {
    setIsCapturing(true)
    
    try {
      // เปิดกล้อง
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // ใช้กล้องหลัง
      })
      
      // สร้าง video element
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()
      
      // สร้าง modal สำหรับถ่ายรูป
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-4 max-w-md w-full mx-4">
          <div class="text-center mb-4">
            <h3 class="text-lg font-semibold">ถ่ายรูป</h3>
            <p class="text-sm text-gray-600">จัดตำแหน่งและคลิกถ่าย</p>
          </div>
          <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <video id="camera-video" class="w-full h-full object-cover" autoplay></video>
          </div>
          <div class="flex gap-2">
            <button id="capture-btn" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              ถ่ายรูป
            </button>
            <button id="cancel-btn" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
              ยกเลิก
            </button>
          </div>
        </div>
      `
      
      document.body.appendChild(modal)
      
      // ตั้งค่า video
      const videoElement = modal.querySelector('#camera-video') as HTMLVideoElement
      videoElement.srcObject = stream
      
      // จัดการ events
      const captureBtn = modal.querySelector('#capture-btn')
      const cancelBtn = modal.querySelector('#cancel-btn')
      
      captureBtn?.addEventListener('click', () => {
        console.log('Capture button clicked')
        
        // สร้าง canvas เพื่อจับภาพ
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        
        console.log('Canvas size:', canvas.width, 'x', canvas.height)
        
        if (ctx) {
          ctx.drawImage(videoElement, 0, 0)
          console.log('Image drawn to canvas')
          
          // แปลงเป็น blob
          canvas.toBlob((blob) => {
            console.log('Canvas toBlob result:', blob)
            if (blob) {
              const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
              const url = URL.createObjectURL(blob)
              
              console.log('Created attachment:', { file, url })
              
              const newAttachment = {
                id: Date.now().toString(),
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
                url: url,
                file: file
              }
              
              console.log('Adding attachment:', newAttachment)
              setAttachments(prev => {
                const newAttachments = [...prev, newAttachment]
                console.log('Updated attachments:', newAttachments)
                return newAttachments
              })
            } else {
              console.error('Failed to create blob from canvas')
            }
          }, 'image/jpeg', 0.8)
        } else {
          console.error('Failed to get canvas context')
        }
        
        // ปิดกล้องและ modal
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(modal)
        setIsCapturing(false)
      })
      
      cancelBtn?.addEventListener('click', () => {
        // ปิดกล้องและ modal
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(modal)
        setIsCapturing(false)
      })
      
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง')
      setIsCapturing(false)
    }
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  const handleSaveDraft = async () => {
    setIsLoading(true)
    
    // Update activities
    const updatedActivities = request.activities.map(activity => ({
      ...activity,
      completed: completedActivities.includes(activity.id)
    }))

    updateWorkRequest(requestId, {
      notes,
      activities: updatedActivities,
      attachments: attachments,
      status: updatedActivities.some(a => a.completed) ? 'IN_PROGRESS' : 'PENDING'
    })

    setTimeout(() => {
      setIsLoading(false)
      // Show success message
    }, 1000)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    // Update activities
    const updatedActivities = request.activities.map(activity => ({
      ...activity,
      completed: completedActivities.includes(activity.id)
    }))

    updateWorkRequest(requestId, {
      notes,
      activities: updatedActivities,
      attachments: attachments,
      status: 'WAITING_APPROVAL'
    })

    setTimeout(() => {
      setIsLoading(false)
      router.push('/work-requests')
    }, 1000)
  }

  const allRequiredActivitiesCompleted = request.activities
    .filter(activity => activity.isRequired)
    .every(activity => completedActivities.includes(activity.id))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/work-requests">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับ
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{request.requestNo}</h1>
              <p className="text-sm text-gray-600">รายละเอียดงานตรวจแปลง</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ข้อมูลงานตรวจแปลง</CardTitle>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">หมายเลขคำขอ</Label>
                    <p className="text-sm text-gray-900">{request.requestNo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">ลูกค้า</Label>
                    <p className="text-sm text-gray-900">{request.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">แปลง</Label>
                    <p className="text-sm text-gray-900">{request.plotName} ({request.plotSize} ไร่)</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">กำหนดส่ง</Label>
                    <p className="text-sm text-gray-900">{formatDate(request.dueDate)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">ที่ตั้งแปลง</Label>
                  <p className="text-sm text-gray-900">{request.plotLocation}</p>
                </div>
              </CardContent>
            </Card>

            {/* Activities */}
            <Card>
              <CardHeader>
                <CardTitle>กิจกรรมที่ต้องทำ</CardTitle>
                <CardDescription>
                  เลือกกิจกรรมที่ทำเสร็จแล้ว
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={activity.id}
                      checked={completedActivities.includes(activity.id)}
                      onCheckedChange={() => handleActivityToggle(activity.id)}
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={activity.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {activity.name}
                        {activity.isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>หมายเหตุ</CardTitle>
                <CardDescription>
                  เพิ่มหมายเหตุหรือข้อมูลเพิ่มเติม
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="กรอกหมายเหตุ..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>ไฟล์แนบ</CardTitle>
                <CardDescription>
                  ถ่ายรูปและแนบไฟล์ประกอบการตรวจแปลง
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Attachments */}
                {attachments.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="relative group">
                        {attachment.type.startsWith('image/') ? (
                          <div className="aspect-square rounded-lg overflow-hidden border">
                            <img 
                              src={attachment.url} 
                              alt={attachment.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square rounded-lg border flex items-center justify-center bg-gray-50">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">{attachment.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">ยังไม่มีไฟล์แนบ</p>
                  </div>
                )}
                
                {/* Upload Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCameraCapture}
                    disabled={isCapturing}
                    className="flex-1"
                  >
                    {isCapturing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        กำลังถ่ายรูป...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        ถ่ายรูป
                      </>
                    )}
                  </Button>
                  
                  <label className="flex-1">
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        เลือกไฟล์
                      </span>
                    </Button>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>การดำเนินการ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  บันทึกแบบร่าง
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !allRequiredActivitiesCompleted}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  ส่งงาน
                </Button>
                
                {!allRequiredActivitiesCompleted && (
                  <p className="text-xs text-red-600">
                    * ต้องทำกิจกรรมที่จำเป็นให้ครบก่อนส่งงาน
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>ความคืบหน้า</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>กิจกรรมที่ทำเสร็จ</span>
                    <span>{completedActivities.length}/{request.activities.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(completedActivities.length / request.activities.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
