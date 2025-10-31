import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Participant } from '@/lib/types'
import { Anchor, UserCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ParticipantLoginProps {
  participants?: Participant[]
  onLogin?: (participantId: string) => void
  onAdminLogin: (password: string) => void
  adminPassword?: string
}

export function ParticipantLogin({ participants, onLogin, onAdminLogin, adminPassword }: ParticipantLoginProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<string>('')
  const [participantPassword, setParticipantPassword] = useState<string>('')
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  const handleParticipantLogin = () => {
    if (!selectedParticipant || !onLogin) return

    const participant = participants?.find(p => p.id === selectedParticipant)
    if (!participant) return

    if (participant.password && participant.password !== participantPassword) {
      toast.error('Incorrect password')
      return
    }

    onLogin(selectedParticipant)
  }

  const handleAdminLogin = () => {
    if (!adminPassword) {
      onAdminLogin(adminPasswordInput)
      return
    }

    if (adminPasswordInput !== adminPassword) {
      toast.error('Incorrect admin password')
      return
    }

    onAdminLogin(adminPasswordInput)
  }

  const selectedParticipantData = participants?.find(p => p.id === selectedParticipant)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Anchor size={40} weight="duotone" className="text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Yacht Cabin Auction</h1>
          <p className="text-muted-foreground">Fair price discovery for cabin assignments</p>
        </div>

        {!showAdminLogin ? (
          <Card>
            <CardHeader>
              <CardTitle>Participant Login</CardTitle>
              <CardDescription>
                {participants ? 'Select your name and enter your password' : 'The auction has not started yet'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {participants && participants.length > 0 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="participant-select">Participant</Label>
                    <Select value={selectedParticipant} onValueChange={(value) => {
                      setSelectedParticipant(value)
                      setParticipantPassword('')
                    }}>
                      <SelectTrigger id="participant-select">
                        <SelectValue placeholder="Select your name" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedParticipantData?.password && (
                    <div className="space-y-2">
                      <Label htmlFor="participant-password">Password</Label>
                      <Input
                        id="participant-password"
                        type="password"
                        value={participantPassword}
                        onChange={(e) => setParticipantPassword(e.target.value)}
                        placeholder="Enter your password"
                      />
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={handleParticipantLogin}
                    disabled={!selectedParticipant || (!!selectedParticipantData?.password && !participantPassword)}
                  >
                    <UserCircle className="mr-2" size={20} />
                    Login as Participant
                  </Button>
                </>
              )}
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowAdminLogin(true)}
              >
                Admin Access
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>Enter the admin password to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleAdminLogin}
                disabled={!adminPasswordInput}
              >
                Login as Admin
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowAdminLogin(false)
                  setAdminPasswordInput('')
                }}
              >
                Back to Participant Login
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
