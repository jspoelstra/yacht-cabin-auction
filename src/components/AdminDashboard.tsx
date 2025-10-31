import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AuctionState, AuctionConfig, Participant } from '@/lib/types'
import { formatCurrency, formatTimeRemaining } from '@/lib/auction'
import { SignOut, ArrowsClockwise, Users, Clock, PencilSimple, Key, Trash, Plus, Play, Pause, LockOpen, Eraser } from '@phosphor-icons/react'
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
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AdminDashboardProps {
  auctionState: AuctionState
  onToggleLock: () => void
  onReset: () => void
  onClear: () => void
  onLogout: () => void
  onUpdateSettings: (config: AuctionConfig) => void
  onUpdateParticipants: (participants: Participant[]) => void
  onUpdateAdminPassword: (newPassword: string) => void
}

export function AdminDashboard({ auctionState, onToggleLock, onReset, onClear, onLogout, onUpdateSettings, onUpdateParticipants, onUpdateAdminPassword }: AdminDashboardProps) {
  const [now, setNow] = useState(Date.now())
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', password: '' })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', phone: '', password: '' })
  const [deleteParticipantId, setDeleteParticipantId] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

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

  const handleAddParticipant = () => {
    if (!addForm.name.trim()) {
      toast.error('Participant name is required')
      return
    }

    const newParticipant: Participant = {
      id: `participant-${Date.now()}`,
      name: addForm.name,
      phone: addForm.phone,
      password: addForm.password,
      bid: 0,
      bidTimestamp: Date.now(),
      cabinType: 'none',
      isLocked: false
    }

    const updatedParticipants = [...auctionState.participants, newParticipant]
    onUpdateParticipants(updatedParticipants)
    setIsAddDialogOpen(false)
    setAddForm({ name: '', phone: '', password: '' })
    toast.success('Participant added successfully')
  }

  const handleDeleteClick = (participantId: string) => {
    const participant = auctionState.participants.find(p => p.id === participantId)
    if (!participant) return

    if (participant.cabinType !== 'none') {
      toast.error('Cannot delete participant with assigned cabin')
      return
    }

    setDeleteParticipantId(participantId)
  }

  const handleConfirmDelete = () => {
    if (!deleteParticipantId) return

    const updatedParticipants = auctionState.participants.filter(p => p.id !== deleteParticipantId)
    onUpdateParticipants(updatedParticipants)
    setDeleteParticipantId(null)
    toast.success('Participant deleted successfully')
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
            <Button 
              variant={auctionState.isAuctionLocked ? "default" : "outline"}
              onClick={onToggleLock}
            >
              {auctionState.isAuctionLocked ? (
                <>
                  <Play className="mr-2" size={16} />
                  Start Bidding
                </>
              ) : (
                <>
                  <Pause className="mr-2" size={16} />
                  Lock Bidding
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowResetConfirm(true)}>
              <ArrowsClockwise className="mr-2" size={16} />
              Reset Auction
            </Button>
            <Button variant="outline" onClick={() => setShowClearConfirm(true)}>
              <Eraser className="mr-2" size={16} />
              Clear All
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
              <CardDescription>Bidding Status</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={auctionState.isAuctionLocked ? 'outline' : 'default'} className="text-sm">
                {auctionState.isAuctionLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Participants</CardTitle>
                <CardDescription>Complete bid details and cabin assignments</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2" size={16} />
                    Add Participant
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Participant</DialogTitle>
                    <DialogDescription>Create a new participant in the auction</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-name">Name *</Label>
                      <Input
                        id="add-name"
                        value={addForm.name}
                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        placeholder="Couple name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-phone">Phone Number</Label>
                      <Input
                        id="add-phone"
                        value={addForm.phone}
                        onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-password">Password</Label>
                      <Input
                        id="add-password"
                        type="text"
                        value={addForm.password}
                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                        placeholder="Login password"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddParticipant}>
                        Add Participant
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(participant)}
                        >
                          <PencilSimple size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(participant.id)}
                          disabled={participant.cabinType !== 'none'}
                        >
                          <Trash size={16} className={participant.cabinType !== 'none' ? 'text-muted-foreground' : 'text-destructive'} />
                        </Button>
                      </div>
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

        <AlertDialog open={deleteParticipantId !== null} onOpenChange={(open) => !open && setDeleteParticipantId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Participant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this participant? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Auction</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset all bids and create new random cabin assignments, but will keep participant information. Prices will return to defaults. Are you sure?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { onReset(); setShowResetConfirm(false); }}>
                Reset Auction
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Data</AlertDialogTitle>
              <AlertDialogDescription>
                This will completely clear the auction and all participant data, returning to initial setup. This action cannot be undone. Are you sure?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { onClear(); setShowClearConfirm(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Clear All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
