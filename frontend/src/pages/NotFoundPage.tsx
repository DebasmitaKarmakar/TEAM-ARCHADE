import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#0C0D10' }}>
      <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '120px', fontWeight: 700, color: '#1f1f23', lineHeight: 1 }}>404</p>
      <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '32px', fontWeight: 600, color: '#e3e2e6', marginTop: '-32px' }}>
        Page Not Found
      </h1>
      <p style={{ color: '#636466', fontFamily: "'Hanken Grotesk',sans-serif" }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="px-6 py-3 rounded font-label"
        style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600 }}>
        Back to Home
      </Link>
    </div>
  );
}
