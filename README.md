# 🚀 InsightBoard — AI-Powered Data Visualization Platform

**An open-source, AI-powered alternative to Power BI** — upload datasets, let the AI build dashboards for you, or craft them manually with a drag-and-drop builder. Share insights with your team via public links.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=spring-boot&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-4285F4?logo=google&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Key Features

### 🤖 AI-Powered Intelligence (Gemini 2.5 Flash)
- **Natural Language Queries** — Ask questions in plain English like *"show me total sales by month"* and the AI auto-creates the right chart
- **Auto-Generate Dashboard** — One-click AI analysis that examines your dataset and automatically builds a complete dashboard with 3–6 optimally chosen visualizations
- **Smart Chart Suggestions** — AI recommends the best chart types, axis mappings, and aggregations for your data
- **AI Data Summarization** — Generate professional analytical summaries of any dataset with key insights and patterns

### 📊 12 Visualization Types
Bar Chart · Line Chart · Pie Chart · Donut Chart · Area Chart · Scatter Plot · Waterfall Chart · Gauge · Funnel · Heatmap · Data Table · KPI Card

### 🛠️ Dashboard Builder
- **Drag-and-drop grid layout** with resizable widgets (powered by `react-grid-layout`)
- **Real-time configuration** — choose datasets, axes, aggregations, colors, and orientations per widget
- **Anomaly detection** — toggle IQR-based outlier highlighting on Bar, Line, and Scatter charts
- **Dashboard templates** — pre-built layouts for Sales, Finance, Marketing, and Operations
- **Inline widget renaming**, fullscreen mode, and per-widget CSV export

### 📂 Dataset Management
- Upload **CSV** and **Excel** (.xlsx/.xls) files with auto-detection of column types (Number, String, Date)
- **Data preview** with search, sorting, and pagination
- **Data profiling** — automatic statistical analysis (min, max, avg, nulls, unique values, top frequencies)

### 🔗 Sharing & Export
- **Public dashboard links** — toggle sharing and get a URL anyone can view without login
- **Embed code** — copy-paste `<iframe>` snippets to embed dashboards in any website
- **PDF export** — download the entire dashboard as a PDF
- **CSV export** — download any widget's underlying data

### 🔐 Authentication & Profile
- JWT-based signup and login with secure API routes
- User profile management and password change
- Dark mode support across all pages

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, TailwindCSS 3.4 |
| **Charts** | Recharts |
| **Layout** | react-grid-layout (responsive drag-and-drop) |
| **Export** | html2canvas + jsPDF |
| **Backend** | Spring Boot 3.2 (Java 17+) |
| **Database** | MongoDB |
| **Auth** | JWT (jjwt 0.12.5) |
| **AI** | Google Gemini API (gemini-2.5-flash) |
| **File Parsing** | Apache POI (Excel), OpenCSV (CSV) |

---

## 📋 Prerequisites

Before running the application, make sure you have:

