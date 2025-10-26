# AE Operation Field System

ระบบปฏิบัติการภาคสนาม AE Operation สำหรับการจัดการงานตรวจแปลง แผนงาน และการจ่ายเงิน

## Features

### 🔐 Authentication
- ระบบเข้าสู่ระบบด้วย username/password
- ฟังก์ชันลืมรหัสผ่าน
- เปิดใช้งานบัญชีผู้ใช้
- Role-based access control (INSPECTOR, SUPERVISOR, WORKER)

### 📋 Work Request Management (ผู้ตรวจแปลง)
- รายการงานตรวจแปลงที่ได้รับมอบหมาย
- จัดการกิจกรรมที่ต้องทำ
- บันทึกหมายเหตุและไฟล์แนบ
- สถานะ: PENDING, IN_PROGRESS, COMPLETED

### 📅 Work Plan Management (หัวหน้างาน)
- จัดการแผนงานและทีมงาน
- เริ่มงานและแสดง QR Code
- จำกัดจำนวนพนักงานตามความต้องการ
- ดูรายชื่อพนักงานที่เข้าร่วม

### ⏰ Work Log Management (พนักงาน)
- รายการงานที่ได้รับมอบหมาย
- บันทึกไมล์เริ่มต้นและสิ้นสุด
- ถ่ายภาพและบันทึกข้อมูล
- ส่งงานเมื่อเสร็จสิ้น

### 💰 Payout Summary
- สรุปการจ่ายเงินรายงวด
- รายละเอียดรายได้และหักภาษี
- สถานะการจ่าย: PENDING, PAID

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **PWA**: next-pwa
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ (แนะนำ 20+)
- npm หรือ yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd staff
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Mock Data

ระบบใช้ mock data สำหรับการทดสอบ:

### Test Accounts
- **ผู้ตรวจแปลง**: inspector01 / password123
- **หัวหน้างาน**: supervisor01 / password123  
- **พนักงาน**: worker01 / password123, worker02 / password123

### Data Files
- `src/mock/users.json` - ข้อมูลผู้ใช้
- `src/mock/work_requests.json` - งานตรวจแปลง
- `src/mock/work_plans.json` - แผนงาน
- `src/mock/work_logs.json` - บันทึกการทำงาน
- `src/mock/payouts.json` - ข้อมูลการจ่ายเงิน

## PWA Features

- **Offline Support**: ใช้งานได้แม้ไม่มีอินเทอร์เน็ต
- **Install Prompt**: ติดตั้งเป็นแอปบนมือถือ
- **Push Notifications**: แจ้งเตือนงานใหม่ (พร้อมใช้งาน)
- **Background Sync**: ซิงค์ข้อมูลเมื่อกลับมาออนไลน์

## Mobile-First Design

- **Mobile**: Bottom navigation, fullscreen layout
- **Desktop**: Sidebar navigation, responsive dashboard
- **Tablet**: Adaptive layout based on screen size

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (operation)/       # Protected routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── work-requests/ # Work requests management
│   │   ├── work-plans/   # Work plans management
│   │   ├── my-jobs/      # Worker job management
│   │   └── payouts/      # Payout summary
│   ├── login/            # Authentication pages
│   ├── forgot-password/
│   └── activate-user/
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   └── navigation/      # Navigation components
├── lib/                 # Utilities and stores
│   └── stores/         # Zustand stores
└── mock/               # Mock data files
```

## Development

### Adding New Features
1. Create mock data in `src/mock/`
2. Update stores in `src/lib/stores/`
3. Create pages in `src/app/`
4. Add components in `src/components/`

### State Management
- `auth-store.ts`: Authentication state
- `data-store.ts`: Application data state

### Styling
- TailwindCSS for utility classes
- shadcn/ui for component library
- Custom components in `src/components/ui/`

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Docker
```bash
docker build -t ae-operation .
docker run -p 3000:3000 ae-operation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private - MitrPhol Group

## Support

For technical support, contact the development team.