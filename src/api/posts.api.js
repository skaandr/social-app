import client, { unwrap } from './client';
import { CONTRACT } from './contract';

const toForm = ({ body, image, removeImage }) => {
  const form = new FormData();
  if (body !== undefined) form.append(CONTRACT.postBody, body);
  if (image) form.append(CONTRACT.postImage, image);
  if (removeImage) form.append(CONTRACT.postRemoveImage, 'true');
  return form;
};

export const getPosts = ({ page = 1, limit = 10 } = {}) =>
  client.get('/posts', { params: { page, limit } }).then(unwrap);

export const getFeed = ({ only = 'all', page = 1, limit = 10 } = {}) =>
  client.get('/posts/feed', { params: { only: CONTRACT.feedOnly[only] || only, page, limit } }).then(unwrap);

export const createPost = (input) => client.post('/posts', toForm(input)).then(unwrap);
export const updatePost = (id, input) => client.put(`/posts/${id}`, toForm(input)).then(unwrap);
export const toggleLike = (id) => client.put(`/posts/${id}/like`).then(unwrap);
export const toggleBookmark = (id) => client.put(`/posts/${id}/bookmark`).then(unwrap);

export const sharePost = (id, body = '') => {
  const form = new FormData();
  if (body) form.append(CONTRACT.postBody, body);
  return client.post(`/posts/${id}/share`, form).then(unwrap);
};
// NOTE: the documented API has no DELETE /posts/:id and no GET /posts/:id.
