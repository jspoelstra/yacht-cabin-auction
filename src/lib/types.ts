export type CabinType = 'outside' | 'inside'

export interface Participant {
  id: string
  name: string
  bid: number
  bidTimestamp: number
  cabinType: CabinType
  isLocked: boolean
}

export interface AuctionConfig {
  totalCost: number
  minimumSpread: number
  closeTime: number
}

export interface AuctionState {
  config: AuctionConfig
  participants: Participant[]
  outsidePrice: number
  insidePrice: number
  status: 'setup' | 'active' | 'closed'
  lowestOutsideBid: number
}

export interface BidSubmission {
  participantId: string
  amount: number
  timestamp: number
}
