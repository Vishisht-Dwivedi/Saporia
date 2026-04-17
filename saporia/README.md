## Author

**Vishisht Dwivedi , 24U020141 , CSE-2** <br>
**Aditya Chaurasia , 24U020143 , CSE-2** 

---

# Saporia — Food Delivery App

A full-stack food delivery web application built with **Next.js 16**, **Prisma ORM**, **PostgreSQL**, and **WebSockets** for real-time order tracking.

---

## Website Screenshots

<table>
  <tr>
    <th>Map View</th>
    <th>Restaurant View</th>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/d9a98415-a9e1-4253-8ba8-ad4634446bb9" width="400"/></td>
    <td><img src="https://github.com/user-attachments/assets/d5a78de2-7e86-4aec-b951-e3f06387eb70" width="400"/></td>
  </tr>
</table>

---

## Tech Stack

| Layer         | Technology                           |
|---------------|--------------------------------------|
| Framework     | Next.js 16.2.2 (App Router)          |
| Language      | TypeScript 5                         |
| Styling       | Tailwind CSS 4                       |
| ORM           | Prisma 7 (with `@prisma/adapter-pg`) |
| Database      | PostgreSQL                           |
| Auth          | JWT (`jsonwebtoken`) + bcrypt        |
| Real-time     | WebSockets (`ws`)                    |
| Maps          | Leaflet                              |
| Notifications | react-hot-toast                      |
| Testing       | Playwright                           |

---

## Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **PostgreSQL** v14 or higher — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)

---

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Vishisht-Dwivedi/Saporia.git
cd saporia
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database_name>"
```

Replace `<username>`, `<password>`, and `<database_name>` with your PostgreSQL credentials.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Push Schema to Database

```bash
npx prisma db push
```

### 6. Seed the Database

```bash
npx prisma db seed
```

---

## Running the App

The app requires **two terminals** running simultaneously.

**Terminal 1 — Next.js dev server:**
```bash
npm run dev
```

**Terminal 2 — WebSocket server:**
```bash
npm run ws-server
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
saporia/
├── app/                    # Next.js App Router (pages, layouts, API routes)
│   └── generated/prisma/   # Auto-generated Prisma client (do not edit)
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seed script
├── server/
│   └── ws-server.js        # WebSocket server
├── public/                 # Static assets
├── .env                    # Environment variables (create this yourself)
├── next.config.ts
├── prisma.config.ts
└── package.json
```

---

## Scripts

| Command               | Description                          |
|-----------------------|--------------------------------------|
| `npm run dev`         | Start Next.js in development mode    |
| `npm run build`       | Create a production build            |
| `npm run start`       | Start the production server          |
| `npm run ws-server`   | Start the WebSocket server           |
| `npm run lint`        | Run ESLint                           |

---
