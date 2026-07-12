# 🏥 Arogya Seva

Arogya Seva is an AI-powered healthcare management platform designed to improve the efficiency of Primary Health Centres (PHCs) and healthcare administrators. It provides a centralized dashboard for monitoring healthcare resources, managing facility operations, and enabling data-driven decision-making.

Built as a modern full-stack web application, the platform offers separate interfaces for administrators, healthcare facilities, and citizens while integrating real-time analytics and intelligent insights.

---

## ✨ Features

### 👨‍⚕️ Facility Management

* Manage healthcare facilities and PHCs
* View facility health status
* Monitor doctor availability
* Track patient footfall

### 🛏 Resource Monitoring

* Bed availability management
* Medicine stock monitoring
* Medical test availability
* Inventory updates and redistribution

### 📊 Analytics Dashboard

* District-wise healthcare overview
* Performance indicators
* Health score monitoring
* Real-time alerts and notifications

### 🤖 AI Assistant

* Intelligent healthcare assistant
* Voice command support
* AI-powered recommendations
* Healthcare insights

### 🌍 Citizen Portal

* View nearby healthcare facilities
* Check bed availability
* Search medicine availability
* Access public health information

### 🌐 Multi-language Support

* English
* Hindi
* Bengali

---

## 🛠 Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Shadcn/UI

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL
* Neon Database
* Drizzle ORM

### Package Manager

* pnpm

---

## 📂 Project Structure

```text
Arogya-Command-Center/
│
├── artifacts/
│   ├── api-server/          # Backend API
│   ├── arogya-live/         # Main React application
│   └── mockup-sandbox/      # UI prototypes
│
├── lib/
│   ├── db/                  # Database schema
│   ├── api-client-react/    # API client
│   ├── api-spec/            # OpenAPI specification
│   └── api-zod/             # Generated Zod schemas
│
├── scripts/                 # Utility scripts & database seeding
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js 22+
* pnpm
* PostgreSQL / Neon Database
* Git

### Installation

Clone the repository:

```bash
git clone https://github.com/pan-ankita/Arogya-Command-Center.git
cd Arogya-Command-Center
```

Install dependencies:

```bash
pnpm install
```

Configure your environment variables:

```env
DATABASE_URL=your_database_connection_string
```

Seed the database:

```bash
pnpm run seed
```

Start the backend:

```bash
cd artifacts/api-server
pnpm dev
```

Start the frontend:

```bash
cd artifacts/arogya-live
pnpm dev
```

---

## 👥 Contributors

* Ankita Pan(https://github.com/pan-ankita)
* Rajashree Mondal(https://github.com/Rajashree2005-mondal)
* Shubhasri Roy(https://github.com/ShubhasriRoy)

---

## 📄 License

This project is developed for educational and hackathon purposes.
