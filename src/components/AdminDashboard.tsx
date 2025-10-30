import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AuctionState } from '@/lib/types'
import { formatCurrency, formatTimeRemaining } from '@/lib/auction'
import { SignOut, ArrowsClockwise, Users, Clock } from '@phosphor-icons/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AdminDashboardProps {
  auctionState: AuctionState
  onRestart: () => void
  onLogout: () => void
}

export function AdminDashboard({ auctionState, onRestart, onLogout }: AdminDashboardProps) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const sortedParticipants = [...auctionState.participants].sort((a, b) => {
    if (b.bid !== a.bid) return b.bid - a.bid
    return a.bidTimestamp - b.bidTimestamp
  })

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage the auction</p>
          </div>
          <div className="flex gap-2">
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
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inside Cabins</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-medium">
                  {formatCurrency(auctionState.outsidePrice * 4 + auctionState.insidePrice * 2)}
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
                  <TableHead>Bid Amount</TableHead>
                  <TableHead>Cabin Type</TableHead>
                  <TableHead>Cabin Price</TableHead>
                  <TableHead>Lock Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedParticipants.map((participant, index) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{participant.name}</TableCell>
                    <TableCell>{formatCurrency(participant.bid)}</TableCell>
                    <TableCell>
                      <Badge variant={participant.cabinType === 'outside' ? 'default' : 'secondary'}>
                        {participant.cabinType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(participant.cabinType === 'outside' ? auctionState.outsidePrice : auctionState.insidePrice)}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
