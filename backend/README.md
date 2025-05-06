# GreenMagic E-Commerce Backend API

Backend API for the GreenMagic e-commerce platform (COD-based grocery store).

## Tech Stack

- **Node.js & Express**: For the API server
- **MySQL**: Database
- **JWT**: For authentication
- **bcrypt**: For password hashing

## Project Structure

The project follows the MVC (Model-View-Controller) pattern:

```
├── app.js                 # Main application file
├── config/                # Configuration files
│   └── db.js              # Database configuration
├── controllers/           # Route controllers
├── middlewares/           # Custom middlewares
│   └── errorHandler.js    # Error handling middleware
├── models/                # Database models
├── routes/                # API routes
│   └── healthCheck.js     # Health check routes
├── .env                   # Environment variables
└── package.json           # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- MySQL (>= 8.x)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=greenmagic_db
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h
   ```
4. Create the MySQL database:
   ```sql
   CREATE DATABASE greenmagic_db;
   ```

### Running the Application

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

- `GET /api/health`: Health check endpoint

## Phase 1 Checklist

- [x] Set up Node.js backend with Express
- [x] Connect to MySQL using mysql2
- [x] Create folder structure (MVC pattern)
- [x] Set up .env and use dotenv
- [x] Install core middlewares (CORS, body-parser, etc.)
- [x] Add error handler middleware
- [x] Add health check route 