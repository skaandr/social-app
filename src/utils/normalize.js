// The docs do not list response field names, so every reader below tolerates several likely shapes.
export const idOf = (o) => (o && typeof o === 'object' ? o._id ?? o.id : o);
export const imgUrl = (x) => (typeof x === 'string' ? x : x?.url || x?.secure_url || x?.path || '');

export function pickList(data, keys = []) {
  if (Array.isArray(data)) return data;
  for (const k of [...keys, 'data', 'items', 'results']) if (Array.isArray(data?.[k])) return data[k];
  if (data && typeof data === 'object') {
    const arr = Object.values(data).find(Array.isArray);
    if (arr) return arr;
  }
  return [];
}

export function getPagination(meta, count, limit, page) {
  const m = meta?.pagination ?? meta ?? {};
  const current = m.currentPage ?? m.page ?? page;
  const total = m.numberOfPages ?? m.totalPages ?? m.pages;
  let hasMore;
  if (m.nextPage !== undefined) hasMore = Boolean(m.nextPage);
  else if (m.hasNextPage !== undefined) hasMore = Boolean(m.hasNextPage);
  else if (total != null) hasMore = Number(current) < Number(total);
  else hasMore = count >= limit;
  return { hasMore, current: Number(current) };
}

export function normalizeUser(u) {
  if (!u) return null;
  return {
    id: idOf(u),
    name: u.name || u.fullName || u.username || 'Unknown user',
    username: u.username || '',
    email: u.email || '',
    bio: u.bio || u.about || '',
    photo: imgUrl(u.photo ?? u.profilePicture ?? u.avatar ?? u.image),
    raw: u,
  };
}

const includesId = (arr, id) =>
  Array.isArray(arr) && id ? arr.some((x) => idOf(x) === id) : undefined;

export function normalizePost(p, meId) {
  const author = normalizeUser(p.user ?? p.createdBy ?? p.author ?? p.creator);
  const shared = p.sharedPost ?? p.originalPost ?? p.post;
  const liked = p.isLiked ?? p.liked ?? p.likedByMe ?? includesId(p.likes, meId);
  return {
    id: idOf(p),
    body: p.body ?? p.content ?? p.text ?? '',
    image: imgUrl(p.image ?? p.images?.[0]),
    author,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    likesCount: p.likesCount ?? p.likeCount ?? (Array.isArray(p.likes) ? p.likes.length : 0),
    commentsCount: p.commentsCount ?? p.commentCount ?? (Array.isArray(p.comments) ? p.comments.length : 0),
    sharesCount: p.sharesCount ?? p.shareCount ?? 0,
    liked: Boolean(liked),
    bookmarked: p.bookmarked ?? p.isBookmarked ?? includesId(p.bookmarks, meId), // undefined = unknown
    isMine: Boolean(meId && author?.id === meId),
    shared: shared && typeof shared === 'object' && idOf(shared) !== idOf(p) ? normalizePost(shared, meId) : null,
  };
}

export function normalizeComment(c, meId) {
  const author = normalizeUser(c.commentCreator ?? c.user ?? c.createdBy ?? c.author);
  const liked = c.isLiked ?? c.liked ?? includesId(c.likes, meId);
  return {
    id: idOf(c),
    text: c.content ?? c.body ?? c.text ?? '',
    author,
    createdAt: c.createdAt,
    likesCount: c.likesCount ?? c.likeCount ?? (Array.isArray(c.likes) ? c.likes.length : 0),
    liked: Boolean(liked),
    repliesCount: c.repliesCount ?? c.replyCount ?? (Array.isArray(c.replies) ? c.replies.length : 0),
    isMine: Boolean(meId && author?.id === meId),
  };
}

export function normalizeNotification(n) {
  const actor = normalizeUser(n.sender ?? n.from ?? n.actor ?? n.user ?? n.createdBy);
  const type = n.type || n.action || '';
  const verbs = { like: 'liked your post', comment: 'commented on your post', reply: 'replied to your comment', share: 'shared your post', follow: 'started following you', mention: 'mentioned you' };
  const key = Object.keys(verbs).find((k) => String(type).toLowerCase().includes(k));
  const entity = n.entity ?? n.post ?? n.data ?? {};
  return {
    id: idOf(n),
    read: Boolean(n.isRead ?? n.read ?? n.seen),
    actor,
    text: n.message || n.text || (key ? `${actor?.name || 'Someone'} ${verbs[key]}` : 'You have a new notification'),
    createdAt: n.createdAt,
    postId: n.postId ?? entity.postId ?? idOf(entity.post) ?? (entity.body !== undefined ? idOf(entity) : undefined),
  };
}
