export function CartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 4h2l2 11h9.5a2 2 0 0 0 2-1.6L21 8H7" />
      <circle cx="10" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </svg>
  );
}
