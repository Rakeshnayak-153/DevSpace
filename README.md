# Hashnode MERN

A beginner-friendly full-stack developer blogging platform based on the supplied PRD.

## Stack
- MongoDB + Mongoose
- Express.js
- React + Vite
- Node.js
- JWT + bcryptjs
- Axios
- React Router
- react-markdown + react-syntax-highlighter

## Run locally

### 1. MongoDB
Use MongoDB Community Server locally or MongoDB Atlas.

### 2. Server
```powershell
cd server
npm install
copy .env.example .env
npm run dev
```

Edit `.env` if needed:
`MONGO_URI=mongodb://127.0.0.1:27017/hashnode_mern`

### 3. Client
Open another terminal:
```powershell
cd client
npm install
copy .env.example .env
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

The project implements the PRD MVP: authentication, post CRUD, drafts/publishing, tags, public feed/search, profiles, dashboard, Markdown rendering, syntax highlighting, and protected ownership checks.
