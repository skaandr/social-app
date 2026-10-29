import Avatar from './Avatar';
import { timeAgo } from '../utils/time';

export default function NotificationItem({ item, onOpen }) {
  return (
    <li>
      <button onClick={() => onOpen(item)} className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 ${item.read ? '' : 'bg-brand-50/60'}`}>
        <Avatar user={item.actor} size={40} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-slate-800">{item.text}</span>
          <time dateTime={item.createdAt} className="mt-0.5 block text-xs text-slate-500">{timeAgo(item.createdAt)}</time>
        </span>
        {!item.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600"><span className="sr-only">Unread</span></span>}
      </button>
    </li>
  );
}
