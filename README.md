# Simple Inventory Management System

A full-stack Inventory Management application developed for the technical assessment. The system provides core inventory operations including category management, product tracking, stock movements (Stock In / Stock Out), audit trail history, and an operational dashboard.

Built with a **.NET 10 Web API** following **Clean Architecture**, a **React 19 + TypeScript** frontend, and a **PostgreSQL** relational database.

---

## Prerequisites & Required Tools

Depending on how you plan to run or develop the project, make sure the following tools are installed:

### 1. For Docker Deployment (Recommended - 1-Command Startup)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+ with Docker Compose v2)
- [Git](https://git-scm.com/)

### 2. For Local Host Development (Without Docker)
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) (v10.0.100+)
- [Node.js](https://nodejs.org/) (v20.x or v22.x LTS) & **npm** (v10+)
- [PostgreSQL 16](https://www.postgresql.org/download/) (or any PostgreSQL instance / pgAdmin / DBeaver)

### 3. Recommended IDE & Extensions
- **Visual Studio Code** (or Visual Studio 2022/2025 / JetBrains Rider)
- **VS Code Extensions**:
  - *C# Dev Kit* (`ms-dotnettools.csdevkit`)
  - *Tailwind CSS IntelliSense* (`bradlc.vscode-tailwindcss`)
  - *ESLint* & *Prettier*

---

## Quick Start (Docker - Recommended)

The easiest way to run the entire stack (Database, Backend API, and Frontend) is using Docker Compose:

### 1. Start all services
```bash
docker compose up --build
```

### 2. Access the application
- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Swagger API Documentation**: [http://localhost:5000/swagger](http://localhost:5000/swagger)
- **PostgreSQL Database**: `localhost:5432` (Database: `inventory_db`, User: `postgres`, Password: `postgrespassword`)

### 3. Stop all services
```bash
docker compose down
```

---

## Running Locally Without Docker

If you prefer running the services directly on your host machine:

### Step 1: Start the Backend API
```bash
cd backend/src/InventoryManagement.Api
dotnet run
```
*The API will start at `http://localhost:5000` with Swagger UI at `http://localhost:5000/swagger`.*

### Step 2: Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*The frontend development server will start at `http://localhost:5173`.*

### Step 3: Run Automated Unit Tests
```bash
dotnet test backend/InventoryManagement.slnx
```
*Executes all xUnit test suites covering business rules, negative stock prevention, and validation.*

---

## Technology Stack

### Backend
- **C# / .NET 10 Web API**
- **Clean Architecture**:
  - `InventoryManagement.Core`: Domain entities (`Category`, `Product`, `StockMovement`), DTO records, custom domain exceptions, and service interfaces.
  - `InventoryManagement.Infrastructure`: EF Core `AppDbContext`, PostgreSQL configuration, service implementations, and automatic schema initialization/seeding.
  - `InventoryManagement.Api`: REST controllers, global exception handling middleware, Swagger documentation, and dependency injection setup.
- **Entity Framework Core 10** with Npgsql provider.
- **Swashbuckle / OpenAPI** for interactive API documentation.

### Frontend
- **React 19** with **TypeScript** (Vite build tool).
- **Tailwind CSS** for clean, responsive UI styling.
- **TanStack React Query v5** for server-state management and API caching.
- **React Router DOM v7** for client-side navigation.
- **Lucide React** for UI icons.
- **React Hot Toast** for user feedback notifications.

### Database
- **PostgreSQL 16** relational database.
- Schema definitions and sample seed data are also provided in [`database/schema.sql`](database/schema.sql).

---

## Project Structure

```text
inventory-management-system/
├── docker-compose.yml                        # Docker Compose configuration (Postgres + API + UI)
├── README.md                                 # Project documentation
├── database/
│   └── schema.sql                            # SQL schema definition and seed data
│
├── backend/                                  # .NET 10 Solution
│   ├── InventoryManagement.slnx
│   ├── Dockerfile
│   └── src/
│       ├── InventoryManagement.Core/         # Domain entities, DTOs, interfaces, exceptions
│       ├── InventoryManagement.Infrastructure/# EF Core context, repositories/services, DbInitializer
│       └── InventoryManagement.Api/          # Controllers, Program.cs, middleware, Swagger
│
└── frontend/                                 # React + TypeScript Client
    ├── Dockerfile                            # Production multi-stage build (Nginx)
    ├── nginx.conf                            # Reverse proxy config for API requests
    └── src/
        ├── api/                              # Axios API client modules
        ├── components/                       # Reusable UI components, modals, layout
        ├── hooks/                            # Custom React Query hooks
        ├── pages/                            # Dashboard, Products, Categories, Inventory
        ├── types/                            # TypeScript interfaces & DTO definitions
        └── utils/                            # Formatting & validation helper functions
```

---

## Functional Modules & Business Rules

### 1. Category Management (`/categories`)
- Full CRUD operations (View, Create, Edit, Delete).
- **Unique Name Constraint**: Category names must be unique (enforced at database and service levels).
- **Deletion Protection**: A category cannot be deleted if products are currently assigned to it.
- **Customization**: Visual category badges with custom colors and semantic icons.

### 2. Product Management (`/products`)
- Full CRUD operations with fields: SKU, Name, Description, Category, Unit Price (RM), and Low Stock Threshold.
- **Unique SKU Constraint**: Every product must have a unique SKU.
- **Category Association**: Products must belong to an existing category.
- **Instant Client-side Search & Filtering**: Filter by keyword (Name/SKU/Description), category, or stock level without full-page reloads.
- **Initial Stock Handling**: Setting an initial stock quantity automatically logs an initial `StockIn` transaction.

### 3. Inventory & Stock Movements (`/inventory`)
- Supports **Stock In** (receiving inventory) and **Stock Out** (dispatching inventory).
- **Negative Stock Prevention**: Stock Out operations validate available inventory before execution. If requested quantity exceeds stock balance, the transaction is rejected.
- **Transactional Integrity**: Uses database transactions to ensure stock balance updates and audit logs are committed atomically.
- **Audit Trail**: Every transaction records `BalanceBefore`, `BalanceAfter`, `Quantity`, `MovementType`, `Remarks`, and a UTC timestamp.

### 4. Operational Dashboard (`/`)
- Key performance metrics: Total Products, Total Categories, Total Stock Units, Total Inventory Valuation (RM), Outbound Units Sold, and Low Stock Alerts.
- **Bestsellers Ranking**: Visual volume bars showing top-selling products by units and revenue, filterable by category.
- **Recent Activity**: Quick view of the 6 most recent stock movements.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Get all categories with assigned product count |
| `GET` | `/api/categories/{id}` | Get single category details |
| `POST` | `/api/categories` | Create a category (validates unique name) |
| `PUT` | `/api/categories/{id}` | Update category details |
| `DELETE` | `/api/categories/{id}` | Delete category (prevented if products exist) |
| `GET` | `/api/products` | List products (query params: `search`, `categoryId`, `stockStatus`) |
| `GET` | `/api/products/{id}` | Get single product details |
| `POST` | `/api/products` | Create product (validates unique SKU, records initial stock) |
| `PUT` | `/api/products/{id}` | Update product details |
| `DELETE` | `/api/products/{id}` | Delete product |
| `GET` | `/api/inventory/movements` | List stock movement history (optional filter: `productId`) |
| `POST` | `/api/inventory/movement` | Record a Stock In or Stock Out movement |
| `GET` | `/api/dashboard/summary` | Get aggregated dashboard metrics, bestsellers, and recent logs |

---

## Assumptions & Design Decisions

1. **Automatic Database Seeding**:
   - On application startup, `DbInitializer.cs` automatically creates the PostgreSQL schema and seeds starter categories, products, and movement logs if the database is empty.
2. **Currency Unit**:
   - Monetary values are formatted in Malaysian Ringgit (`RM`) with standard 2 decimal places.
3. **Soft vs. Hard Deletion**:
   - Categories enforce referential integrity and block deletion if products exist.
   - Deleting a product cascades to its associated stock movement history records.
4. **Client-Side Responsiveness**:
   - Collapsible sidebar allows users to toggle between a compact icon-rail view and full navigation, adapting the page container width for broader table views.