- **Java 17+** installed ([download](https://adoptium.net/))
- **Maven 3.8+** installed ([download](https://maven.apache.org/download.cgi))
- **Node.js 18+** installed ([download](https://nodejs.org/))
- **MongoDB 5+** running on `localhost:27017` ([download](https://www.mongodb.com/try/download/community))
- **Google Gemini API Key** ([get one free](https://aistudio.google.com/app/apikey))

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/insightboard.git
cd insightboard
```

### 2. Configure the Backend

Edit `insightboard-backend/src/main/resources/application.properties`:

```properties
# MongoDB connection
spring.data.mongodb.uri=mongodb://localhost:27017/insightboard

# Your Gemini API key
gemini.api.key=YOUR_GEMINI_API_KEY_HERE
gemini.api.model=gemini-2.5-flash
```

### 3. Start MongoDB

```bash
mongod
```

### 4. Start the Backend

```bash
cd insightboard-backend
mvn spring-boot:run
```

Backend runs on **http://localhost:8080**

### 5. Start the Frontend

```bash
cd insightboard-frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

> **Note:** The Vite dev server proxies all `/api` requests to `localhost:8080` automatically, so no CORS configuration is needed during development.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/password` | Change password |

### Datasets
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/datasets/upload` | Upload CSV/Excel file (max 50MB) |
| GET | `/api/datasets` | List user's datasets |
| GET | `/api/datasets/{id}/preview` | Preview dataset rows with profiling stats |
| DELETE | `/api/datasets/{id}` | Delete a dataset |

### Dashboards
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/dashboards` | Create new dashboard |
| GET | `/api/dashboards` | List user's dashboards |
| GET | `/api/dashboards/{id}` | Get dashboard with widget configs |
| PUT | `/api/dashboards/{id}` | Save layout & widget configurations |
| POST | `/api/dashboards/{id}/share` | Toggle public sharing |
| POST | `/api/dashboards/{id}/duplicate` | Duplicate a dashboard |
| DELETE | `/api/dashboards/{id}` | Delete a dashboard |

### Charts
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/charts/data` | Get aggregated chart data (supports SUM, AVG, COUNT) |

### AI (Gemini-Powered)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/nlq` | Natural language query → chart config |
| POST | `/api/ai/suggest` | AI-recommended chart suggestions (3–6) |
| POST | `/api/ai/summarize` | Generate analytical dataset summary |

### Public (No Authentication Required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/public/dashboards/{shareId}` | View shared dashboard |
| POST | `/api/public/charts/data` | Get chart data for shared dashboard |

---

## 🎨 Pages & Routes

| Page | Route | Auth | Description |
|---|---|---|---|
| Login | `/login` | Public | Sign in with email/password |
| Signup | `/signup` | Public | Create new account |
| Datasets | `/datasets` | Protected | Upload, preview, and manage data files |
| Dashboards | `/dashboards` | Protected | List, create, duplicate, and manage dashboards |
| Dashboard Builder | `/dashboard/:id` | Protected | Drag-and-drop editor with AI NLQ search bar |
| Profile | `/profile` | Protected | Edit profile and change password |
| Dashboard Viewer | `/view/:shareId` | Public | Read-only shared dashboard view |

---

## 📁 Project Structure

```
insightboard/
├── insightboard-backend/
│   ├── src/main/java/com/insightboard/
│   │   ├── config/          # SecurityConfig, CORS configuration
│   │   ├── controller/      # AuthController, DatasetController,
│   │   │                    # DashboardController, ChartController,
│   │   │                    # AiController, PublicController
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── model/           # MongoDB document models
│   │   │                    # (User, Dataset, DatasetRow, Dashboard, DashboardWidget)
│   │   ├── repository/      # MongoDB repositories
│   │   ├── security/        # JWT utility & authentication filter
│   │   └── service/         # AiService, AuthService, ChartService,
│   │                        # DashboardService, DatasetService
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── insightboard-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/      # 13 chart components (Bar, Line, Pie, Donut,
│   │   │   │                # Area, Scatter, Waterfall, Gauge, Funnel,
│   │   │   │                # Heatmap, HorizontalBar, Table, KPI)
│   │   │   └── layout/      # Navbar, AppLayout
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── pages/           # Login, Signup, Datasets, DashboardsList,
│   │   │                    # DashboardBuilder, DashboardViewer, Profile
│   │   ├── services/        # Axios API client (api.js)
│   │   └── utils/           # Utility functions
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── sample-data/             # Sample CSV files for testing
│   ├── employee_data.csv
│   ├── orders_with_dates.csv
│   └── sales_data.csv
│
└── README.md
```

---

## 🗃️ Database Schema (MongoDB)

| Collection | Fields |
|---|---|
| **users** | `email`, `password` (hashed), `name`, `createdAt` |
| **datasets** | `name`, `fileName`, `userId`, `rowCount`, `columns[]` (name, dataType), `createdAt` |
| **dataset_rows** | `datasetId`, `rowData` (dynamic key-value map) |
| **dashboards** | `name`, `userId`, `shareId`, `isPublic`, `widgets[]` (type, config, position), `createdAt`, `updatedAt` |

---

## 🧪 Sample Data

The `sample-data/` directory contains CSV files you can upload to test the platform:

| File | Description |
|---|---|
| `sales_data.csv` | Sales records with products, regions, and revenue |
| `orders_with_dates.csv` | Order data with date columns for time-series analysis |
| `employee_data.csv` | Employee records for HR analytics |

---

## 🤖 How the AI Works

InsightBoard uses the **Google Gemini API** to power three intelligent features:

1. **Natural Language Query (NLQ):** You type a question → the AI receives the question + your dataset's column schema → it returns a JSON config specifying the optimal chart type, axes, and aggregation → a widget is auto-created on your dashboard.

2. **Auto-Suggest Charts:** When triggered, the AI analyzes your dataset schema + a sample of actual data rows → returns 3–6 optimized chart configurations ranked by analytical value.

3. **Dataset Summarization:** The AI receives statistical profile data (row counts, column stats, null rates) → generates a professional 3–4 sentence analytical summary.

All AI prompts use a low temperature (0.2) for consistent, reliable outputs.

---

## 📝 License

MIT License — free to use, modify, and distribute.
