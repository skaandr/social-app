/**
 * Request field names the public docs do not spell out.
 * Everything here is a best guess based on the documented endpoint table.
 * If the API rejects a request, change the name HERE (one place) - see VERIFY.md.
 */
export const CONTRACT = {
  signup: ['name', 'username', 'email', 'dateOfBirth', 'gender', 'password', 'rePassword'],
  // Sign-in accepts "login/email/username" per the docs; we try these keys in order.
  signinKeys: ['email', 'login', 'username'],
  changePassword: { current: 'password', next: 'newPassword' },
  postBody: 'body',
  postImage: 'image',
  postRemoveImage: 'removeImage',
  commentText: 'content',
  uploadPhoto: 'photo',
  feedOnly: { all: 'all', me: 'me', following: 'following' },
};
