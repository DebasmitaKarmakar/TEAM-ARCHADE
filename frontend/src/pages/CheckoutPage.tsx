export default function CheckoutPage() {
  return (
    <div className="px-4 md:px-6 lg:px-12 py-10 max-w-4xl mx-auto" style={{ background: '#0C0D10', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '36px', fontWeight: 600, color: '#e3e2e6', marginBottom: '32px' }}>Checkout</h1>
      <div className="p-8 rounded-xl text-center" style={{ background: '#15171D', border: '1px solid #232631' }}>
        <p style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif" }}>
          Checkout flow — connects to POST /api/v1/checkout with Razorpay/mock payment.<br/>
          <strong style={{ color: '#c5c7c9' }}>Backend must be running with DATABASE_URL configured.</strong>
        </p>
        <div className="mt-6 p-4 rounded-lg" style={{ background: '#1f1f23', border: '1px solid #232631' }}>
          <p className="font-badge uppercase tracking-widest" style={{ color: '#10B981', fontSize: '10px' }}>Demo: Use PAYMENT_MODE=mock in .env</p>
        </div>
      </div>
    </div>
  );
}
