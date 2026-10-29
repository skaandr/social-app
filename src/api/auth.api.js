import client, { unwrap } from './client';
import { CONTRACT } from './contract';

export const signup = (values) => {
  const payload = {};
  CONTRACT.signup.forEach((key) => {
    if (values[key] !== undefined && values[key] !== '') payload[key] = values[key];
  });
  return client.post('/users/signup', payload, { skipAuthExpiry: true }).then(unwrap);
};

/** Tries each documented identifier key until the API stops reporting a validation error. */
export async function signin({ identifier, password }) {
  let lastError;
  for (const key of CONTRACT.signinKeys) {
    try {
      const res = await client.post('/users/signin', { [key]: identifier, password }, { skipAuthExpiry: true });
      return unwrap(res);
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      if (status !== 400 && status !== 422) throw err; // wrong credentials, network, etc.
    }
  }
  throw lastError;
}
