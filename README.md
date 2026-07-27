# Social Collaboration (SocialApp) — Assignment 1 + 2

**Repository:** [safinafatima61-gif/social-app-safina-fatima](https://github.com/safinafatima61-gif/social-app-safina-fatima)  
**Branch for this work:** `assignment-2`

A frontend-only social networking app built with React (Vite). Assignment 1 covers auth, feed, posts, and profiles. Assignment 2 adds friends, real-time chat, and OpenAI-powered AI features. Data lives in the browser `localStorage` (session login is per-tab via `sessionStorage`).

## 1. Live Demo

> **Live Demo (Vercel):** _will be updated after deployment_  
> Previous demo: https://connect-circle-919.lovable.app/auth

## 2. Screenshots

> Add at least 4 screenshots here after running the app locally or visiting the live demo: Feed page, Create Post, Profile page, Dashboard.
>
> `![Feed](./screenshots/feed.png)`
> `![Create Post](./screenshots/create-post.png)`
> `![Profile](./screenshots/profile.png)`
> `![Dashboard](./screenshots/dashboard.png)`

## 3. Tech Stack

- **React (Vite)** — frontend framework and build tool
- **React Router v6** — routing, dynamic routes, protected routes
- **Tailwind CSS** — utility-first styling, dark mode
- **React Hook Form** — all forms with validation
- **Context API** — auth state (`AuthContext`)
- **localStorage** — all data storage (users, posts, comments, likes)
- **clsx** — conditional class names
- **React.lazy + Suspense** — code-split pages

## 4. Features

- Signup with validation (name, email, password strength, confirm password)
- Login / logout, session persists across page refresh
- Public feed of posts, sorted newest first, with an empty state
- Guests are redirected to `/login` when they try to like or comment
- Create posts with image upload + live preview, save as draft or publish
- Character counter on the post description (turns orange/red near the limit)
- Edit and delete your own posts; toggle a post between public/private
- Publish drafts from the dashboard with one click
- Post detail page — like/unlike, add comments, delete your own comments (inline confirm, no `confirm()`)
- Public profile pages with cover image, avatar, bio, location, joined date
- Profile settings — update name, bio (150-char counter), location, avatar — reflects instantly in the navbar
- Protected dashboard routes (`RequireAuth`) — redirect to `/login` if not authenticated
- **Bonus:** live search on the Feed page, dark mode toggle (persisted), post description character counter,
 image preview before upload, delete-own-comment with inline confirmation

## 5. How to Run Locally

```bash
git clone https://github.com/<your-username>/social-app-<your-name>.git
cd social-app-<your-name>
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## 6. Folder Structure

```
social-app/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/       (Navbar, Footer)
│   │   ├── post/         (PostCard, PostForm, PostActions, CommentSection)
│   │   ├── profile/      (ProfileHeader)
│   │   ├── ui/           (Button, Input, Modal, Avatar, Badge)
│   │   └── RequireAuth.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useLocalStorage.js
│   │   └── usePosts.js
│   ├── pages/
│   │   ├── FeedPage.jsx, LoginPage.jsx, SignupPage.jsx
│   │   ├── PostDetailPage.jsx, ProfilePage.jsx, NotFoundPage.jsx
│   │   └── dashboard/
│   │       ├── DashboardLayout.jsx, PostsDashboard.jsx
│   │       ├── CreatePost.jsx, EditPost.jsx, ProfileSettings.jsx
│   ├── utils/
│   │   ├── storage.js    (all localStorage helpers)
│   │   └── helpers.js    (generateId, formatDate, readFileAsBase64)
│   ├── App.jsx
│   └── main.jsx
```

## 7. localStorage Data Structure

```js
// Key: 'users'
[{ id, name, email, password, bio, location, avatar, coverImage, joinedAt }]

// Key: 'posts'
[{ id, authorId, description, image, isPublic, isDraft, createdAt, updatedAt }]

// Key: 'comments'
[{ id, postId, authorId, text, createdAt }]

// Key: 'likes'
[{ id, postId, userId, createdAt }]

// Key: 'currentUser' — the logged-in user (password stripped)
// Key: 'theme' — 'light' | 'dark'
```

## 8. What I Learned

> Write an honest paragraph here (minimum 5 sentences) about what you learned building this — React Router's nested/protected routes, Context 
API for global auth state, structuring localStorage as a fake backend, React Hook Form validation patterns, and organizing reusable components/hooks 
so the codebase stays clean.

## 9. Known Limitations

- Data lives only in the browser — clearing site data or switching browsers/devices loses everything.
- Passwords are stored in plain text in `localStorage`, which is fine for a learning project but never acceptable with a real backend.
- No pagination — every post/comment/like is loaded into memory at once.
- No real-time updates between two open tabs/users beyond a basic `storage` event listener.
- With a real backend (Node/Express + MongoDB, matching the MERN stack), I'd add proper password hashing, JWT auth, image uploads to 
cloud storage, pagination, and real-time notifications.

## 10. Project Title & Tagline

**SocialApp** — a Facebook-inspired social feed built entirely on the frontend, powered by React and localStorage.














# 📘 SocialApp — Facebook-Inspired Social Media Platform

A modern Facebook-inspired social media application built with **React (Vite)**. SocialApp allows users to register, log in,
 create and manage posts, interact through likes and comments, customize their profiles, and experience a responsive social
  networking platform. All application data is stored locally using the browser's **localStorage**, making it a complete 
  frontend-only project.

---

# 🚀 Live Demo

**Live Demo:** https://connect-circle-919.lovable.app/auth


**Live Demo vercel:**  


# 📸 Screenshots
![alt text](Feedpage.png)
![alt text](Creatpost.png)
![alt text](Dashboard.png) 
![alt text](Profilepage.png)

> Add your screenshots after running the project.

| Feed | Dashboard |
|------|-----------|
| ![Feed](./screenshots/feed.png) | ![Dashboard](./screenshots/dashboard.png) |

| Create Post | Profile |
|-------------|---------|
| ![Create Post](./screenshots/create-post.png) | ![Profile](./screenshots/profile.png) |

---

# 📖 Project Overview

SocialApp is a Facebook-inspired social networking application developed as a frontend project using React. The application simulates the core functionality of a real social media platform, allowing users to share posts, upload images, interact through likes and comments, and manage personalized profiles.

The primary objective of this project is to demonstrate modern React development practices, reusable component architecture, authentication using Context API, routing with React Router, and browser-based data persistence through localStorage.

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- Logout
- Persistent Login Session
- Protected Routes
- Form Validation using React Hook Form

---

## 👤 User Profile

- Update Profile Information
- Upload Avatar
- Upload Cover Image
- Edit Bio
- Update Location
- Joined Date
- Public Profile View

---

## 📝 Post Management

- Create New Posts
- Upload Images
- Live Image Preview
- Save Draft Posts
- Publish Posts
- Edit Existing Posts
- Delete Posts
- Public / Private Posts
- Character Counter

---

## ❤️ Social Interaction

- Like Posts
- Unlike Posts
- Add Comments
- Delete Own Comments
- Post Detail Page
- Live Feed
- Newest Posts First

---

## 📊 Dashboard

Authenticated users can:

- Manage Posts
- Publish Drafts
- Edit Profile
- Create New Posts
- Delete Posts
- View Personal Content

---

## 🎨 User Experience

- Responsive Design
- Mobile Friendly Layout
- Dark Mode
- Live Search
- Smooth Navigation
- Modern Facebook-inspired Interface

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| React (Vite) | Frontend Framework |
| React Router v6 | Navigation & Protected Routes |
| Tailwind CSS | Responsive Styling |
| React Hook Form | Form Validation |
| Context API | Authentication State Management |
| localStorage | Browser Data Storage |
| clsx | Conditional Styling |
| React.lazy & Suspense | Code Splitting |

---

# 📂 Folder Structure

```
social-app/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── post/
│   │   │   ├── PostCard.jsx
│   │   │   ├── PostForm.jsx
│   │   │   ├── PostActions.jsx
│   │   │   └── CommentSection.jsx
│   │   │
│   │   ├── profile/
│   │   │   └── ProfileHeader.jsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Modal.jsx
│   │   │
│   │   └── RequireAuth.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useLocalStorage.js
│   │   └── usePosts.js
│   │
│   ├── pages/
│   │   ├── FeedPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── PostDetailPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── dashboard/
│   │       ├── DashboardLayout.jsx
│   │       ├── PostsDashboard.jsx
│   │       ├── CreatePost.jsx
│   │       ├── EditPost.jsx
│   │       └── ProfileSettings.jsx
│   │
│   ├── utils/
│   │   ├── storage.js
│   │   └── helpers.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── README.md
```

---

# 💾 localStorage Structure

```javascript
users
[
  {
    id,
    name,
    email,
    password,
    bio,
    location,
    avatar,
    coverImage,
    joinedAt
  }
]

posts
[
  {
    id,
    authorId,
    description,
    image,
    isPublic,
    isDraft,
    createdAt,
    updatedAt
  }
]

comments
[
  {
    id,
    postId,
    authorId,
    text,
    createdAt
  }
]

likes
[
  {
    id,
    postId,
    userId,
    createdAt
  }
]

currentUser

theme
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/yourusername/social-app.git
```

Move into project

```bash
cd social-app
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Open

```
http://localhost:5173
```

Build production version

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

---

# 📚 What I Learned

Building SocialApp significantly improved my understanding of modern React development and frontend architecture. I learned how to create reusable components that keep the project organized and maintainable. Implementing React Router helped me understand protected routes, nested routing, and seamless page navigation. Using Context API allowed me to manage authentication globally without excessive prop drilling. React Hook Form enhanced my skills in building efficient forms with proper validation, while localStorage helped simulate backend functionality by storing users, posts, comments, likes, and application settings. Overall, this project strengthened my knowledge of component-based development, state management, responsive UI design, and real-world frontend application structure.

---

# ⚠️ Current Limitations

- Frontend-only application
- Data is stored only inside browser localStorage
- Passwords are not encrypted
- No backend database
- No cloud image storage
- No pagination
- No real-time messaging
- No push notifications

---

# 🚀 Future Improvements

- Node.js Backend
- Express.js REST APIs
- MongoDB Database
- JWT Authentication
- Password Hashing
- Cloudinary Image Uploads
- Friend Request System
- Real-time Chat
- Notifications
- Infinite Scrolling
- Story Feature
- AI-powered Feed Recommendations

---

# 🎯 Project Objective

The goal of SocialApp is to recreate the core experience of Facebook using modern React technologies
 while following clean code principles, reusable architecture, and responsive UI design. The project demonstrates 
 practical frontend development skills and serves as a strong portfolio project for showcasing React, routing, 
 state management, authentication, and user interaction.

---

# 🏷 Project Tagline

> **SocialApp — A Modern Facebook-Inspired Social Networking Platform built with React, 
Tailwind CSS, Context API, React Router, and localStorage.**

---

# Assignment 2 Features

Built on top of Assignment 1. Three major add-ons:

## 1. Friend System
- **People You May Know** (`/people`) — discover users, sorted by incoming → none → outgoing
- **Friend Requests** (`/requests`) — Received / Sent tabs with Accept, Reject, Cancel
- **Friends List** (`/friends`) — Message + Unfriend, empty state links to People
- Profile relationship buttons: Add Friend / Request Sent / Accept+Reject / Message+Unfriend
- Navbar bell badge for pending received requests

## 2. Real-Time Chat
- Messenger UI at `/chat` and `/chat/:userId` (friends only)
- Text, image, and video messages with FileReader preview before send
- Cross-tab real-time via `localStorage` + `storage` event (no WebSockets)
- AI reply chips, AI auto-reply mode, typing indicator, online status

## 3. AI Integration (OpenAI `gpt-4o-mini`)
- Post writing assistant (Create / Edit Post)
- Suggest Comment on Post Detail
- Optimise Bio on Profile Settings
- Chat Mode 1: 3 reply suggestion chips
- Chat Mode 2: AI replies on your behalf (opt-in only)

### Bonus features included
1. Message read receipts (`✓` / `✓✓`)
2. Emoji reactions on messages
3. Message search in chat (Esc to close)
4. AI chat personality (Friendly / Professional / Casual / Funny)
5. Mutual friends count on People cards

---

# AI Features

All AI calls go through `src/hooks/useAI.js` using the shared client in `src/lib/openai.js`.

| Feature | Where | Behaviour |
|---------|-------|-----------|
| Post generation | Create/Edit Post | Collapsible panel → generate → Use This Content |
| Comment suggest | Post Detail | Fills comment input; user still clicks Post |
| Bio optimise | Profile Settings | Suggestion card under 150 chars |
| Chat chips | Chat | 3 chips after friend message (fail silently) |
| Auto-reply | Chat header AI menu | 1–2s delay, ✨ sparkle on AI messages |

Always: `model: 'gpt-4o-mini'`, `max_tokens: 300`, loading states, try/catch error handling.

---

# Real-Time Chat Architecture

There is **no backend and no WebSocket**. Real-time works like this:

1. Tab A sends a message → writes the `messages` array to `localStorage`
2. Tab B (same origin) receives the browser `storage` event
3. The listener in `ChatContext` re-reads messages and updates React state
4. The UI refreshes instantly without a page reload

`conversationId` is always `[userId1, userId2].sort().join('_')` so A→B and B→A share one thread.

Cleanup: every `useEffect` that adds a listener returns `removeEventListener`.

---

# How to Set Up the API Key

> **Note:** The `.env` file is **not** committed to GitHub. You must add your own OpenAI key to use AI features. Friends + Chat work without a key.

1. Open the project folder: `social-app/`
2. Copy `.env.example` to `.env`
3. Paste your key:

```env
VITE_OPENAI_API_KEY=sk-your-key-here
```

4. Install and run:

```bash
cd social-app
npm install
npm run dev
```

5. Restart the dev server whenever you change `.env`

---

# Assignment 2 Screenshots

> Add these after running the app (replace placeholders with real images):

```
![People page](./screenshots/people.png)
![Chat with AI chips](./screenshots/chat-ai-chips.png)
![AI post generation](./screenshots/ai-post.png)
![AI auto-reply mode](./screenshots/ai-auto-reply.png)
```

| People | Chat + AI chips |
|--------|-----------------|
| ![People](./screenshots/people.png) | ![Chat](./screenshots/chat-ai-chips.png) |

| AI Post | AI Auto-reply |
|---------|---------------|
| ![AI Post](./screenshots/ai-post.png) | ![Auto-reply](./screenshots/ai-auto-reply.png) |

---

# New localStorage Keys (Assignment 2)

```js
// friendRequests
[{ id, fromUserId, toUserId, status, sentAt, respondedAt }]

// messages
[{ id, conversationId, senderId, receiverId, type, content, timestamp, read, aiGenerated, reactions }]

// aiSettings
{ [userId]: { aiChatEnabled, aiMode, aiPersonality } }
```
