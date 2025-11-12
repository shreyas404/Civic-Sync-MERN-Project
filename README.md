# Civic-Sync: Full-Stack MERN Issue Tracker

This is a complete, full-stack MERN application that serves as a platform for citizens to report civic issues and for administrators to manage and resolve them. The project features a complete gamification loop with points, a leaderboard, and rewards to encourage user engagement.

This repository is a **monorepo** containing all three parts of the application:
1.  **`civic-sync-backend`**: The Node.js/Express REST API and MongoDB database.
2.  **`civic-sync-user-app`**: The React (Vite) frontend for public users.
3.  **`civic-sync-admin-dashboard`**: The secure React (Vite) frontend for administrators.

---

## Key Features

* **Dual-App Architecture:** Separate React applications for Users (submit issues) and Admins (manage issues).
* **Role-Based Authentication:** Secure user and admin login system using **JWT** and `bcryptjs`. The first registered user is automatically designated as the Admin.
* **File Uploads:** Users can upload photo/video proof of issues, which are handled by the backend with `multer` and stored on the server.
* **Community Gamification Loop:**
    * **Points:** Users earn points for submitting issues.
    * **Leaderboard:** A real-time leaderboard ranks the top 10 users by points.
    * **Reward Store:** A section where users can spend their points on real-world rewards.
* **Accountability Workflow:**
    * **Public Feed & Upvoting:** A common feed where users can upvote issues to set priority.
    * **Admin Proof of Action:** Admins must upload their own photo/video "proof" to mark an issue as resolved.
    * **User Rating System:** Users can give a 1-5 star rating on the admin's work. A low rating (1-2 stars) **automatically re-opens the issue**.
* **Data & Visualization:**
    * **MongoDB Atlas:** All data is stored in a cloud-hosted NoSQL database.
    * **Leaflet Map:** The Admin Dashboard features an interactive map that displays all issues by their GPS coordinates.

---

## Technology Stack

* **Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT (jsonwebtoken), bcryptjs, Multer
* **Frontend:** React (Vite), JavaScript (ES6+), Axios, React Leaflet
* **Development:** `dotenv` for environment variables, `nodemon` for live server reload.

---

## How to Run This Project

You must have two terminals running at the same time: one for the backend and one for the frontend.

### 1. Run the Backend Server

```bash
# 1. Navigate to the backend folder
cd civic-sync-backend

# 2. Install all dependencies
npm install

# 3. Create a .env file and add your MONGO_URI and JWT_SECRET
# (This is already done in the local project)

# 4. Run the server
node server.js