import client, { unwrap } from './client';
import { CONTRACT } from './contract';

export const getProfile = (config) => client.get('/users/profile-data', config).then(unwrap);
export const getSuggestions = ({ page = 1, limit = 5 } = {}) =>
  client.get('/users/suggestions', { params: { page, limit } }).then(unwrap);

export const changePassword = ({ current, next }) =>
  client
    .patch('/users/change-password', {
      [CONTRACT.changePassword.current]: current,
      [CONTRACT.changePassword.next]: next,
    })
    .then(unwrap);

export const uploadPhoto = (file) => {
  const form = new FormData();
  form.append(CONTRACT.uploadPhoto, file);
  return client.put('/users/upload-photo', form).then(unwrap);
};
