import type { Participant, AuctionConfig } from './types'

export function generateParticipantNames(): string[] {
  return [
    'Couple A',
    'Couple B',
    'Couple C',
    'Couple D',
    'Couple E',
    'Couple F'
  ]
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
  const { totalCost, minimumSpread } = config
  const outsidePrice = (totalCost + 2 * minimumSpread) / 6
  const insidePrice = outsidePrice - minimumSpread
  
  return { outsidePrice, insidePrice }
}

export function initializeParticipants(config: AuctionConfig): Participant[] {
  const names = generateParticipantNames()
  const cabinAssignments: ('outside' | 'inside')[] = [
    'outside', 'outside', 'outside', 'outside',
    'inside', 'inside'
  ]
  
  const shuffledCabins = shuffleArray(cabinAssignments)
  const { outsidePrice, insidePrice } = calculateInitialPrices(config)
  
  return names.map((name, index) => ({
    id: `participant-${index}`,
    name,
    bid: shuffledCabins[index] === 'outside' ? outsidePrice : insidePrice,
    bidTimestamp: Date.now(),
    cabinType: shuffledCabins[index],
    isLocked: false
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
  
  const updatedParticipants = participants.map(p => ({
    ...p,
    isLocked: p.id === participantId ? true : false,
    bid: p.id === participantId ? bidAmount : p.bid,
    bidTimestamp: p.id === participantId ? now : p.bidTimestamp
  }))
  
  const sorted = [...updatedParticipants].sort((a, b) => {
    if (b.bid !== a.bid) return b.bid - a.bid
    return a.bidTimestamp - b.bidTimestamp
  })
  
  const outsideHolders = sorted.slice(0, 4)
  const insideHolders = sorted.slice(4, 6)
  
  const lowestOutsideBid = Math.min(...outsideHolders.map(p => p.bid))
  const oFloor = (config.totalCost + 2 * config.minimumSpread) / 6
  const outsidePrice = Math.max(lowestOutsideBid, oFloor)
  const insidePrice = (config.totalCost - 4 * outsidePrice) / 2
  
  const finalParticipants = updatedParticipants.map(p => ({
    ...p,
    cabinType: outsideHolders.find(oh => oh.id === p.id) ? 'outside' as const : 'inside' as const
  }))
  
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
  const absAmount = Math.abs(amount)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(absAmount)
  
  return amount < 0 ? `-${formatted}` : formatted
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
