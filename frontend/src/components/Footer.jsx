export default function Footer() {
  return (
    <footer className="py-6 text-center" style={{ backgroundColor: '#EFEDEC' }}>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.6875rem',
        color: '#8B8886',
        letterSpacing: '-0.01em'
      }}>
        <a
          href="/privacy"
          style={{
            color: '#8B8886',
            textDecoration: 'underline',
            textUnderlineOffset: '2px'
          }}
        >
          Privacy Policy
        </a>
      </p>
    </footer>
  );
}
