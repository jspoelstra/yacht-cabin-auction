export type CabinType = 'outside' | 'inside' | 'none'

export interface Participant {
  id: string
  name: string
  phone: string
  password: string
  bid: number
  bidTimestamp: number
  cabinType: CabinType
  isLocked: boolean
}

export interface AuctionConfig {
  totalCost: number
  minimumSpread: number
  closeTime: number
  outsideCabins: number
  insideCabins: number
}

export interface AuctionState {
  config: AuctionConfig
  participants: Participant[]
  outsidePrice: number
  insidePrice: number
  status: 'setup' | 'active' | 'closed'
  lowestOutsideBid: number
  adminPassword: string
  isAuctionLocked: boolean
}

export interface BidSubmission {
  participantId: string
  amount: number
  timestamp: number
}
