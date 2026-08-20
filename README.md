# 📦 Inventory Management System (Full-Stack Monorepo)

A production-grade, full-stack Inventory Management System built with **React 19 + TypeScript** on the frontend, a **.NET 10 Web API** implementing **Clean Architecture** on the backend, and **PostgreSQL 16** for relational persistence.

---

## 🚀 Quickstart: One-Command Startup (Docker)

To build and run the entire stack (PostgreSQL + .NET 10 API + React Frontend + Nginx):

```bash
docker compose up --build
```

### 🌐 Service Endpoints:
| Service | URL | Description |
|---|---|---|
| 🖥️ **Frontend Web Application** | [http://localhost:3000](http://localhost:3000) | Full UI (Dashboard, Products, Categories, Stock Movements) |
| ⚡ **Backend API & Swagger** | [http://localhost:5000/swagger](http://localhost:5000/swagger) | Interactive OpenAPI documentation to test all endpoints |
| 🐘 **PostgreSQL Database** | `localhost:5432` | Auto-migrated and seeded relational database |

To stop all services:
```bash
docker compose down
```

---

## 🛠️ Technology Stack

### Backend
- **Language & Runtime**: C# 13 / .NET 10 Web API
- **Architecture**: **Clean Architecture (Mandatory)**
  - `InventoryManagement.Core`: Domain Entities, DTOs, Custom Exceptions, Service Interfaces.
  - `InventoryManagement.Infrastructure`: EF Core `AppDbContext`, Npgsql PostgreSQL provider, `DbInitializer` auto-seeder, Service implementations.
  - `InventoryManagement.Api`: REST Controllers, Global Exception Middleware, Swagger/OpenAPI, CORS.
- **ORM**: Entity Framework Core 10
- **Database**: PostgreSQL 16
- **Dependency Injection**: Built-in .NET IoC Container

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State & Caching**: TanStack React Query v5
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## 🏛️ System & Monorepo Structure

```text
inventory-management-system/
├── docker-compose.yml                        # 🚀 1-command startup (Postgres + Backend + Frontend)
├── README.md                                 # Complete documentation
│
├── backend/                                  # .NET 10 Web API Solution
│   ├── InventoryManagement.slnx
│   ├── Dockerfile                            # Multi-stage .NET 10 build
│   └── src/
│       ├── InventoryManagement.Core/         # Domain Entities, DTOs, Interfaces, Exceptions
│       ├── InventoryManagement.Infrastructure/# EF Core, DbContext, Services, Auto-seeder
│       └── InventoryManagement.Api/          # Controllers, Program.cs, Middleware, Swagger
│
└── frontend/                                 # React + TypeScript Web Application
    ├── Dockerfile                            # Multi-stage React + Nginx Alpine build
    ├── nginx.conf                            # High-performance reverse proxy
    └── src/
        ├── api/                              # Axios API client & endpoints (Live REST calls)
        ├── components/                       # Common UI, Modals, Badges, Layout
        ├── hooks/                            # React Query custom hooks
        ├── pages/                            # Dashboard, Products, Categories, Inventory
        ├── types/                            # TypeScript interfaces
        └── utils/                            # Formatters, validators, category styling
```

---

## 📋 Features & Business Rules

### 1. Category Management (`/categories`)
- **CRUD Operations**: Create, Read, Update, Delete categories.
- **Visual Themes**: Customizable semantic icons (16 options) and curated color palettes (8 options).
- **Business Rules**:
  - Category names **must be unique** (enforced in database unique index and API service).
  - Deletion guard: Categories containing active products **cannot be deleted**.

### 2. Product Management (`/products`)
- **CRUD Operations**: Create, Read, Update, Delete products.
- **Fields**: SKU, Name, Description, Category, Unit Price, Low Stock Threshold, Stock Balance.
- **Instant Search & Filter**: 0ms local client-side search with category and stock level filters.
- **Business Rules**:
  - SKU **must be unique** (enforced by unique database constraint).
  - Product must belong to an existing category.
  - Initial stock intake automatically generates an initial `StockIn` audit record in PostgreSQL.

### 3. Inventory & Stock Movement (`/inventory`)
- **Stock In (+)**: Adds inventory with supplier/batch reference.
- **Stock Out (-)**: Dispatches inventory with sales order reference.
- **Audit Trail**: Complete immutable log tracking `BalanceBefore`, `BalanceAfter`, `Quantity`, `MovementType`, `Remarks`, and UTC `Timestamp`.
- **Business Rules**:
  - **Negative Stock Protection**: Stock balance cannot become negative under any circumstance.
  - **Transactional Consistency**: ACID database transactions ensure stock balance and audit records update atomically.

### 4. Dashboard & Analytics (`/`)
- **KPI Metrics**: Total Products, Total Categories, Total Stock Units, Inventory Valuation ($), Outbound Units Sold, Low Stock Alerts.
- **Bestseller Ranking**: Ranked bestsellers with visual volume progress bars, unit sales, and revenue generated.
- **Interactive Category Tabs**: Filter bestseller performance by individual category.
- **Recent Audit Trail**: Live list of latest 6 transactions directly queried from PostgreSQL.

---

## 💻 Local Development (Without Docker)

### 1. Run the Backend API:
```bash
cd backend/src/InventoryManagement.Api
dotnet run
```
*API will run at `http://localhost:5000` (Swagger UI at `http://localhost:5000/swagger`).*

### 2. Run the Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend will run at `http://localhost:5173`.*

---

## 🛡️ API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Get all categories with product counts |
| `POST` | `/api/categories` | Create a new category (unique name check) |
| `PUT` | `/api/categories/{id}` | Update category details |
| `DELETE` | `/api/categories/{id}` | Delete category (blocked if products exist) |
| `GET` | `/api/products` | Get products (supports `search`, `categoryId`, `stockStatus`) |
| `POST` | `/api/products` | Create product (unique SKU check, optional initial stock) |
| `PUT` | `/api/products/{id}` | Update product details |
| `DELETE` | `/api/products/{id}` | Delete product |
| `GET` | `/api/inventory/movements` | Retrieve audit trail of stock movements |
| `POST` | `/api/inventory/movement` | Record Stock In / Stock Out (atomic balance update) |
| `GET` | `/api/dashboard/summary` | Get aggregated dashboard metrics & bestsellers |
