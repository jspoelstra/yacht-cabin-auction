import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Participant } from '@/lib/types'
import { Anchor, UserCircle } from '@phosphor-icons/react'

interface ParticipantLoginProps {
  participants?: Participant[]
  onLogin?: (participantId: string) => void
  onAdminLogin: () => void
}

export function ParticipantLogin({ participants, onLogin, onAdminLogin }: ParticipantLoginProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<string>('')

  const handleLogin = () => {
    if (selectedParticipant && onLogin) {
      onLogin(selectedParticipant)
    }
  }

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

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              {participants ? 'Select your participant ID to continue' : 'The auction has not started yet'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {participants && participants.length > 0 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Participant</label>
                  <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your ID" />
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
                <Button 
                  className="w-full" 
                  onClick={handleLogin}
                  disabled={!selectedParticipant}
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
              onClick={onAdminLogin}
            >
              Admin Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
