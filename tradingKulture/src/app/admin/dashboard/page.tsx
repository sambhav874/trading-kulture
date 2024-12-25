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
    router.push('/auth/signin')
    return null
  }

  const dashboardCards = [
    {
      title: 'Manage Partners',
      description: 'View and manage business partners, their profiles, and permissions',
      icon: Users,
      route: '/admin/business-partners',
      stats: 'View all partners',
      color: 'bg-blue-500'
    },
    {
      title: 'Add Leads',
      description: 'Adding leads generated via social media',
      icon: UserPlus,
      route: '/leads/new',
      stats: 'Add partner',
      color: 'bg-green-500'
    },
    {
      title: 'Kits and Inventory',
      description: 'Managing Inventory and Kits with respect to the partner',
      icon: UserPlus,
      route: '/admin/kits-inventory',
      stats: 'Add partner',
      color: 'bg-green-500'
    },
    {
      title: 'Partner Analytics',
      description: 'View performance metrics and analytics',
      icon: BarChart,
      route: '/admin/partner-stats',
      stats: 'View analytics',
      color: 'bg-purple-500'
    },
    {
      title: 'Notifications',
      description: 'Manage system notifications and alerts',
      icon: Bell,
      route: '/notifications',
      stats: 'View notifications',
      color: 'bg-yellow-500'
    },
    {
      title: 'Security Settings',
      description: 'Manage system security and access controls',
      icon: Shield,
      route: '/security',
      stats: 'View settings',
      color: 'bg-red-500'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: Settings,
      route: '/settings',
      stats: 'View settings',
      color: 'bg-gray-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {session.user.name}</p>
          </div>
          <Button
            onClick={() => router.push('/business-partners/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Partner
          </Button>
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