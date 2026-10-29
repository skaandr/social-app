import client, { unwrap } from './client';

export const getNotifications = ({ page = 1, limit = 15 } = {}) =>
  client.get('/notifications', { params: { page, limit } }).then(unwrap);
export const getUnreadCount = () => client.get('/notifications/unread-count').then(unwrap);
export const markRead = (id) => client.patch(`/notifications/${id}/read`).then(unwrap);
export const markAllRead = () => client.patch('/notifications/read-all').then(unwrap);
