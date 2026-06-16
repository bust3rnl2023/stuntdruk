<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Stuntdruk Backend API</h1>

  <p>A production-ready Express API backend with PostgreSQL database persistence and secure JWT authentication. Optimized for deployment on Easypanel.</p>

</div>

---

## Features

- **Secure User Authentication**: Sign up, Login, and Session retrieval.
- **Product Management (CRUD)**:
  - **Anonymous Users**: Read-only access to list and view products.
  - **Authenticated Users**: Full control to Add, Update, and Delete products.
- **Easypanel Ready**: Designed for Traefik routing, stateless horizontal scaling, and secure data persistence.

---

## Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: PostgreSQL (v15)
- **Security**: Helmet, BCryptJS, JSON Web Tokens (JWT), CORS
- **Deployment**: Docker & Docker Compose

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required | Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No | `{ "username", "email", "password" }` |
| `POST` | `/api/auth/login` | Login user & return JWT | No | `{ "email", "password" }` |
| `GET` | `/api/auth/me` | Fetch active user's details | Yes (Bearer Token) | *None* |

### Products
| Method | Endpoint | Description | Auth Required | Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Get list of all products | No | *None* |
| `GET` | `/api/products/:id` | Get details of a single product | No | *None* |
| `POST` | `/api/products` | Create a new product | Yes (Bearer Token) | `{ "name", "description", "price", "stock_quantity" }` |
| `PUT` | `/api/products/:id` | Update an existing product | Yes (Bearer Token) | `{ "name", "description", "price", "stock_quantity" }` (All optional) |
| `DELETE` | `/api/products/:id` | Delete a product | Yes (Bearer Token) | *None* |

---

## Environment Variables

Create a `.env` file in the root of the project. A template is provided in [.env.example](file:///C:/Users/basti/Documents/antigravity/vibrant-nobel/.env.example):

```bash
PORT=8080
DATABASE_URL=postgres://postgres:secure_password@db:5432/stuntdruk
JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=24h
```

---

## Run Locally (Development)

### Prerequisite: PostgreSQL
Make sure you have a running PostgreSQL database and update the `.env` variables accordingly.

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Migrations & Start Server**:
   ```bash
   npm run dev
   ```

---

## Deploying to Easypanel (Self-Hosted VPS)

This project is fully optimized for **Easypanel**. You can deploy it using the **Compose Service** feature:

1. **Create a New Project** in Easypanel:
   - Navigate to your Easypanel dashboard and click **Create Project**. Name it (e.g., `stuntdruk`).
2. **Create a Compose Service**:
   - Inside the project, click **Create Service** and select **Compose Service**.
3. **Repository Details**:
   - Select **Git** as the source type and enter your repository details:
     - Repository: `https://github.com/bust3rnl2023/stuntdruk`
     - Branch: `main`
   - Easypanel will automatically read the `docker-compose.yml` file from the root.
4. **Configure Environment Variables**:
   - In the service configuration under the **Environment** tab, define the required variables:
     - `POSTGRES_PASSWORD`: A strong, secure password.
     - `POSTGRES_DB`: `stuntdruk`
     - `JWT_SECRET`: A long, random secret for token signing.
     - `JWT_EXPIRES_IN`: `24h`
5. **Domain Binding & Routing**:
   - Once the services are running, go to the **Domains** tab in the Easypanel service dashboard.
   - Add your custom domain (e.g., `api.yourdomain.com`).
   - Map it to the `web` container on the internal port `8080`.
   - Easypanel's built-in Traefik proxy will handle SSL certificates via Let's Encrypt and route all traffic to the Express API container internally without exposing the raw port publicly.
6. **Data Persistence**:
   - The PostgreSQL service uses a named Docker volume (`pg_data`) which Easypanel mounts securely to ensure data remains persistent between updates and redeployments.
