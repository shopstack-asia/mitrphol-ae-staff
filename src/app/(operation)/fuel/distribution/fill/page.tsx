'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Camera, QrCode, Search, CheckCircle, Truck, Fuel, X, Scan } from 'lucide-react'
import jsQR from 'jsqr'
import { BrowserMultiFormatReader } from '@zxing/library'

export default function FillFuelPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { workLogs, updateWorkLog } = useDataStore()

  const [workLogId, setWorkLogId] = useState('')
  const [selectedWorkLog, setSelectedWorkLog] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [fuelingData, setFuelingData] = useState({
    fuelBefore: '',
    fuelAfter: '',
    fuelBeforePhoto: '',
    fuelAfterPhoto: '',
    remarks: ''
  })
  const [isCapturing, setIsCapturing] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleQRScan = async () => {
    setIsScanning(true)
    
    try {
      // Check camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('กล้องไม่รองรับในเบราว์เซอร์นี้')
        setIsScanning(false)
        return
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })

      console.log('Camera access granted')

      // Create video element
      const video = document.createElement('video')
      video.srcObject = stream
      video.setAttribute('playsinline', 'true')
      video.setAttribute('autoplay', 'true')
      video.setAttribute('muted', 'true')
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play()
          resolve(true)
        }
      })

      console.log('Video ready, dimensions:', video.videoWidth, 'x', video.videoHeight)

      // Create scanner overlay
      const overlay = document.createElement('div')
      overlay.id = 'qr-scanner-overlay'
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.9);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `

      // Create video container
      const videoContainer = document.createElement('div')
      videoContainer.style.cssText = `
        position: relative;
        width: 90vw;
        max-width: 400px;
        height: 90vw;
        max-height: 400px;
        border: 3px solid #10b981;
        border-radius: 12px;
        overflow: hidden;
        background: #000;
      `

      // Style video
      video.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `

      // Create scan frame
      const scanFrame = document.createElement('div')
      scanFrame.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200px;
        height: 200px;
        border: 2px solid #10b981;
        border-radius: 8px;
        background: transparent;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
      `

      // Create close button
      const closeBtn = document.createElement('button')
      closeBtn.innerHTML = '✕'
      closeBtn.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        font-size: 20px;
        cursor: pointer;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      // Create instruction text
      const instruction = document.createElement('div')
      instruction.innerHTML = 'วาง QR Code หรือ Barcode ในกรอบสีเขียว'
      instruction.style.cssText = `
        color: white;
        text-align: center;
        font-size: 18px;
        margin-top: 20px;
        padding: 0 20px;
        font-weight: 500;
      `

      // Create cancel button
      const cancelBtn = document.createElement('button')
      cancelBtn.innerHTML = 'ยกเลิก'
      cancelBtn.style.cssText = `
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
        font-weight: 500;
      `

      // Assemble overlay
      videoContainer.appendChild(video)
      videoContainer.appendChild(scanFrame)
      videoContainer.appendChild(closeBtn)
      overlay.appendChild(videoContainer)
      overlay.appendChild(instruction)
      overlay.appendChild(cancelBtn)
      document.body.appendChild(overlay)

      // Create canvas for QR detection
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      let scanning = true
      let detectedCode = ''

      const scanQR = () => {
        if (!scanning || !video || !ctx) return
        
        try {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            
            // Try QR Code detection first
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height)
            
            // Debug: Log every 30 frames (about 1 second)
            if (Math.random() < 0.03) {
              console.log('Scanning... QR result:', qrCode ? 'Found' : 'Not found')
            }
            
            if (qrCode && qrCode.data && qrCode.data !== detectedCode) {
              console.log('QR Code detected:', qrCode.data)
              detectedCode = qrCode.data
              
              // Process detected code
              const workLogId = qrCode.data.trim()
              setWorkLogId(workLogId)
              
              // Clean up
              scanning = false
              stream.getTracks().forEach(track => track.stop())
              document.body.removeChild(overlay)
              setIsScanning(false)
              
              // Auto search for work log
              const workLog = workLogs.find(log => log.id === workLogId)
              if (workLog) {
                setSelectedWorkLog(workLog)
                alert(`สแกนสำเร็จ!\nWork Log: ${workLogId}`)
              } else {
                alert(`ไม่พบ Work Log: ${workLogId}`)
              }
              return
            }
            
            // Try 2D Barcode detection with ZXing (using data URL)
            try {
              const reader = new BrowserMultiFormatReader()
              // Convert video frame to data URL for barcode detection
              const tempCanvas = document.createElement('canvas')
              const tempCtx = tempCanvas.getContext('2d')
              if (tempCtx) {
                tempCanvas.width = video.videoWidth
                tempCanvas.height = video.videoHeight
                tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height)
                
                const dataURL = tempCanvas.toDataURL('image/png')
                reader.decodeFromImageUrl(dataURL).then(result => {
                  if (result && result.getText() && result.getText() !== detectedCode) {
                    console.log('Barcode detected:', result.getText())
                    detectedCode = result.getText()
                    
                    // Process detected code
                    const workLogId = result.getText().trim()
                    setWorkLogId(workLogId)
                    
                    // Clean up
                    scanning = false
                    stream.getTracks().forEach(track => track.stop())
                    document.body.removeChild(overlay)
                    setIsScanning(false)
                    
                    // Auto search for work log
                    const workLog = workLogs.find(log => log.id === workLogId)
                    if (workLog) {
                      setSelectedWorkLog(workLog)
                      alert(`สแกนสำเร็จ!\nWork Log: ${workLogId}`)
                    } else {
                      alert(`ไม่พบ Work Log: ${workLogId}`)
                    }
                  }
                }).catch(barcodeError => {
                  // Barcode not found, continue scanning
                  if (Math.random() < 0.01) {
                    console.log('Barcode scan attempt:', 'No barcode found')
                  }
                })
              }
            } catch (barcodeError) {
              // Barcode not found, continue scanning
              if (Math.random() < 0.01) {
                console.log('Barcode scan attempt:', 'No barcode found')
              }
            }
          }
        } catch (error) {
          console.warn('Scan error:', error)
        }
        
        if (scanning) {
          requestAnimationFrame(scanQR)
        }
      }

      // Start scanning after video is ready
      setTimeout(() => {
        scanQR()
      }, 1000)

      // Close button handler
      closeBtn.onclick = () => {
        scanning = false
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(overlay)
        setIsScanning(false)
      }

      // Cancel button handler
      cancelBtn.onclick = () => {
        scanning = false
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(overlay)
        setIsScanning(false)
      }

    } catch (error) {
      console.error('Camera error:', error)
      alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง')
      setIsScanning(false)
    }
  }

  const handleSearchWorkLog = () => {
    if (!workLogId.trim()) {
      alert('กรุณากรอก Work Log No.')
      return
    }

    const workLog = workLogs.find(log => log.id === workLogId)
    if (workLog) {
      setSelectedWorkLog(workLog)
    } else {
      alert('ไม่พบ Work Log ที่ระบุ')
    }
  }

  const handleCameraCapture = async (type: 'before' | 'after') => {
    setIsCapturing(type)
    console.log('Starting camera capture...')
    
    try {
      // ตรวจสอบ browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser')
      }
      
      console.log('Requesting camera access...')
      // เปิดกล้อง
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // ใช้กล้องหลัง
      })
      console.log('Camera access granted:', stream)
      
      // สร้าง modal สำหรับถ่ายรูป
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-4 max-w-md w-full mx-4">
          <div class="text-center mb-4">
            <h3 class="text-lg font-semibold">ถ่ายรูปมิเตอร์น้ำมัน${type === 'before' ? 'ก่อนเติม' : 'หลังเติม'}</h3>
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
      
      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(modal)
        setIsCapturing('')
      }
      
      captureBtn?.addEventListener('click', () => {
        console.log('Capturing image...')
        
        // สร้าง canvas และถ่ายรูป
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (ctx && videoElement) {
          canvas.width = videoElement.videoWidth
          canvas.height = videoElement.videoHeight
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
          
          // แปลงเป็น blob และสร้าง URL
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              console.log('Image captured successfully:', url)
              
              if (type === 'before') {
                setFuelingData({...fuelingData, fuelBeforePhoto: url})
              } else {
                setFuelingData({...fuelingData, fuelAfterPhoto: url})
              }
            }
          }, 'image/jpeg', 0.8)
        }
        
        cleanup()
      })
      
      cancelBtn?.addEventListener('click', cleanup)
      
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง')
      setIsCapturing('')
    }
  }

  const handleConfirmFueling = () => {
    if (!fuelingData.fuelBefore || !fuelingData.fuelAfter) {
      alert('กรุณากรอกจำนวนน้ำมันก่อนเติมและหลังเติม')
      return
    }

    if (!fuelingData.fuelBeforePhoto && !fuelingData.fuelAfterPhoto) {
      alert('กรุณาถ่ายรูปน้ำมันก่อนเติมหรือหลังเติมอย่างน้อย 1 รูป')
      return
    }

    setIsLoading(true)
    
    // Mock fuel consumption calculation
    const fuelUsed = parseInt(fuelingData.fuelBefore) - parseInt(fuelingData.fuelAfter)
    
    // Update work log with fuel information
    updateWorkLog(selectedWorkLog.id, {
      fuelBefore: parseInt(fuelingData.fuelBefore),
      fuelAfter: parseInt(fuelingData.fuelAfter),
      fuelUsed: fuelUsed,
      fuelBeforePhoto: fuelingData.fuelBeforePhoto,
      fuelAfterPhoto: fuelingData.fuelAfterPhoto,
      fuelingRemarks: fuelingData.remarks
    })

    setTimeout(() => {
      setIsLoading(false)
      alert(`บันทึกการเติมน้ำมันเรียบร้อยแล้ว\nน้ำมันที่ใช้: ${fuelUsed} ลิตร`)
      router.back()
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">เติมน้ำมัน</h1>
          <div></div>
        </div>

        {/* QR Scan / Work Log Input */}
        {!selectedWorkLog && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>เลือก Work Log</CardTitle>
              <CardDescription>สแกน QR Code/Barcode หรือกรอก Work Log No.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Scan className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  สแกน QR Code หรือ Barcode ของ Work Log
                </p>
                <Button 
                  onClick={handleQRScan}
                  disabled={isScanning}
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังสแกน...
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      สแกน QR/Barcode
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-gray-500 mb-4">หรือ</div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="workLogId">Work Log No.</Label>
                    <Input
                      id="workLogId"
                      placeholder="เช่น wl-001"
                      value={workLogId}
                      onChange={(e) => setWorkLogId(e.target.value)}
                    />
                  </div>
                <Button 
                  onClick={handleSearchWorkLog}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  ค้นหา Work Log
                </Button>
                
                {/* Test Button */}
                <Button 
                  onClick={() => {
                    setWorkLogId('wl-001')
                    const workLog = workLogs.find(log => log.id === 'wl-001')
                    if (workLog) {
                      setSelectedWorkLog(workLog)
                      alert('ทดสอบ: เลือก Work Log wl-001')
                    }
                  }}
                  variant="outline"
                  className="w-full mt-2"
                >
                  ทดสอบ: เลือก wl-001
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Work Log Details */}
        {selectedWorkLog && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>รายละเอียดงาน</CardTitle>
                <CardDescription>ข้อมูลงานและรถที่เกี่ยวข้อง</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Work Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Work Log No.</Label>
                    <p className="text-sm text-gray-900 font-mono">{selectedWorkLog.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">แผนงาน</Label>
                    <p className="text-sm text-gray-900">{selectedWorkLog.workPlanTitle}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">แปลง</Label>
                    <p className="text-sm text-gray-900">{selectedWorkLog.plotName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">งานที่ได้รับมอบหมาย</Label>
                    <p className="text-sm text-gray-900">{selectedWorkLog.task}</p>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    ข้อมูลรถ
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">รถที่ใช้</Label>
                      <p className="text-sm text-gray-900">
                        {selectedWorkLog.vehicleType || 'ไม่ระบุ'} 
                        {selectedWorkLog.vehicleLicensePlate && ` (${selectedWorkLog.vehicleLicensePlate})`}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">ประเภทน้ำมัน</Label>
                      <p className="text-sm text-gray-900">
                        <span className="inline-flex items-center gap-1">
                          <Fuel className="h-4 w-4 text-green-600" />
                          Diesel (ดีเซล)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fuel Meter Information */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-green-600" />
                    ข้อมูลมิเตอร์น้ำมัน
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fuelBefore" className="text-sm font-medium text-gray-700">มิเตอร์น้ำมันก่อนเติม (ลิตร)</Label>
                      <Input
                        id="fuelBefore"
                        type="number"
                        placeholder="เช่น 150"
                        value={fuelingData.fuelBefore}
                        onChange={(e) => setFuelingData({...fuelingData, fuelBefore: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fuelAfter" className="text-sm font-medium text-gray-700">มิเตอร์น้ำมันหลังเติม (ลิตร)</Label>
                      <Input
                        id="fuelAfter"
                        type="number"
                        placeholder="เช่น 200"
                        value={fuelingData.fuelAfter}
                        onChange={(e) => setFuelingData({...fuelingData, fuelAfter: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* Fuel Calculation */}
                  {fuelingData.fuelBefore && fuelingData.fuelAfter && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">น้ำมันที่เติม:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {parseInt(fuelingData.fuelAfter) - parseInt(fuelingData.fuelBefore)} ลิตร
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Photo Capture */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  ถ่ายรูปมิเตอร์น้ำมัน
                </CardTitle>
                <CardDescription>ถ่ายรูปมิเตอร์น้ำมันก่อนและหลังเติม</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Before Fueling Photo */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">รูปภาพมิเตอร์น้ำมันก่อนเติม</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {fuelingData.fuelBeforePhoto ? (
                        <div className="relative">
                          <img src={fuelingData.fuelBeforePhoto} alt="Before" className="w-full h-32 object-cover rounded border" />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => setFuelingData({...fuelingData, fuelBeforePhoto: ''})}
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCameraCapture('before')}
                          disabled={isCapturing === 'before'}
                          className="w-full h-32"
                        >
                          {isCapturing === 'before' ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                              กำลังถ่ายรูป...
                            </>
                          ) : (
                            <>
                              <Camera className="h-4 w-4 mr-2" />
                              ถ่ายรูปมิเตอร์ก่อนเติม
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">คำแนะนำ:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>ถ่ายรูปให้เห็นตัวเลขมิเตอร์ชัดเจน</li>
                        <li>ให้แสงสว่างเพียงพอ</li>
                        <li>หลีกเลี่ยงเงาหรือแสงสะท้อน</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* After Fueling Photo */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">รูปภาพมิเตอร์น้ำมันหลังเติม</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {fuelingData.fuelAfterPhoto ? (
                        <div className="relative">
                          <img src={fuelingData.fuelAfterPhoto} alt="After" className="w-full h-32 object-cover rounded border" />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => setFuelingData({...fuelingData, fuelAfterPhoto: ''})}
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCameraCapture('after')}
                          disabled={isCapturing === 'after'}
                          className="w-full h-32"
                        >
                          {isCapturing === 'after' ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                              กำลังถ่ายรูป...
                            </>
                          ) : (
                            <>
                              <Camera className="h-4 w-4 mr-2" />
                              ถ่ายรูปมิเตอร์หลังเติม
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">คำแนะนำ:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>ถ่ายรูปให้เห็นตัวเลขมิเตอร์ชัดเจน</li>
                        <li>ให้แสงสว่างเพียงพอ</li>
                        <li>หลีกเลี่ยงเงาหรือแสงสะท้อน</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <Label htmlFor="remarks">หมายเหตุ</Label>
                  <Textarea
                    id="remarks"
                    value={fuelingData.remarks}
                    onChange={(e) => setFuelingData({...fuelingData, remarks: e.target.value})}
                    placeholder="หมายเหตุเพิ่มเติม เช่น ปัญหาที่พบ, สถานที่เติมน้ำมัน..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Confirm Button */}
                <div className="pt-4">
                  <Button 
                    onClick={handleConfirmFueling}
                    disabled={isLoading || !fuelingData.fuelBefore || !fuelingData.fuelAfter}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ยืนยันการเติมน้ำมัน
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
