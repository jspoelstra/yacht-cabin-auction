import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AuctionState, AuctionConfig, Participant } from '@/lib/types'
import { formatCurrency, formatTimeRemaining } from '@/lib/auction'
import { SignOut, ArrowsClockwise, Users, Clock, PencilSimple, Key } from '@phosphor-icons/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminSettings } from './AdminSettings'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AdminDashboardProps {
  auctionState: AuctionState
  onRestart: () => void
  onLogout: () => void
  onUpdateSettings: (config: AuctionConfig) => void
  onUpdateParticipants: (participants: Participant[]) => void
  onUpdateAdminPassword: (newPassword: string) => void
}

export function AdminDashboard({ auctionState, onRestart, onLogout, onUpdateSettings, onUpdateParticipants, onUpdateAdminPassword }: AdminDashboardProps) {
  const [now, setNow] = useState(Date.now())
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', password: '' })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [newAdminPassword, setNewAdminPassword] = useState('')

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const sortedParticipants = [...auctionState.participants].sort((a, b) => {
    if (b.bid !== a.bid) return b.bid - a.bid
    return a.bidTimestamp - b.bidTimestamp
  })

  const handleEditClick = (participant: Participant) => {
    setEditingParticipant(participant)
    setEditForm({
      name: participant.name,
      phone: participant.phone,
      password: participant.password
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveParticipant = () => {
    if (!editingParticipant) return

    const updatedParticipants = auctionState.participants.map(p =>
      p.id === editingParticipant.id
        ? { ...p, name: editForm.name, phone: editForm.phone, password: editForm.password }
        : p
    )

    onUpdateParticipants(updatedParticipants)
    setIsEditDialogOpen(false)
    setEditingParticipant(null)
  }

  const handleSaveAdminPassword = () => {
    if (newAdminPassword.trim()) {
      onUpdateAdminPassword(newAdminPassword)
      setIsPasswordDialogOpen(false)
      setNewAdminPassword('')
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage the auction</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Key className="mr-2" size={16} />
                  Change Admin Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Admin Password</DialogTitle>
                  <DialogDescription>Enter a new password for admin access</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">New Password</Label>
                    <Input
                      id="admin-password"
                      type="text"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Enter new admin password"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveAdminPassword} disabled={!newAdminPassword.trim()}>
                      Save Password
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <AdminSettings 
              config={auctionState.config} 
              onUpdateSettings={onUpdateSettings}
            />
            <Button variant="outline" onClick={onRestart}>
              <ArrowsClockwise className="mr-2" size={16} />
              Restart Auction
            </Button>
            <Button variant="ghost" onClick={onLogout}>
              <SignOut className="mr-2" size={16} />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Auction Status</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={auctionState.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                {auctionState.status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Time Remaining</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {auctionState.status === 'active' 
                    ? formatTimeRemaining(auctionState.config.closeTime, now)
                    : 'Closed'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Cost</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{formatCurrency(auctionState.config.totalCost)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Min Spread</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{formatCurrency(auctionState.config.minimumSpread)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Prices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-accent/10">
                <span className="font-medium">Outside Cabin</span>
                <span className="text-xl font-bold text-accent">{formatCurrency(auctionState.outsidePrice)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                <span className="font-medium">Inside Cabin</span>
                <span className="text-xl font-bold">{formatCurrency(auctionState.insidePrice)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                <span className="font-medium text-sm">Lowest Outside Bid</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(auctionState.lowestOutsideBid)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participants</span>
                <span className="font-medium flex items-center gap-1">
                  <Users size={16} />
                  {auctionState.participants.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outside Cabins</span>
                <span className="font-medium">{auctionState.config.outsideCabins ?? 4}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inside Cabins</span>
                <span className="font-medium">{auctionState.config.insideCabins ?? 2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-medium">
                  {formatCurrency(auctionState.outsidePrice * (auctionState.config.outsideCabins ?? 4) + auctionState.insidePrice * (auctionState.config.insideCabins ?? 2))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Participants</CardTitle>
            <CardDescription>Complete bid details and cabin assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Bid Amount</TableHead>
                  <TableHead>Cabin Type</TableHead>
                  <TableHead>Cabin Price</TableHead>
                  <TableHead>Lock Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedParticipants.map((participant, index) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{participant.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{participant.phone || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{participant.password || '—'}</TableCell>
                    <TableCell>{formatCurrency(participant.bid)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        participant.cabinType === 'outside' ? 'default' : 
                        participant.cabinType === 'inside' ? 'secondary' : 
                        'outline'
                      }>
                        {participant.cabinType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {participant.cabinType === 'outside' 
                        ? formatCurrency(auctionState.outsidePrice)
                        : participant.cabinType === 'inside'
                        ? formatCurrency(auctionState.insidePrice)
                        : formatCurrency(0)
                      }
                    </TableCell>
                    <TableCell>
                      {participant.isLocked ? (
                        <Badge variant="outline" className="text-xs">Locked</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unlocked</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(participant.bidTimestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(participant)}
                      >
                        <PencilSimple size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Participant</DialogTitle>
              <DialogDescription>Update participant information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Couple name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Password</Label>
                <Input
                  id="edit-password"
                  type="text"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Login password"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveParticipant}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
