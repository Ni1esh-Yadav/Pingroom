# Pingroom

Pingroom is a live video chat application designed **exclusively for developers**. Think of it as a networking tool where developers can randomly connect with other developers around the world and collaborate instantly — like Omegle, but only for the dev community. 

## Motivation

In today’s world, developers often struggle to find like-minded people to collaborate with, discuss projects, or simply network. While platforms like GitHub, LinkedIn, or Discord help in showcasing work and building communities, they lack the **instant face-to-face connection** that helps spark real-time collaboration.

Pingroom solves this problem by enabling developers to **instantly connect via text or video chat**, without the hassle of creating accounts or setting up communities. Whether you want to find a coding buddy, discuss ideas, or network casually, Pingroom creates a developer-only space for meaningful connections.

## Features

*  **Video Chat** – Connect with other developers face-to-face in real time.
*  **Text Chat** – Chat instantly with no distractions.
*  **GitHub Login Only** – Only developers with a GitHub account can join, ensuring the community is developer-focused.
*  **No Signups** – Join instantly without filling out lengthy forms.
*  **Random Matching** – Get paired with developers from anywhere in the world.
*  **Support the Project** – Integrated [Buy Me a Coffee](https://www.buymeacoffee.com/) link to support future improvements.

## Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js, WebSockets
* **Authentication:** GitHub OAuth
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## Contributing

Pingroom is open source and welcomes contributions from developers! 🚀  

If you’d like to contribute:  
1. Fork the repository.  
2. Create a new branch (`git checkout -b feature-branch`).  
3. Make your changes.  
4. Commit and push (`git commit -m "Added feature"`).  
5. Open a Pull Request.  

Check the [Issues](../../issues) tab for tasks to work on — a good starting point is **Partner video alignment on mobile devices**.

--- 

## ⚙️ Backend Setup

1. Navigate to backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file inside `backend/`:

   ```env
   PORT=4000
   NODE_ENV=development
   ORIGIN=http://localhost:5173
   COOKIE_DOMAIN=localhost
   JWT_SECRET=replace-me-with-a-strong-secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback
   ```

4. Run in development mode:

   ```bash
   npm run dev
   ```

5. Build & run in production mode:

   ```bash
   npm run build
   npm start
   ```

---

## 🎨 Frontend Setup

1. Navigate to frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

---

## 🌍 Deployment

### Backend (Render)

1. Push this repo to GitHub.
2. Go to [Render](https://dashboard.render.com/).
3. Create a new **Web Service** → connect your GitHub repo.
4. **Build Command**:

   ```bash
   cd backend && npm install && npm run build
   ```
5. **Start Command**:

   ```bash
   cd backend && npm start
   ```
6. Add environment variables under **Render → Environment**.

### Frontend (Vercel)

1. Go to [Vercel](https://vercel.com/).
2. Import GitHub repo.
3. Set **Root Directory** to `frontend/`.
4. Add your backend URL to `vite.config.ts` and WebSocket connection:

   ```ts
   const ws = new WebSocket(
     import.meta.env.PROD
       ? "wss://pingroom.onrender.com/signaling"
       : "ws://localhost:4000/signaling"
   );
   ```

---

## ✅ Live URLs

* **Frontend**: [https://pingroom-sand.vercel.app/](https://pingroom-sand.vercel.app/)
* **Backend**: [https://pingroom.onrender.com/](https://pingroom.onrender.com/)


