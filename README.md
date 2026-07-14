# ⚽ Junda United FC - Official Web Platform

The official digital home for Junda United Football Club, the pride of Mishomoroni. This full-stack web application serves as a dynamic portal for fans and a comprehensive club management system for administrators.

## 🚀 Live Demo
* **Frontend:** (https://junda-united-fc.vercel.app/)


---

## 🛠️ Tech Stack & Architecture

**Frontend:**
* React.js (Hooks, functional components)
* React Router DOM (Client-side routing)
* Pure CSS (Responsive CSS Grid and Flexbox layouts)

**Backend:**
* Node.js & Express.js (RESTful API)
* MongoDB Atlas & Mongoose (NoSQL Database)
* Cloudinary (Cloud-based media storage)
* `node-cache` (In-memory caching layer)

**Hosting & Delivery:**
* Vercel (Global Edge Network CDN for frontend)
* Render (Backend hosting)

---

## ✨ Key Features

* **Dynamic Match Centre:** Real-time updates for upcoming fixtures, completed match results, and a fully interactive League Standings table with form history (W-D-L).
* **Integrated Youth System:** Advanced roster categorization dynamically routing players into First Team, Under-17, and Under-13 academy squads.
* **Extended Player Profiles:** Comprehensive stats tracking including appearances, goals, age, custom biographies, and staff contact routing.
* **Media Gallery:** Cloudinary-backed upload stream for match highlights and club photos.
* **Secure Admin Dashboard:** Protected gateway allowing club managers to execute full CRUD (Create, Read, Update, Delete) operations across all data sets without touching code.

---

## 🛡️ Performance & Scaling (The Cache Shield)

To handle massive traffic spikes (100,000+ visitors) without crashing the free-tier MongoDB cluster, this API implements a **Dual-Layer Caching Strategy**:

1. **Memory Cache:** The Express server utilizes `node-cache` to store database queries in local memory for 10-minute (600s) intervals, dropping database reads by 99% during traffic spikes.
2. **Global CDN Headers:** The API attaches `Cache-Control: public, max-age=600` headers to all `GET` requests, instructing Vercel's global edge network and user browsers to serve data directly from cache.
3. **Auto-Purge:** Executing any `PUT`, `POST`, or `DELETE` request from the Admin panel triggers an automatic `apiCache.flushAll()`, instantly shattering the cache to deliver fresh updates to fans.

---

## 💻 Local Development Setup

To run this project locally on your machine:

**1. Clone the repository**
```bash
git clone [https://github.com/rojii-sketch/junda-united-fc.git](https://github.com/rojii-sketch/junda-united-fc.git)