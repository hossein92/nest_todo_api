# NestJS Todo Application with MongoDB and Docker

## Overview

This project is a NestJS application with MongoDB as the database, containerized using Docker. The application includes multiple environments (development, staging, and production) with environment-specific configurations.

## Features

- **Authentication:** JWT-based authentication.
- **Todos Management:** Create, update, delete, and retrieve todos.
- **MongoDB:** Integrated with MongoDB for data persistence.
- **Caching:** Caching implemented using `@nestjs/cache-manager`.
- **Docker:** Fully containerized application for easy deployment.
- **Environment Configuration:** Environment-specific configurations using `.env` files.

## Prerequisites

- **Docker:** Make sure Docker is installed on your machine.
- **Docker Compose:** Ensure Docker Compose is installed for orchestrating multi-container Docker applications.

## Project Structure

- **`src/`**: Contains the source code of the application.
  - **`auth/`**: Authentication module and related files.
  - **`todos/`**: Todos module and related files.
  - **`users/`**: Users module and related files.
  - **`common/`**: Common utilities and services.
- **`Dockerfile`**: Dockerfile for building the application container.
- **`docker-compose.yml`**: Docker Compose configuration for different environments.
- **`.env.*`**: Environment-specific configuration files.

## Getting Started

### Cloning the Repository

```bash
git clone https://github.com/hossein92/nest_todo_api.git
cd nest_todo_api
```

### Setting Up Environment Variables

Create environment-specific `.env` files (e.g., `.env.stage`, `.env.development`, `.env.production`) in the root directory:

**Example `.env.stage`:**

```env
MONGO_URL=mongodb://mongo:27017/stage_db
NODE_ENV=stage
JWT_SECRET=your_jwt_secret
```

**Example `.env.development`:**

```env
MONGO_URL=mongodb://mongo:27017/development_db
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

**Example `.env.production`:**

```env
MONGO_URL=mongodb://mongo:27017/production_db
NODE_ENV=production
JWT_SECRET=your_jwt_secret
```

### Running the Application

You can run the application in different environments using Docker Compose.

#### Development

```bash
docker-compose up --build app-development
```

#### Staging

```bash
docker-compose up --build app-staging
```

#### Production

```bash
docker-compose up --build app-production
```

### Accessing the Application

- **Development:** `http://localhost:3002`
- **Staging:** `http://localhost:3001`
- **Production:** `http://localhost:3000`

### Testing

**Database Handling**: The test ensures that your MongoDB database is correctly initialized and cleaned up after tests.

**Create `.env.test`:**

```env
MONGO_URL=mongodb://mongo:27017/test_db
NODE_ENV=production
JWT_SECRET=your_jwt_secret
```

Run unit tests using Jest:

```bash
npm run test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

### Caching

Caching is implemented using `@nestjs/cache-manager`. The cache is automatically invalidated when creating, updating, or deleting a todo.

### Database Indexing

For performance optimization, database indexes have been implemented. Ensure MongoDB collections are indexed according to your application's requirements.

### Docker Cleanup

To stop and remove all running containers:

```bash
docker-compose down
```

To remove unused Docker images and containers:

```bash
docker system prune -a
```

## Troubleshooting

- **MongoDB Connection Issues:** Ensure that the `MONGO_URL` in your `.env` files is correctly set and that the MongoDB service is running.
- **Port Conflicts:** If the ports (3000, 3001, 3002) are already in use, modify the `docker-compose.yml` file to use different ports.

## API Documentation with Swagger

This project uses [Swagger](https://swagger.io/) to generate interactive API documentation.

### Accessing Swagger UI

After running the application, you can access the Swagger UI in your web browser at the following URLs, depending on the environment:

- **Development:** `http://localhost:3002/open_api`
- **Staging:** `http://localhost:3001/open_api`
- **Production:** `http://localhost:3000/open_api`

## Contributing

Feel free to fork this repository and submit pull requests. Contributions are welcome!

## License

This project is licensed under the MIT License.
