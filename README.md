# Hotel Listing Application

This is a full-stack application for managing hotel listings. It provides a simple interface to view, create, update, and delete hotel entries.

## Technology Stack

This project is a monorepo managed with `pnpm` workspaces.

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **API:** GraphQL with `@apollo/server`
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma

### Frontend
- **Framework:** Angular
- **Language:** TypeScript
- **GraphQL Client:** Apollo Angular

### DevOps
- **Containerization:** Docker
- **Orchestration:** Kubernetes (Amazon EKS)
- **CI/CD:** GitHub Actions
- **Database Setup:** Docker Compose

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v10.13.1 or later)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd hotel-list
    ```

2.  **Install dependencies:**
    Run `pnpm install` from the root of the project. This will install dependencies for both the `api` and `web` packages.
    ```bash
    pnpm install
    ```
    *Note: The first time you run this, `pnpm` may ask you to approve build scripts for certain packages like Prisma and esbuild. This is expected and required for them to function correctly.*

## Running the Application

The application requires a running PostgreSQL database and both the backend and frontend servers to be active.

1.  **Start the Database:**
    A Docker Compose setup is provided for convenience. From the root of the project, run:
    ```bash
    docker compose -f database/compose.yaml up -d
    ```
    This will start a PostgreSQL container with persistent data stored in a Docker volume.

2.  **Apply Database Migrations:**
    Before starting the backend, apply the database schema using Prisma Migrate.
    ```bash
    pnpm --filter api exec prisma migrate dev
    ```

3.  **Start the Backend API:**
    In a new terminal, navigate to the `api` package and start the server.
    ```bash
    pnpm --filter api start
    ```
    The GraphQL server will be running at `http://localhost:4000/graphql`.

4.  **Start the Frontend Application:**
    In another terminal, navigate to the `web` package and start the Angular development server.
    ```bash
    pnpm --filter web start
    ```
    The frontend will be available at `http://localhost:4200`.

## Building for Production

The provided `Dockerfile` is a multi-stage build that creates optimized production images for both the backend and frontend.

-   **Build the API image:**
    ```bash
    docker build -t hotel-list-api --target api .
    ```
-   **Build the Web image:**
    ```bash
    docker build -t hotel-list-web --target web .
    ```

## CI/CD

This project includes a GitHub Actions workflow (`.github/workflows/deploy.yaml`) that automates the following on every push to the `main` branch:
1.  Detects which package (`api` or `web`) has changed.
2.  Builds a Docker image for the changed package.
3.  Pushes the image to Amazon ECR.
4.  Deploys the new image to an Amazon EKS cluster.

For this to work, you must configure the required secrets in your GitHub repository settings.