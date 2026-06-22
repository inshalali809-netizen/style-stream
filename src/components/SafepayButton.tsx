import { useState } from 'react'

export function SafepayButton({ amount, orderId }: {
  amount: number,
  orderId: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    setLoading(true)
    setError('')
    try {
      // Redirect directly to Safepay checkout
      const params = new URLSearchParams({
        amount: (amount * 100).toString(),
        order_id: orderId,
        currency: 'PKR',
        merchant_api_key: import.meta.env.VITE_SAFEPAY_PUBLIC_KEY,
        env: 'sandbox'
      })
      window.location.href = `https://sandbox.api.getsafepay.com/checkout?${params}`
    } catch (err) {
      setError('Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          backgroundColor: '#00A651',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          width: '100%'
        }}
      >
        {loading ? 'Processing...' : '💳 Pay with EasyPaisa/JazzCash/Card'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  )
}