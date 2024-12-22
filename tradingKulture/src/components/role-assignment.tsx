'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function RoleAssignment() {
  const { user } = useUser()
  const [targetUserId, setTargetUserId] = useState('')
  const [role, setRole] = useState('')

  const assignRole = async () => {
    try {
      const response = await fetch('/api/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, role }),
      })

      if (response.ok) {
        alert('Role assigned successfully')
      } else {
        alert('Failed to assign role')
      }
    } catch (error) {
      console.error('Error assigning role:', error)
      alert('Error assigning role')
    }
  }

  if (user?.publicMetadata?.role !== 'admin') {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Assign Role</h2>
      <Input
        placeholder="User ID"
        value={targetUserId}
        onChange={(e) => setTargetUserId(e.target.value)}
      />
      <Select onValueChange={setRole}>
        <SelectTrigger>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="business_partner">Business Partner</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={assignRole}>Assign Role</Button>
    </div>
  )
}

