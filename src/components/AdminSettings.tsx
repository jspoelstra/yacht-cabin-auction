import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gear } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AuctionConfig } from '@/lib/types'

interface AdminSettingsProps {
  config: AuctionConfig
  onUpdateSettings: (config: AuctionConfig) => void
}

export function AdminSettings({ config, onUpdateSettings }: AdminSettingsProps) {
  const [open, setOpen] = useState(false)
  const [totalCost, setTotalCost] = useState(config.totalCost.toString())
  const [minimumSpread, setMinimumSpread] = useState(config.minimumSpread.toString())
  const [minutesUntilClose, setMinutesUntilClose] = useState('')
  const [outsideCabins, setOutsideCabins] = useState(config.outsideCabins.toString())
  const [insideCabins, setInsideCabins] = useState(config.insideCabins.toString())

  const handleSave = () => {
    const parsedTotalCost = Math.round(parseFloat(totalCost))
    const parsedMinSpread = Math.round(parseFloat(minimumSpread))
    const parsedMinutes = minutesUntilClose ? parseFloat(minutesUntilClose) : null
    const parsedOutsideCabins = Math.round(parseFloat(outsideCabins))
    const parsedInsideCabins = Math.round(parseFloat(insideCabins))

    if (isNaN(parsedTotalCost) || parsedTotalCost <= 0) {
      toast.error('Total cost must be a positive number')
      return
    }

    if (isNaN(parsedMinSpread)) {
      toast.error('Minimum spread must be a valid number')
      return
    }

    if (parsedMinutes !== null && (isNaN(parsedMinutes) || parsedMinutes <= 0)) {
      toast.error('Minutes until close must be a positive number')
      return
    }

    if (parsedOutsideCabins < 1) {
      toast.error('Must have at least 1 outside cabin')
      return
    }

    if (parsedInsideCabins < 1) {
      toast.error('Must have at least 1 inside cabin')
      return
    }

    const newCloseTime = parsedMinutes !== null 
      ? Date.now() + parsedMinutes * 60 * 1000
      : config.closeTime

    const newConfig: AuctionConfig = {
      totalCost: parsedTotalCost,
      minimumSpread: parsedMinSpread,
      closeTime: newCloseTime,
      outsideCabins: parsedOutsideCabins,
      insideCabins: parsedInsideCabins
    }

    onUpdateSettings(newConfig)
    setOpen(false)
    toast.success('Settings updated successfully')
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setTotalCost(config.totalCost.toString())
      setMinimumSpread(config.minimumSpread.toString())
      setMinutesUntilClose('')
      setOutsideCabins(config.outsideCabins.toString())
      setInsideCabins(config.insideCabins.toString())
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Gear className="mr-2" size={16} />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Auction Settings</DialogTitle>
          <DialogDescription>
            Update auction parameters. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="outside-cabins">Outside Cabins</Label>
              <Input
                id="outside-cabins"
                type="number"
                step="1"
                min="1"
                value={outsideCabins}
                onChange={(e) => setOutsideCabins(e.target.value)}
                placeholder="4"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 1 outside cabin
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inside-cabins">Inside Cabins</Label>
              <Input
                id="inside-cabins"
                type="number"
                step="1"
                min="1"
                value={insideCabins}
                onChange={(e) => setInsideCabins(e.target.value)}
                placeholder="2"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 1 inside cabin
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="total-cost">Total Cost ($)</Label>
            <Input
              id="total-cost"
              type="number"
              step="1"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="Enter total cost"
            />
            <p className="text-xs text-muted-foreground">
              The total cost to be divided among all cabins (integer dollars)
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="min-spread">Minimum Spread ($)</Label>
            <Input
              id="min-spread"
              type="number"
              step="1"
              value={minimumSpread}
              onChange={(e) => setMinimumSpread(e.target.value)}
              placeholder="Enter minimum spread"
            />
            <p className="text-xs text-muted-foreground">
              Minimum price difference between outside and inside cabins (integer dollars)
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="close-time">Minutes Until Close</Label>
            <Input
              id="close-time"
              type="number"
              step="1"
              value={minutesUntilClose}
              onChange={(e) => setMinutesUntilClose(e.target.value)}
              placeholder="Leave empty to keep current time"
            />
            <p className="text-xs text-muted-foreground">
              Set a new auction end time (optional)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
