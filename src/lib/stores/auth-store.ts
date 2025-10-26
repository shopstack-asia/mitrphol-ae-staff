import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'INSPECTOR' | 'SUPERVISOR' | 'WORKER' | 'FUEL_ATTENDANT'
  phone: string
  isActive: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true })
        
        try {
          // Mock login logic - in real app, this would be an API call
          const mockUsers = [
            {
              id: "user-001",
              username: "inspector01",
              password: "password123",
              email: "inspector01@mitrphol.com",
              firstName: "สมชาย",
              lastName: "ใจดี",
              role: "INSPECTOR" as const,
              phone: "081-234-5678",
              isActive: true,
              createdAt: "2024-01-15T08:00:00Z"
            },
            {
              id: "user-002",
              username: "supervisor01",
              password: "password123",
              email: "supervisor01@mitrphol.com",
              firstName: "สมหญิง",
              lastName: "ขยัน",
              role: "SUPERVISOR" as const,
              phone: "081-234-5679",
              isActive: true,
              createdAt: "2024-01-15T08:00:00Z"
            },
            {
              id: "user-003",
              username: "worker01",
              password: "password123",
              email: "worker01@mitrphol.com",
              firstName: "สมศักดิ์",
              lastName: "แข็งแรง",
              role: "WORKER" as const,
              phone: "081-234-5680",
              isActive: true,
              createdAt: "2024-01-15T08:00:00Z"
            },
            {
              id: "user-004",
              username: "worker02",
              password: "password123",
              email: "worker02@mitrphol.com",
              firstName: "สมพร",
              lastName: "รักงาน",
              role: "WORKER" as const,
              phone: "081-234-5681",
              isActive: true,
              createdAt: "2024-01-15T08:00:00Z"
            },
            {
              id: "fuel-attendant-01",
              username: "fuel01",
              password: "password123",
              email: "fuel01@mitrphol.com",
              firstName: "สมชาย",
              lastName: "เติมน้ำมัน",
              role: "FUEL_ATTENDANT" as const,
              phone: "081-234-5682",
              isActive: true,
              createdAt: "2024-01-15T08:00:00Z"
            },
            {
              id: "fuel-attendant-02",
              username: "fuel02",
              password: "password123",
              email: "fuel02@mitrphol.com",
              firstName: "สมหญิง",
              lastName: "เติมน้ำมัน",
              role: "FUEL_ATTENDANT" as const,
              phone: "081-234-5683",
              isActive: true,
              createdAt: "2024-01-15T08:00:00Z"
            }
          ]

          const user = mockUsers.find(u => u.username === username && u.password === password)
          
          if (user) {
            const { password: _, ...userWithoutPassword } = user
            set({ 
              user: userWithoutPassword, 
              isAuthenticated: true, 
              isLoading: false 
            })
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
