import type { Participant, AuctionConfig } from './types'

export function generateParticipantNames(count: number): string[] {
  const names: string[] = []
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  
  for (let i = 0; i < count; i++) {
    names.push(`Couple ${letters[i % 26]}${i >= 26 ? Math.floor(i / 26) : ''}`)
  }
  
  return names
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculateInitialPrices(config: AuctionConfig): {
  outsidePrice: number
  insidePrice: number
} {
  const { totalCost, minimumSpread, outsideCabins, insideCabins } = config
  const outsidePrice = Math.round((totalCost + insideCabins * minimumSpread) / (outsideCabins + insideCabins))
  const insidePrice = Math.round(outsidePrice - minimumSpread)
  
  return { outsidePrice, insidePrice }
}

export function initializeParticipants(config: AuctionConfig): Participant[] {
  const { outsideCabins, insideCabins } = config
  const totalParticipants = outsideCabins + insideCabins
  const names = generateParticipantNames(totalParticipants)
  
  const cabinAssignments: ('outside' | 'inside')[] = [
    ...Array(outsideCabins).fill('outside'),
    ...Array(insideCabins).fill('inside')
  ]
  
  const shuffledCabins = shuffleArray(cabinAssignments)
  const { outsidePrice, insidePrice } = calculateInitialPrices(config)
  
  return names.map((name, index) => ({
    id: `participant-${index}`,
    name,
    phone: '',
    password: '',
    bid: shuffledCabins[index] === 'outside' ? outsidePrice : insidePrice,
    bidTimestamp: Date.now(),
    cabinType: shuffledCabins[index],
    isLocked: true
  }))
}

export function processBid(
  participants: Participant[],
  participantId: string,
  bidAmount: number,
  config: AuctionConfig
): {
  participants: Participant[]
  outsidePrice: number
  insidePrice: number
  lowestOutsideBid: number
} {
  const now = Date.now()
  const roundedBidAmount = Math.round(bidAmount)
  const { outsideCabins, insideCabins } = config
  
  const updatedParticipants = participants.map(p => ({
    ...p,
    isLocked: p.id === participantId ? true : false,
    bid: p.id === participantId ? roundedBidAmount : p.bid,
    bidTimestamp: p.id === participantId ? now : p.bidTimestamp
  }))
  
  const sorted = [...updatedParticipants].sort((a, b) => {
    if (b.bid !== a.bid) return b.bid - a.bid
    return a.bidTimestamp - b.bidTimestamp
  })
  
  const outsideHolders = sorted.slice(0, outsideCabins)
  const insideHolders = sorted.slice(outsideCabins, outsideCabins + insideCabins)
  const noCabinHolders = sorted.slice(outsideCabins + insideCabins)
  
  const lowestOutsideBid = outsideHolders.length > 0 ? Math.min(...outsideHolders.map(p => p.bid)) : 0
  const oFloor = Math.round((config.totalCost + insideCabins * config.minimumSpread) / (outsideCabins + insideCabins))
  const outsidePrice = Math.max(lowestOutsideBid, oFloor)
  const insidePrice = Math.round((config.totalCost - outsideCabins * outsidePrice) / insideCabins)
  
  const finalParticipants = updatedParticipants.map(p => {
    if (outsideHolders.find(oh => oh.id === p.id)) {
      return { ...p, cabinType: 'outside' as const }
    } else if (insideHolders.find(ih => ih.id === p.id)) {
      return { ...p, cabinType: 'inside' as const }
    } else {
      return { ...p, cabinType: 'none' as const }
    }
  })
  
  return {
    participants: finalParticipants,
    outsidePrice,
    insidePrice,
    lowestOutsideBid
  }
}

export function shouldExtendAuction(closeTime: number, bidTimestamp: number): number {
  const timeRemaining = closeTime - bidTimestamp
  const tenMinutes = 10 * 60 * 1000
  
  if (timeRemaining < tenMinutes) {
    return bidTimestamp + tenMinutes
  }
  
  return closeTime
}

export function formatCurrency(amount: number): string {
  const roundedAmount = Math.round(amount)
  const absAmount = Math.abs(roundedAmount)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(absAmount)
  
  return roundedAmount < 0 ? `-${formatted}` : formatted
}

export function formatTimeRemaining(closeTime: number, now: number): string {
  const diff = Math.max(0, closeTime - now)
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  
  return `${minutes}m ${seconds}s`
}

export function recalculatePrices(
  participants: Participant[],
  config: AuctionConfig
): {
  outsidePrice: number
  insidePrice: number
  lowestOutsideBid: number
} {
  const { outsideCabins, insideCabins } = config
  
  const sorted = [...participants].sort((a, b) => {
    if (b.bid !== a.bid) return b.bid - a.bid
    return a.bidTimestamp - b.bidTimestamp
  })
  
  const outsideHolders = sorted.slice(0, outsideCabins)
  
  const lowestOutsideBid = outsideHolders.length > 0 ? Math.min(...outsideHolders.map(p => p.bid)) : 0
  const oFloor = Math.round((config.totalCost + insideCabins * config.minimumSpread) / (outsideCabins + insideCabins))
  const outsidePrice = Math.max(lowestOutsideBid, oFloor)
  const insidePrice = Math.round((config.totalCost - outsideCabins * outsidePrice) / insideCabins)
  
  return {
    outsidePrice,
    insidePrice,
    lowestOutsideBid
  }
}
