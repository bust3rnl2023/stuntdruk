<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Stuntdruk Backend API</h1>

  <p>A production-ready Express API backend with PostgreSQL database persistence and secure JWT authentication. Optimized for deployment on Coolify.</p>

</div>

---

## Features

- **Secure User Authentication**: Sign up, Login, and Session retrieval.
- **Product Management (CRUD)**:
  - **Anonymous Users**: Read-only access to list and view products.
  - **Authenticated Users**: Full control to Add, Update, and Delete products.
- **Coolify Ready**: Designed for Traefik routing, stateless horizontal scaling, and secure data persistence.

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

## Deploying to Coolify (Self-Hosted VPS)

This project is fully optimized for **Coolify**. Follow these steps to deploy:

1. **Create a New Resource** in Coolify:
   - Select **Docker Compose** or **GitHub Repository**.
2. **Repository Details**:
   - Link your GitHub repository `https://github.com/bust3rnl2023/stuntdruk`.
3. **Environment Setup**:
   - Coolify will read the `docker-compose.yml` and detect the services.
   - Go to the **Environment Variables** tab in Coolify and configure:
     - `POSTGRES_PASSWORD`: Use a strong, secure password.
     - `POSTGRES_DB`: `stuntdruk`
     - `JWT_SECRET`: Generate a cryptographically secure random secret string.
     - `JWT_EXPIRES_IN`: `24h`
4. **Networking**:
   - Coolify automatically configures Traefik to route domain traffic to your web service.
   - Point your domain/subdomain (e.g., `api.yourdomain.com`) to the `web` service.
   - Under the web service settings, configure the destination port to `8080`. Coolify will handle SSL and route traffic appropriately.
5. **Database Persistence**:
   - The PostgreSQL container uses a named Docker volume (`pg_data`) mapped to `/var/lib/postgresql/data`. This ensures database files are kept safe between container restarts and redeployments.
