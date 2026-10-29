# Things to verify against the live API

I could not run the app or call the API while building this (no network in the build sandbox),
and the Postman page with request/response examples was not readable. The endpoint list and
methods come from https://route-posts.routemisr.com/route-posts. Everything below is a
best guess. **Nothing in this project has been run or tested yet.**

All guessed request field names live in one file: `src/api/contract.js`.
All guessed response shapes are handled in `src/utils/normalize.js`.

## Request fields (guessed)
| Feature | Guess | Where |
|---|---|---|
| Sign up body | `name, username, email, dateOfBirth, gender, password, rePassword` | `contract.js` -> `signup` |
| Sign in body | tries `email`, then `login`, then `username` as the identifier key | `contract.js` -> `signinKeys` |
| Change password | `password` (current) + `newPassword` | `contract.js` -> `changePassword` |
| Create/edit post | multipart: `body`, `image` | `contract.js` |
| Remove image on edit | multipart `removeImage=true` | `contract.js` -> `postRemoveImage` |
| Comment / reply | multipart `content` | `contract.js` -> `commentText` |
| Profile photo | multipart `photo` | `contract.js` -> `uploadPhoto` |
| Feed filter | `?only=all | me | following` | `contract.js` -> `feedOnly` |

## Response shapes (guessed)
- Token at `data.token` (documented). User at `data.user` or `data` for profile-data.
- Lists: found under `data.posts`, `data.comments`, `data.notifications`, etc., or any array in `data`.
- Pagination: reads `meta.nextPage / hasNextPage / currentPage / numberOfPages / totalPages`;
  falls back to "a full page means there may be more".
- Like / bookmark toggles: uses an explicit boolean from the response if present, otherwise flips local state after success.
- Notification text and target post come from several possible field names.

## API gaps (not faked)
- No `DELETE /posts/:id` -> posts cannot be deleted (no delete button is shown).
- No `GET /posts/:id` -> the details page uses the post passed from the feed; when opened directly it scans the feed (up to 10 pages).
- No edit-profile endpoint other than photo upload -> Edit Profile is photo-only.
- No search endpoint -> the search bar filters posts already loaded in Home/Explore.
- No endpoint for other users' profiles or follow/unfollow -> suggestions are display-only.
- No documented edit/like endpoint for replies -> replies are view/create only.
