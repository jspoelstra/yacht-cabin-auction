import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { Participant, AuctionState } from '@/lib/types'

interface NotificationState {
  cabinType: string
  price: number
  lowestOutsideBid: number
}

export function useAuctionNotifications(
  participant: Participant | null,
  auctionState: AuctionState | null
) {
  const previousState = useRef<NotificationState | null>(null)
  const notificationPermission = useRef<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      notificationPermission.current = Notification.permission
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          notificationPermission.current = permission
        })
      }
    }
  }, [])

  useEffect(() => {
    if (!participant || !auctionState || auctionState.status !== 'active') {
      return
    }

    const currentPrice = participant.cabinType === 'outside' 
      ? auctionState.outsidePrice 
      : auctionState.insidePrice

    const currentState: NotificationState = {
      cabinType: participant.cabinType,
      price: currentPrice,
      lowestOutsideBid: auctionState.lowestOutsideBid
    }

    if (previousState.current) {
      const prev = previousState.current

      if (prev.cabinType !== currentState.cabinType) {
        const wasOutside = prev.cabinType === 'outside'
        const isNowOutside = currentState.cabinType === 'outside'

        if (wasOutside && !isNowOutside) {
          toast.error('⚠️ Cabin Change: You\'ve been moved to an INSIDE cabin', {
            description: `Someone outbid you. Your new price: $${currentPrice.toLocaleString()}`,
            duration: 10000
          })
          
          sendBrowserNotification(
            '⚠️ Cabin Assignment Changed',
            `You've been moved to an INSIDE cabin. New price: $${currentPrice.toLocaleString()}`
          )
        } else if (!wasOutside && isNowOutside) {
          toast.success('🎉 Cabin Upgrade: You now have an OUTSIDE cabin!', {
            description: `Your new price: $${currentPrice.toLocaleString()}`,
            duration: 10000
          })
          
          sendBrowserNotification(
            '🎉 Cabin Upgraded!',
            `You now have an OUTSIDE cabin. New price: $${currentPrice.toLocaleString()}`
          )
        }
      } else if (prev.price !== currentState.price) {
        const priceDiff = currentState.price - prev.price
        const isIncrease = priceDiff > 0

        if (isIncrease) {
          toast.warning(`💰 Your ${participant.cabinType} cabin price increased`, {
            description: `Up $${Math.abs(priceDiff).toLocaleString()} to $${currentPrice.toLocaleString()}`,
            duration: 8000
          })
        } else {
          toast.success(`💰 Your ${participant.cabinType} cabin price decreased`, {
            description: `Down $${Math.abs(priceDiff).toLocaleString()} to $${currentPrice.toLocaleString()}`,
            duration: 8000
          })
        }
        
        sendBrowserNotification(
          `Price ${isIncrease ? 'Increased' : 'Decreased'}`,
          `Your ${participant.cabinType} cabin is now $${currentPrice.toLocaleString()}`
        )
      }

      if (participant.cabinType === 'outside') {
        const wasAtRisk = prev.lowestOutsideBid >= (participant?.bid || 0)
        const isNowAtRisk = currentState.lowestOutsideBid >= participant.bid
        
        if (!wasAtRisk && isNowAtRisk) {
          toast.warning('⚠️ Risk Alert: You are now the lowest outside bidder', {
            description: 'Higher bids may bump you to an inside cabin',
            duration: 10000
          })
          
          sendBrowserNotification(
            '⚠️ Risk Alert',
            'You are now the lowest outside bidder and may be bumped to inside cabin'
          )
        }
      }
    }

    previousState.current = currentState
  }, [participant, auctionState])
}

function sendBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false,
        tag: 'auction-update'
      })
    } catch (error) {
      console.warn('Failed to send browser notification:', error)
    }
  }
}
