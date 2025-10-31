import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Participant, AuctionState } from '@/lib/types'
import { formatCurrency, formatTimeRemaining } from '@/lib/auction'
import { SignOut, Lock, LockOpen, Anchor, Clock, TrendUp } from '@phosphor-icons/react'
import { useAuctionNotifications } from '@/hooks/use-auction-notifications'

interface ParticipantDashboardProps {
  participant: Participant
  auctionState: AuctionState
  onSubmitBid: (participantId: string, amount: number) => void
  onLogout: () => void
}

export function ParticipantDashboard({ 
  participant, 
  auctionState, 
  onSubmitBid, 
  onLogout 
}: ParticipantDashboardProps) {
  const [bidAmount, setBidAmount] = useState(participant.bid.toString())
  const [now, setNow] = useState(Date.now())
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  )

  useAuctionNotifications(participant, auctionState)

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    }
  }

  const handleSubmit = () => {
    const amount = Math.round(parseFloat(bidAmount))
    if (amount > 0 && !isNaN(amount)) {
      onSubmitBid(participant.id, amount)
    }
  }

  const isClosed = auctionState.status === 'closed'
  const myPrice = participant.cabinType === 'outside' 
    ? auctionState.outsidePrice 
    : participant.cabinType === 'inside'
    ? auctionState.insidePrice
    : 0

  const isAtRisk = participant.cabinType === 'outside' && 
    participant.bid <= auctionState.lowestOutsideBid &&
    participant.bid === auctionState.lowestOutsideBid

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Anchor size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{participant.name}</h1>
              <p className="text-sm text-muted-foreground">Yacht Cabin Auction</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <SignOut className="mr-2" size={16} />
            Logout
          </Button>
        </div>

        {isClosed && (
          <Alert className="border-primary bg-primary/5">
            <AlertDescription className="text-center font-semibold">
              🎉 AUCTION CLOSED - Final cabin assignment below
            </AlertDescription>
          </Alert>
        )}

        {!isClosed && isAtRisk && (
          <Alert variant="destructive">
            <AlertDescription>
              ⚠️ You are at risk! Your bid is the lowest among outside cabin holders. Higher bids may bump you to an inside cabin.
            </AlertDescription>
          </Alert>
        )}

        {!isClosed && notificationPermission !== 'granted' && (
          <Alert className="border-accent bg-accent/5">
            <AlertDescription className="flex items-center justify-between">
              <span>🔔 Enable browser notifications to get instant alerts when prices change</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={requestNotificationPermission}
                className="ml-4"
              >
                Enable Notifications
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={participant.cabinType === 'outside' ? 'border-accent shadow-accent/20' : participant.cabinType === 'none' ? 'border-destructive/50' : ''}>
            <CardHeader>
              <CardDescription>Your Cabin Assignment</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Badge 
                  variant={participant.cabinType === 'outside' ? 'default' : participant.cabinType === 'inside' ? 'secondary' : 'outline'}
                  className="text-lg px-4 py-2"
                >
                  {participant.cabinType === 'outside' 
                    ? '☀️ Outside Cabin' 
                    : participant.cabinType === 'inside'
                    ? '🌙 Inside Cabin'
                    : '❌ No Cabin'
                  }
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your price:</span>
                  <span className="font-bold text-xl">{formatCurrency(myPrice)}</span>
                </div>
                {participant.cabinType === 'none' && (
                  <p className="text-xs text-destructive mt-2">
                    Increase your bid to secure a cabin
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Time Remaining</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Clock size={32} weight="duotone" />
                {isClosed 
                  ? 'Closed' 
                  : formatTimeRemaining(auctionState.config.closeTime, now)
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Auction extends by 10 minutes with each new bid
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Market Prices</CardTitle>
            <CardDescription>Live cabin pricing based on all bids</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Outside Cabin Price</span>
                  <Badge variant="outline" className="text-xs">{auctionState.config.outsideCabins} available</Badge>
                </div>
                <p className="text-2xl font-bold text-accent">{formatCurrency(auctionState.outsidePrice)}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Inside Cabin Price</span>
                  <Badge variant="outline" className="text-xs">{auctionState.config.insideCabins} available</Badge>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(auctionState.insidePrice)}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendUp size={16} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Lowest Outside Bid</span>
              </div>
              <p className="text-xl font-bold text-primary">{formatCurrency(auctionState.lowestOutsideBid)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Bid above this to secure an outside cabin
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit Your Bid</CardTitle>
            <CardDescription>
              {participant.isLocked 
                ? 'You are locked until another participant bids' 
                : 'Enter your maximum willingness to pay'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bid-amount">Bid Amount ($)</Label>
              <Input
                id="bid-amount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={isClosed || participant.isLocked}
                placeholder="Enter amount"
                min="0"
                step="1"
              />
              <p className="text-xs text-muted-foreground">Integer dollar amounts only</p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              {participant.isLocked ? (
                <>
                  <Lock size={20} className="text-destructive" />
                  <span className="text-sm font-medium">Bid locked - waiting for other participants</span>
                </>
              ) : (
                <>
                  <LockOpen size={20} className="text-green-600" />
                  <span className="text-sm font-medium">You can submit a new bid</span>
                </>
              )}
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleSubmit}
              disabled={isClosed || participant.isLocked || parseFloat(bidAmount) <= 0 || isNaN(parseFloat(bidAmount))}
            >
              Submit Bid
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Your bid is your maximum willingness to pay</p>
              <p>• Higher bids get priority for outside cabins</p>
              <p>• Your actual price depends on all participants' bids</p>
              <p>• You may pay less than your bid amount</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Bid Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Current Bid</span>
              <span className="font-bold">{formatCurrency(participant.bid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Bid Time</span>
              <span className="font-medium">{new Date(participant.bidTimestamp).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
