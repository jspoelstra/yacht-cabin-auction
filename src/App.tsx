import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import type { AuctionState, AuctionConfig, Participant } from './lib/types'
import { initializeParticipants, calculateInitialPrices, processBid, shouldExtendAuction, recalculatePrices } from './lib/auction'
import { AdminSetup } from './components/AdminSetup'
import { AdminDashboard } from './components/AdminDashboard'
import { ParticipantLogin } from './components/ParticipantLogin'
import { ParticipantDashboard } from './components/ParticipantDashboard'
import { Toaster, toast } from 'sonner'

function App() {
  const [auctionState, setAuctionState] = useKV<AuctionState | null>('auction-state', null)
  const [currentParticipantId, setCurrentParticipantId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [lastBidTimestamp, setLastBidTimestamp] = useState(0)

  useEffect(() => {
    if (!auctionState || auctionState.status !== 'active') return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastBid = now - lastBidTimestamp
      const timeUntilClose = auctionState.config.closeTime - now

      if (timeUntilClose <= 0 && timeSinceLastBid >= 10 * 60 * 1000) {
        setAuctionState((current) => {
          if (!current) return null
          return { ...current, status: 'closed' as const }
        })
        toast.success('Auction has closed!')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [auctionState, lastBidTimestamp, setAuctionState])

  const handleStartAuction = (config: AuctionConfig) => {
    const participants = initializeParticipants(config)
    const { outsidePrice, insidePrice } = calculateInitialPrices(config)
    const outsideHolders = participants.filter(p => p.cabinType === 'outside')
    const lowestOutsideBid = Math.min(...outsideHolders.map(p => p.bid))

    const newState: AuctionState = {
      config,
      participants,
      outsidePrice,
      insidePrice,
      status: 'active',
      lowestOutsideBid,
      adminPassword: 'Spoelstra'
    }

    setAuctionState(newState)
    setLastBidTimestamp(Date.now())
    toast.success('Auction started!')
  }

  const handleSubmitBid = (participantId: string, amount: number) => {
    if (!auctionState || auctionState.status !== 'active') return

    const participant = auctionState.participants.find(p => p.id === participantId)
    if (!participant) return

    if (participant.isLocked) {
      toast.error('Unable to change bid - please wait for another participant to bid')
      return
    }

    const now = Date.now()
    const result = processBid(auctionState.participants, participantId, amount, auctionState.config)
    const newCloseTime = shouldExtendAuction(auctionState.config.closeTime, now)

    setAuctionState((current) => {
      if (!current) return null
      return {
        ...current,
        participants: result.participants,
        outsidePrice: result.outsidePrice,
        insidePrice: result.insidePrice,
        lowestOutsideBid: result.lowestOutsideBid,
        config: {
          ...current.config,
          closeTime: newCloseTime
        }
      }
    })

    setLastBidTimestamp(now)
    toast.info('Bid submitted - prices updated')
  }

  const handleRestartAuction = () => {
    if (!auctionState) return
    
    const participants = initializeParticipants(auctionState.config)
    const { outsidePrice, insidePrice } = calculateInitialPrices(auctionState.config)
    const outsideHolders = participants.filter(p => p.cabinType === 'outside')
    const lowestOutsideBid = Math.min(...outsideHolders.map(p => p.bid))

    setAuctionState((current) => {
      if (!current) return null
      return {
        ...current,
        participants,
        outsidePrice,
        insidePrice,
        status: 'active' as const,
        lowestOutsideBid
      }
    })
    
    setLastBidTimestamp(Date.now())
    toast.success('Auction restarted with new random assignments')
  }

  const handleAdminLogin = (password: string) => {
    if (!auctionState) {
      setIsAdmin(true)
      return
    }

    if (password === auctionState.adminPassword) {
      setIsAdmin(true)
    } else {
      toast.error('Incorrect admin password')
    }
  }

  const handleUpdateSettings = (newConfig: AuctionConfig) => {
    if (!auctionState) return

    setAuctionState((current) => {
      if (!current) return null

      const prices = recalculatePrices(current.participants, newConfig)

      return {
        ...current,
        config: newConfig,
        outsidePrice: prices.outsidePrice,
        insidePrice: prices.insidePrice,
        lowestOutsideBid: prices.lowestOutsideBid
      }
    })

    toast.success('Settings updated - prices recalculated')
  }

  const handleUpdateParticipants = (updatedParticipants: Participant[]) => {
    if (!auctionState) return

    setAuctionState((current) => {
      if (!current) return null
      return {
        ...current,
        participants: updatedParticipants
      }
    })

    toast.success('Participant information updated')
  }

  const handleUpdateAdminPassword = (newPassword: string) => {
    if (!auctionState) return

    setAuctionState((current) => {
      if (!current) return null
      return {
        ...current,
        adminPassword: newPassword
      }
    })

    toast.success('Admin password updated')
  }

  if (!auctionState || auctionState.status === 'setup') {
    if (isAdmin) {
      return (
        <div className="min-h-screen bg-background">
          <Toaster position="top-center" richColors />
          <AdminSetup onStart={handleStartAuction} onBack={() => setIsAdmin(false)} />
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" richColors />
        <ParticipantLogin onAdminLogin={handleAdminLogin} />
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" richColors />
        <AdminDashboard 
          auctionState={auctionState} 
          onRestart={handleRestartAuction}
          onLogout={() => setIsAdmin(false)}
          onUpdateSettings={handleUpdateSettings}
          onUpdateParticipants={handleUpdateParticipants}
          onUpdateAdminPassword={handleUpdateAdminPassword}
        />
      </div>
    )
  }

  if (!currentParticipantId) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" richColors />
        <ParticipantLogin 
          participants={auctionState.participants}
          onLogin={setCurrentParticipantId}
          onAdminLogin={handleAdminLogin}
          adminPassword={auctionState.adminPassword}
        />
      </div>
    )
  }

  const participant = auctionState.participants.find(p => p.id === currentParticipantId)
  if (!participant) {
    setCurrentParticipantId(null)
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <ParticipantDashboard
        participant={participant}
        auctionState={auctionState}
        onSubmitBid={handleSubmitBid}
        onLogout={() => setCurrentParticipantId(null)}
      />
    </div>
  )
}

export default App