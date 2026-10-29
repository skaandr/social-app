const COLORS = ['bg-indigo-500', 'bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];

export default function Avatar({ user, size = 40, className = '' }) {
  const name = user?.name || '?';
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
  const color = COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (user?.photo) {
    return <img src={user.photo} alt={name} style={style} className={`shrink-0 rounded-full object-cover ${className}`} loading="lazy" />;
  }
  return (
    <span style={style} aria-label={name} className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${color} ${className}`}>
      {initials}
    </span>
  );
}
