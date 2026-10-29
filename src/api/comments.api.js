import client, { unwrap } from './client';
import { CONTRACT } from './contract';

const textForm = (text) => {
  const form = new FormData();
  form.append(CONTRACT.commentText, text);
  return form;
};
const base = (postId) => `/posts/${postId}/comments`;

export const getComments = (postId, { page = 1, limit = 10 } = {}) =>
  client.get(base(postId), { params: { page, limit } }).then(unwrap);
export const createComment = (postId, text) => client.post(base(postId), textForm(text)).then(unwrap);
export const updateComment = (postId, id, text) => client.put(`${base(postId)}/${id}`, textForm(text)).then(unwrap);
export const deleteComment = (postId, id) => client.delete(`${base(postId)}/${id}`).then(unwrap);
export const toggleCommentLike = (postId, id) => client.put(`${base(postId)}/${id}/like`).then(unwrap);

export const getReplies = (postId, id, { page = 1, limit = 5 } = {}) =>
  client.get(`${base(postId)}/${id}/replies`, { params: { page, limit } }).then(unwrap);
export const createReply = (postId, id, text) =>
  client.post(`${base(postId)}/${id}/replies`, textForm(text)).then(unwrap);
