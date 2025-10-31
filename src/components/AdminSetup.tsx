import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AuctionConfig } from '@/lib/types'
import { ArrowLeft, Anchor } from '@phosphor-icons/react'

interface AdminSetupProps {
  onStart: (config: AuctionConfig) => void
  onBack: () => void
}

export function AdminSetup({ onStart, onBack }: AdminSetupProps) {
  const [totalCost, setTotalCost] = useState('24000')
  const [minimumSpread, setMinimumSpread] = useState('1000')
  const [durationHours, setDurationHours] = useState('1')
  const [outsideCabins, setOutsideCabins] = useState('4')
  const [insideCabins, setInsideCabins] = useState('2')

  const handleStart = () => {
    const config: AuctionConfig = {
      totalCost: Math.round(parseFloat(totalCost)),
      minimumSpread: Math.round(parseFloat(minimumSpread)),
      closeTime: Date.now() + parseFloat(durationHours) * 60 * 60 * 1000,
      outsideCabins: Math.round(parseFloat(outsideCabins)),
      insideCabins: Math.round(parseFloat(insideCabins))
    }
    onStart(config)
  }

  const isValid = 
    parseFloat(totalCost) > 0 && 
    !isNaN(parseFloat(minimumSpread)) && 
    parseFloat(durationHours) > 0 &&
    parseFloat(outsideCabins) >= 1 &&
    parseFloat(insideCabins) >= 1

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Anchor size={40} weight="duotone" className="text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Admin Setup</h1>
          <p className="text-muted-foreground">Configure the auction parameters</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Auction Configuration</CardTitle>
            <CardDescription>
              Set the total cost, minimum price spread, and auction duration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outside-cabins">Outside Cabins</Label>
                <Input
                  id="outside-cabins"
                  type="number"
                  value={outsideCabins}
                  onChange={(e) => setOutsideCabins(e.target.value)}
                  placeholder="4"
                  min="1"
                  step="1"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 1 outside cabin
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inside-cabins">Inside Cabins</Label>
                <Input
                  id="inside-cabins"
                  type="number"
                  value={insideCabins}
                  onChange={(e) => setInsideCabins(e.target.value)}
                  placeholder="2"
                  min="1"
                  step="1"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 1 inside cabin
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-cost">Total Charter Cost ($)</Label>
              <Input
                id="total-cost"
                type="number"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="24000"
                min="0"
                step="1"
              />
              <p className="text-xs text-muted-foreground">
                Fixed total cost to be divided among all cabins (integer dollars)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum-spread">Minimum Price Spread ($)</Label>
              <Input
                id="minimum-spread"
                type="number"
                value={minimumSpread}
                onChange={(e) => setMinimumSpread(e.target.value)}
                placeholder="1000"
                step="1"
              />
              <p className="text-xs text-muted-foreground">
                Minimum difference between outside and inside cabin prices (integer dollars, can be negative)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Initial Auction Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                placeholder="24"
                min="0.1"
                step="1"
              />
              <p className="text-xs text-muted-foreground">
                Auction will extend by 10 minutes with each bid if less than 10 minutes remain
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                className="w-full" 
                onClick={handleStart}
                disabled={!isValid}
                size="lg"
              >
                Start Auction
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={onBack}
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
