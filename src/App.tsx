import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import type { AuctionState, AuctionConfig, Participant } from './lib/types'
import { initializeParticipants, calculateInitialPrices, processBid, shouldExtendAuction, recalculatePrices, generateParticipantNames, shuffleArray } from './lib/auction'
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
    if (auctionState && (!auctionState.config.outsideCabins || !auctionState.config.insideCabins)) {
      const outsideCount = auctionState.participants.filter(p => p.cabinType === 'outside').length
      const insideCount = auctionState.participants.filter(p => p.cabinType === 'inside').length
      
      setAuctionState((current) => {
        if (!current) return null
        return {
          ...current,
          config: {
            ...current.config,
            outsideCabins: outsideCount > 0 ? outsideCount : 4,
            insideCabins: insideCount > 0 ? insideCount : 2
          }
        }
      })
    }
  }, [])

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

  useEffect(() => {
    if (!auctionState || !currentParticipantId) return
    
    const participant = auctionState.participants.find(p => p.id === currentParticipantId)
    if (!participant) {
      setCurrentParticipantId(null)
    }
  }, [auctionState, currentParticipantId])

  useEffect(() => {
    if (!auctionState || !currentParticipantId) return
    
    const participant = auctionState.participants.find(p => p.id === currentParticipantId)
    if (!participant) {
      setCurrentParticipantId(null)
    }
  }, [auctionState, currentParticipantId])

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
      adminPassword: 'Spoelstra',
      isAuctionLocked: true
    }

    setAuctionState(newState)
    setLastBidTimestamp(Date.now())
    toast.success('Auction started!')
  }

  const handleSubmitBid = (participantId: string, amount: number) => {
    if (!auctionState || auctionState.status !== 'active') return

    if (auctionState.isAuctionLocked) {
      toast.error('Auction is locked - admin needs to start bidding')
      return
    }

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

  const handleToggleLock = () => {
    if (!auctionState) return
    
    setAuctionState((current) => {
      if (!current) return null
      return {
        ...current,
        isAuctionLocked: !current.isAuctionLocked
      }
    })
    
    toast.success(auctionState.isAuctionLocked ? 'Auction unlocked - participants can bid' : 'Auction locked - participants cannot bid')
  }

  const handleResetAuction = () => {
    if (!auctionState) return
    
    const { outsidePrice, insidePrice } = calculateInitialPrices(auctionState.config)
    const { outsideCabins, insideCabins } = auctionState.config
    
    const cabinAssignments: ('outside' | 'inside')[] = [
      ...Array(outsideCabins).fill('outside'),
      ...Array(insideCabins).fill('inside')
    ]
    
    const shuffledCabins = shuffleArray(cabinAssignments)
    
    const resetParticipants = auctionState.participants.map((p, index) => ({
      ...p,
      bid: index < shuffledCabins.length 
        ? (shuffledCabins[index] === 'outside' ? outsidePrice : insidePrice)
        : 0,
      bidTimestamp: Date.now(),
      cabinType: index < shuffledCabins.length ? shuffledCabins[index] : 'none' as const,
      isLocked: false
    }))

    const outsideHolders = resetParticipants.filter(p => p.cabinType === 'outside')
    const lowestOutsideBid = outsideHolders.length > 0 ? Math.min(...outsideHolders.map(p => p.bid)) : outsidePrice

    const newCloseTime = Date.now() + 60 * 60 * 1000

    setAuctionState((current) => {
      if (!current) return null
      return {
        ...current,
        participants: resetParticipants,
        outsidePrice,
        insidePrice,
        lowestOutsideBid,
        status: 'active',
        isAuctionLocked: true,
        config: {
          ...current.config,
          closeTime: newCloseTime
        }
      }
    })
    
    setLastBidTimestamp(Date.now())
    toast.success('Auction reset - new random cabin assignments created')
  }

  const handleClearAuction = () => {
    setAuctionState(null)
    setCurrentParticipantId(null)
    setIsAdmin(false)
    toast.success('Auction cleared - all data removed')
  }

  const handleAdminLogin = (password: string) => {
    const correctPassword = auctionState?.adminPassword || 'Spoelstra'
    
    if (password === correctPassword) {
      setIsAdmin(true)
    } else {
      toast.error('Incorrect admin password')
    }
  }

  const handleUpdateSettings = (newConfig: AuctionConfig) => {
    if (!auctionState) return

    setAuctionState((current) => {
      if (!current) return null

      const oldTotalParticipants = current.config.outsideCabins + current.config.insideCabins
      const newTotalParticipants = newConfig.outsideCabins + newConfig.insideCabins
      let updatedParticipants = [...current.participants]

      if (newTotalParticipants > oldTotalParticipants) {
        const additionalCount = newTotalParticipants - oldTotalParticipants
        const names = generateParticipantNames(newTotalParticipants)
        const { outsidePrice, insidePrice } = calculateInitialPrices(newConfig)
        
        for (let i = 0; i < additionalCount; i++) {
          const newId = `participant-${updatedParticipants.length}`
          const newIndex = updatedParticipants.length
          updatedParticipants.push({
            id: newId,
            name: names[newIndex],
            phone: '',
            password: '',
            bid: 0,
            bidTimestamp: Date.now(),
            cabinType: 'none',
            isLocked: false
          })
        }
      }

      const sorted = [...updatedParticipants].sort((a, b) => {
        if (b.bid !== a.bid) return b.bid - a.bid
        return a.bidTimestamp - b.bidTimestamp
      })

      const outsideHolders = sorted.slice(0, newConfig.outsideCabins)
      const insideHolders = sorted.slice(newConfig.outsideCabins, newConfig.outsideCabins + newConfig.insideCabins)
      const noCabinHolders = sorted.slice(newConfig.outsideCabins + newConfig.insideCabins)

      const finalParticipants = updatedParticipants.map(p => {
        if (outsideHolders.find(oh => oh.id === p.id)) {
          return { ...p, cabinType: 'outside' as const }
        } else if (insideHolders.find(ih => ih.id === p.id)) {
          return { ...p, cabinType: 'inside' as const }
        } else {
          return { ...p, cabinType: 'none' as const }
        }
      })

      const prices = recalculatePrices(finalParticipants, newConfig)

      return {
        ...current,
        config: newConfig,
        participants: finalParticipants,
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
          onToggleLock={handleToggleLock}
          onReset={handleResetAuction}
          onClear={handleClearAuction}
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