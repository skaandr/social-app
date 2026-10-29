export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-600">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true"><path d="M11 16a5 5 0 0 1 5-5h5M21 16a5 5 0 0 1-5 5h-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" /></svg>
      </span>
      Connectly
    </span>
  );
}
