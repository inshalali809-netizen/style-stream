import { createServerFn } from '@tanstack/react-start'

export const createSafepaySession = createServerFn()
  .handler(async ({ data }) => {
    const { amount, orderId } = data as { amount: number, orderId: string }
    
    const response = await fetch(
      'https://sandbox.api.getsafepay.com/order/v1/init',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SFPY-MERCHANT-SECRET': process.env.SAFEPAY_SECRET_KEY!
        },
        body: JSON.stringify({
          merchant_api_key: process.env.VITE_SAFEPAY_PUBLIC_KEY,
          intent: 'CYBERSOURCE',
          mode: 'payment',
          currency: 'PKR',
          amount: amount * 100,
          order_id: orderId
        })
      }
    )
    const session = await response.json()
    return session
  })