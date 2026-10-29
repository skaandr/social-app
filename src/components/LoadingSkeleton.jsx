export function PostSkeleton() {
  return (
    <div className="card p-5" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="space-y-2"><div className="skeleton h-3 w-32" /><div className="skeleton h-3 w-20" /></div>
      </div>
      <div className="mt-4 space-y-2"><div className="skeleton h-3 w-full" /><div className="skeleton h-3 w-4/5" /></div>
      <div className="skeleton mt-4 h-48 w-full" />
    </div>
  );
}
export function ListSkeleton({ count = 3, Item = PostSkeleton }) {
  return <div className="space-y-4" role="status" aria-label="Loading">{Array.from({ length: count }, (_, i) => <Item key={i} />)}</div>;
}
export function RowSkeleton() {
  return (
    <div className="flex gap-3 p-4" aria-hidden="true">
      <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2"><div className="skeleton h-3 w-2/3" /><div className="skeleton h-3 w-1/3" /></div>
    </div>
  );
}
export default ListSkeleton;
