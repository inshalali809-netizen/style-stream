import { createServerFn } from '@tanstack/react-start'

export const createOrder = createServerFn({
  method: 'POST'
}).handler(async ({ data }) => {
  console.log("✅ Order received on server:", data)

  // Simulate successful order creation
  await new Promise(resolve => setTimeout(resolve, 800)) // fake delay

  return {
    success: true,
    orderId: "ORD-" + Date.now(),
    message: "Order placed successfully!"
  }
})