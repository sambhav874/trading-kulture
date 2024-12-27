'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, Settings, BarChart, Bell, Shield } from 'lucide-react'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`)
    return null
  }

  const dashboardCards = [
    {
      title: 'Manage Partners',
      description: 'View and manage business partners, their profiles, and permissions',
      icon: Users,
      route: `${process.env.NEXT_PUBLIC_API_URL}/admin/business-partners`,
      stats: 'View all partners',
      color: 'bg-blue-500'
    },
    {
      title: 'Add Leads',
      description: 'Adding leads generated via social media',
      icon: UserPlus,
      route: `${process.env.NEXT_PUBLIC_API_URL}/admin/leads`,
      stats: 'Add leads',
      color: 'bg-green-500'
    },
    {
      title: 'Kits and Inventory',
      description: 'Managing Inventory and Kits with respect to the partner',
      icon: Users,
      route: `${process.env.NEXT_PUBLIC_API_URL}/admin/kits-inventory`,
      stats: 'Send Kits , Approve Kit Requests',
      color: 'bg-green-500'
    },
    {
      title: 'Partner Analytics',
      description: 'View performance metrics and analytics',
      icon: BarChart,
      route: `${process.env.NEXT_PUBLIC_API_URL}/admin/partner-stats`,
      stats: 'View analytics',
      color: 'bg-purple-500'
    },
    {
      title: 'Commissions Slabs',
      description: 'Manage commissions slabs for business partners',
      icon: Settings,
      route: `${process.env.NEXT_PUBLIC_API_URL}/admin/commissions`,
      stats: 'View Slabs',
      color: 'bg-red-500'
    },
    {
      title: 'Commissions Calculator',
      description: 'Calculate the commissions for business partners',
      icon: Shield,
      route: `${process.env.NEXT_PUBLIC_API_URL}/admin/commission-calculator`,
      stats: 'View Commissions',
      color: 'bg-gray-500'
    },
    {
      title: 'Support Tickets',
      description: 'Reply to support tickets',
      icon: Bell,
      route: `${process.env.NEXT_PUBLIC_API_URL}/admin/support-tickets`,
      stats: 'View tickets',
      color: 'bg-yellow-500'
    },
    
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {session.user.name}</p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Card 
                key={index}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(card.route)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                      <Icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{card.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {card.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600 hover:underline">
                      {card.stats}
                    </span>
                    <Button variant="ghost" size="sm">
                      View →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}