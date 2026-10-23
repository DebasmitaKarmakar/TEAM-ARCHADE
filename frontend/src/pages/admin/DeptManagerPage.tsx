export default function DeptManagerPage() {
  return (
    <div className="px-4 md:px-6 lg:px-12 py-10 max-w-7xl mx-auto" style={{ background: '#0C0D10', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '36px', fontWeight: 600, color: '#e3e2e6', marginBottom: '32px' }}>Department Manager</h1>
      <div className="p-8 rounded-xl" style={{ background: '#15171D', border: '1px solid #232631' }}>
        <p style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif" }}>
          Department-scoped product & inventory management.<br />
          Connects to <code style={{ color: '#00F0FF' }}>/api/v1/admin/products</code> with DEPT_MANAGER scope.
        </p>
      </div>
    </div>
  );
}
