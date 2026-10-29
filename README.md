# Connectly

React + Vite social app for the Route Posts API (https://route-posts.routemisr.com).

## Run
```bash
npm install
cp .env.example .env   # optional, defaults to the Route API
npm run dev            # http://localhost:5173
npm run build          # production build
npm run preview
```

Needs Node 18+. Environment: `VITE_API_BASE_URL` (default `https://route-posts.routemisr.com`).

## Structure
```
src/
  api/         client.js (axios + token + errors), contract.js (guessed field names), *.api.js
  context/     AuthContext, NotificationsContext
  components/  AppLayout, Sidebar, Topbar, MobileNavigation, PostCard, PostComposer, PostActions,
               PostList, CommentCard, CommentForm, ProfileHeader, NotificationItem, Avatar, Modal, ...
  pages/       Login, Signup, Home, Explore, PostDetails, Profile, Notifications, Settings, ChangePassword, NotFound
  utils/       normalize.js (tolerant response readers), time.js
```

Read `VERIFY.md` first: it lists what was guessed and which API features do not exist.
